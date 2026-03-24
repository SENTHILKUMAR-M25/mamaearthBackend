const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ GET ALL USERS
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Users Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ GET USER COUNT
router.get("/count", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("Count Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;