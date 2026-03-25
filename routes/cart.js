const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const GuestCart = require("../models/GuestCart");
const Product = require("../models/Product");

// Helper → get userId from token
const getUserId = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;

  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64"));
    return payload.id;
  } catch {
    return null;
  }
};

// ---------------- CONSTANT ----------------
const RESERVED = 2; // Items reserved in store

// ================= ADD TO CART =================
router.post("/add", async (req, res) => {
  const { productId, quantity = 1, sessionId } = req.body;
  const userId = getUserId(req);

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    const availableStock = product.quantity - RESERVED;

    if (quantity > availableStock)
      return res.status(400).json({ msg: "Out of stock" });

    // -------- LOGGED-IN USER --------
    if (userId) {
      let existing = await Cart.findOne({ userId, product: productId });

      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > availableStock)
          return res.status(400).json({ msg: "Stock limit reached" });

        existing.quantity = newQty;
        await existing.save();
      } else {
        await Cart.create({ userId, product: productId, quantity });
      }

      return res.json({ success: true });
    }

    // -------- GUEST USER --------
    let existingGuest = await GuestCart.findOne({ sessionId, product: productId });

    if (existingGuest) {
      const newQty = existingGuest.quantity + quantity;
      if (newQty > availableStock)
        return res.status(400).json({ msg: "Stock limit reached" });

      existingGuest.quantity = newQty;
      await existingGuest.save();
    } else {
      await GuestCart.create({ sessionId, product: productId, quantity });
    }

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= GET CART =================
router.get("/", async (req, res) => {
  const userId = getUserId(req);
  const sessionId = req.headers["x-session-id"];

  try {
    if (userId) {
      const userCart = await Cart.find({ userId }).populate("product");
      return res.json(userCart);
    }

    const guestCart = await GuestCart.find({ sessionId }).populate("product");
    res.json(guestCart);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= UPDATE QUANTITY =================
router.put("/update/:id", async (req, res) => {
  const { quantity } = req.body;
  const userId = getUserId(req);

  try {
    let item = userId
      ? await Cart.findById(req.params.id).populate("product")
      : await GuestCart.findById(req.params.id).populate("product");

    if (!item) return res.status(404).json({ msg: "Item not found" });

    if (quantity < 1) return res.status(400).json({ msg: "Minimum 1 required" });

    const availableStock = item.product.quantity - RESERVED;

    if (quantity > availableStock)
      return res.status(400).json({ msg: "Stock exceeded" });

    item.quantity = quantity;
    await item.save();

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= REMOVE ITEM =================
router.delete("/remove/:id", async (req, res) => {
  const userId = getUserId(req);

  try {
    if (userId) await Cart.findByIdAndDelete(req.params.id);
    else await GuestCart.findByIdAndDelete(req.params.id);

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= MERGE GUEST CART =================
router.post("/merge", async (req, res) => {
  const sessionId = req.headers["x-session-id"];
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ msg: "Unauthorized" });

  try {
    const guestItems = await GuestCart.find({ sessionId });
    let warnings = [];

    for (let item of guestItems) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      const availableStock = product.quantity - RESERVED;

      let existing = await Cart.findOne({ userId, product: item.product });
      const requestedQty = (existing ? existing.quantity : 0) + item.quantity;

      if (requestedQty > availableStock) {
        const allowedQty = Math.max(availableStock, 0);

        if (existing) {
          existing.quantity = allowedQty;
          await existing.save();
        } else if (allowedQty > 0) {
          await Cart.create({
            userId,
            product: item.product,
            quantity: allowedQty,
          });
        }

        warnings.push({
          productId: item.product,
          msg: `Stock limited. Quantity adjusted to ${allowedQty}`,
        });

      } else {
        if (existing) {
          existing.quantity = requestedQty;
          await existing.save();
        } else {
          await Cart.create({
            userId,
            product: item.product,
            quantity: item.quantity,
          });
        }
      }
    }

    await GuestCart.deleteMany({ sessionId });

    res.json({ success: true, warnings });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Merge failed" });
  }
});

module.exports = router;