const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ------------------ MIDDLEWARE ------------------
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ------------------ ROUTES ------------------
app.use("/api/auth", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/subcategories", require("./routes/subcategoryRoutes"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
// ------------------ DATABASE CONNECTION ------------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); 
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); 
  }
};

connectDB();

// ------------------ SERVER START ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));