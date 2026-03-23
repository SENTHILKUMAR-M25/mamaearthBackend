const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    subcategoryId: {
      type: String,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Link to parent category
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    disc: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subcategory", subcategorySchema);