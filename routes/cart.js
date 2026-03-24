const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ---------------- ADD TO CART (guest or logged-in) ----------------
router.post("/add", async (req, res) => {
  const { productId, quantity = 1, userId = null } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, msg: "Product not found" });

    if (quantity > product.quantity)
      return res.status(400).json({ success: false, msg: "Out of stock" });

    // Check if item exists
    let existing = await Cart.findOne({ product: productId, userId });
    if (existing) {
      let newQty = existing.quantity + quantity;
      if (newQty > product.quantity)
        return res.status(400).json({ success: false, msg: "Cannot add more than stock" });

      existing.quantity = newQty;
      await existing.save();
    } else {
      await Cart.create({ product: productId, quantity, userId });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// ---------------- GET CART ----------------
router.get("/", async (req, res) => {
  let userId = null;
  const token = req.headers.authorization?.split(" ")[1];

  // Extract userId from token if exists
  if (token) {
    try {
      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64"));
      userId = payload.id;
    } catch {}
  }

  try {
    let items = [];

    if (userId) {
      // Logged-in user
      const userCart = await Cart.find({ userId }).populate("product");
      const guestCart = await Cart.find({ userId: null }).populate("product");

      // Merge guest cart into user cart
      for (let guestItem of guestCart) {
        const existing = userCart.find(
          (item) => item.product._id.toString() === guestItem.product._id.toString()
        );

        if (existing) {
          let totalQty = existing.quantity + guestItem.quantity;
          if (totalQty > guestItem.product.quantity) totalQty = guestItem.product.quantity;
          existing.quantity = totalQty;
          await existing.save();
          await guestItem.deleteOne();
        } else {
          guestItem.userId = userId;
          await guestItem.save();
          userCart.push(guestItem);
        }
      }

      items = userCart;
    } else {
      // Guest cart
      items = await Cart.find({ userId: null }).populate("product");
    }

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ---------------- UPDATE QUANTITY ----------------
router.put("/update/:id", async (req, res) => {
  const { quantity } = req.body;

  try {
    const cartItem = await Cart.findById(req.params.id).populate("product");
    if (!cartItem) return res.status(404).json({ success: false, msg: "Item not found" });

    if (quantity < 1) return res.status(400).json({ success: false, msg: "Quantity cannot be less than 1" });

    if (quantity > cartItem.product.quantity)
      return res.status(400).json({ success: false, msg: "Cannot exceed stock" });

    cartItem.quantity = quantity;
    await cartItem.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ---------------- REMOVE ITEM ----------------
router.delete("/remove/:id", async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
