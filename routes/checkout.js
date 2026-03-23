const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

router.post("/", async (req, res) => {
  try {
    const { name, contact, email, address, pincode, cart, total } = req.body;
    const order = await Order.create({ name, contact, email, address, pincode, cart, total });
    res.status(201).json({ success: true, orderId: order._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;