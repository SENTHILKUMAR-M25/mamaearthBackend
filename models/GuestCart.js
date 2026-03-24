// models/GuestCart.js
const mongoose = require("mongoose");

const GuestCartSchema = new mongoose.Schema({
  sessionId: { type: String, required: true }, // unique guest identifier (can be a UUID)
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1 },
});

module.exports = mongoose.model("GuestCart", GuestCartSchema);