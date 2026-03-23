

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");




router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if(user) return res.status(400).json({ msg: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ msg: "User registered successfully", userId: user.userId, name: user.name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});





router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, "secretkey", { expiresIn: "1d" });

        res.json({ 
            token, 
            user: { 
                userId: user.userId, 
                name: user.name, 
                email: user.email 
            } 
        });
    } catch (err) {
        console.error("Login route error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;