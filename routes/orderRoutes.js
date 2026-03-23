const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");

// Create Order
router.post("/checkout", async (req, res) => {
  try {
    const { userId, name, contactNumber, email, address, pincode, products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = products.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = new Order({
      userId,
      name,
      contactNumber,
      email,
      address,
      pincode,
      products,
      totalAmount,
    });

    await order.save();

    // Optional: Clear user's cart after checkout
    await User.findByIdAndUpdate(userId, { cart: [] });

    res.status(201).json({ message: "Order placed successfully", orderId: order._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get orders for a user
router.get("/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate("products.productId");
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;