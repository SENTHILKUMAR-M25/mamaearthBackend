const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

// ================= PLACE ORDER =================
router.post("/", auth, async (req, res) => {
  try {
    const { items } = req.body;

    console.log("Incoming Order:", req.body);

    // ✅ Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "No items in order",
      });
    }

    // ✅ Check stock & update
    for (let item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          msg: "Product not found",
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          msg: `${product.name} is out of stock`,
        });
      }

      // Reduce stock
      product.quantity -= item.quantity;
      await product.save();
    }

    // ✅ Create order
    const order = await Order.create({
      userId: req.user.id,
      items,
      totalAmount: req.body.totalAmount,
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      pincode: req.body.pincode,
    });

    // ✅ Clear cart
    await Cart.deleteMany({ userId: req.user.id });

    res.json({
      success: true,
      message: "Order placed successfully",
      order,
    });

  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
});

// ================= GET ALL ORDERS =================
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= USER ORDERS =================
router.get("/my", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;