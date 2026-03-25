const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Cart = require("../models/Cart");
const GuestCart = require("../models/GuestCart");
const Product = require("../models/Product");

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// 🔥 MERGE GUEST CART
const mergeGuestCart = async (userId, sessionId) => {
  if (!sessionId) return;

  const guestItems = await GuestCart.find({ sessionId });

  for (let item of guestItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    let existing = await Cart.findOne({
      userId,
      product: item.product,
    });

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + item.quantity,
        product.quantity
      );
      await existing.save();
    } else {
      await Cart.create({
        userId,
        product: item.product,
        quantity: Math.min(item.quantity, product.quantity),
      });
    }
  }

  await GuestCart.deleteMany({ sessionId });
};

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  const { name, email, password, sessionId } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    await mergeGuestCart(user._id, sessionId);

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      msg: "Registered successfully",
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { email, password, sessionId } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    await mergeGuestCart(user._id, sessionId);

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      msg: "Login successful",
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
      },
    });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= GET USERS =================
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= DELETE USER =================
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Cart.deleteMany({ userId: req.params.id });

    res.json({ msg: "User deleted" });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;