const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const auth = require("../middleware/auth");

// Add product to cart
router.post("/add", auth, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    let existing = await Cart.findOne({ userId, product: productId });
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
    } else {
      await Cart.create({ userId, product: productId, quantity });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// Get cart items for user
router.get("/", auth, async (req, res) => {
  try {
    const items = await Cart.find({ userId: req.user.id }).populate("product");
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// Update quantity
router.put("/update/:id", auth, async (req, res) => {
  const { quantity } = req.body;
  try {
    await Cart.findByIdAndUpdate(req.params.id, { quantity });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// Remove item
router.delete("/remove/:id", auth, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;