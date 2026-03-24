// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");




// router.post("/register", async (req, res) => {
//     const { name, email, password } = req.body;
//     try {
//         let user = await User.findOne({ email });
//         if(user) return res.status(400).json({ msg: "User already exists" });

//         const hashedPassword = await bcrypt.hash(password, 10);

//         user = new User({ name, email, password: hashedPassword });
//         await user.save();

//         res.status(201).json({ msg: "User registered successfully", userId: user.userId, name: user.name });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ msg: "Server error" });
//     }
// });





// router.post("/login", async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (!user) return res.status(400).json({ msg: "Invalid credentials" });

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

//         const token = jwt.sign({ id: user._id }, "secretkey", { expiresIn: "1d" });

//         res.json({ 
//             token, 
//             user: { 
//                 userId: user.userId, 
//                 name: user.name, 
//                 email: user.email 
//             } 
//         });
//     } catch (err) {
//         console.error("Login route error:", err);
//         res.status(500).json({ msg: "Server error" });
//     }

// });

// // ================= GET ALL USERS =================
// router.get("/", async (req, res) => {
//   try {
//     const users = await User.find().sort({ createdAt: -1 });
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// // ================= USER COUNT =================
// router.get("/count", async (req, res) => {
//   try {
//     const count = await User.countDocuments();
//     res.json({ count });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// module.exports = router;




const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Load JWT secret from environment or fallback
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// ------------------- REGISTER -------------------
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please provide all required fields" });
  }

  try {
    // Check if user exists
    let existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Sign JWT (include name for frontend convenience)
    const token = jwt.sign(
      { id: newUser._id, name: newUser.name, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      msg: "User registered successfully",
      token,
      user: { userId: newUser.userId, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    console.error("Register route error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ------------------- LOGIN -------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ msg: "Please provide email and password" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Sign JWT with user info
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      msg: "Login successful",
      token,
      user: { userId: user.userId, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login route error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ------------------- GET ALL USERS -------------------
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ------------------- USER COUNT -------------------
router.get("/count", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("User count error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;