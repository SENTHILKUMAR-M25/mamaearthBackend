const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    // ✅ CATEGORY FIELD (IMPORTANT)
    category: {
      type: String,
      required: true,
    },

    subcategory: String,
    label: String,
    highlight: String,
    subHighlight: String,
    features: [String],
    volume: String,
    rating: Number,
    reviews: Number,
    price: Number,
    originalPrice: Number,
    image: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);