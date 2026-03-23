// const mongoose = require("mongoose");

// const OrderSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   name: { type: String, required: true },
//   contactNumber: { type: String, required: true },
//   email: { type: String, required: true },
//   address: { type: String, required: true },
//   pincode: { type: String, required: true },
//   products: [
//     {
//       productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
//       name: { type: String },
//       quantity: { type: Number, default: 1 },
//       price: { type: Number },
//     },
//   ],
//   totalAmount: { type: Number, required: true },
//   status: { type: String, default: "Pending" },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Order", OrderSchema);


const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: { type: String },
      quantity: { type: Number, default: 1 },
      price: { type: Number },
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);