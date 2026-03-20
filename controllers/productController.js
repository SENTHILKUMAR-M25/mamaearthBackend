const Product = require("../models/Product");

// 🔢 Generate PROD-001
const generateProductId = async () => {
  const last = await Product.findOne().sort({ createdAt: -1 });

  if (!last || !last.productId) return "PROD-001";

  const num = parseInt(last.productId.split("-")[1]) + 1;
  return `PROD-${String(num).padStart(3, "0")}`;
};

// ➕ CREATE
// exports.createProduct = async (req, res) => {
//   try {
//     const productId = await generateProductId();

//     const product = await Product.create({
//       productId,
//       name: req.body.name,

//       // ✅ ADD THIS LINE
//       category: req.body.category,

//       subcategory: req.body.subcategory,
//       label: req.body.label,
//       highlight: req.body.highlight,
//       subHighlight: req.body.subHighlight,
//       features: req.body.features ? req.body.features.split(",") : [],
//       volume: req.body.volume,
//       rating: req.body.rating,
//       reviews: req.body.reviews,
//       price: req.body.price,
//       originalPrice: req.body.originalPrice,
//       image: req.file ? req.file.filename : "",
//     });

//     res.json(product);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.createProduct = async (req, res) => {
  try {
    const productId = await generateProductId();

    const product = await Product.create({
      productId,

      name: req.body.name,

      // ✅ MUST SAVE CATEGORY
      category: req.body.category || "",

      subcategory: req.body.subcategory || "",
      label: req.body.label || "",
      highlight: req.body.highlight || "",
      subHighlight: req.body.subHighlight || "",

      // ✅ Convert features safely
      features: req.body.features
        ? req.body.features.split(",").map(f => f.trim())
        : [],

      volume: req.body.volume || "",

      // ✅ Convert numbers properly
      rating: Number(req.body.rating) || 0,
      reviews: Number(req.body.reviews) || 0,
      price: Number(req.body.price) || 0,
      originalPrice: Number(req.body.originalPrice) || 0,

      image: req.file ? req.file.filename : "",
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📥 READ ALL
exports.getProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

// 📥 SINGLE
exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
};

// exports.updateProduct = async (req, res) => {
//   try {
//     const updated = await Product.findByIdAndUpdate(
//       req.params.id,
//       {
//         ...req.body,

//         // ✅ ensure features array
//         ...(req.body.features && {
//           features: req.body.features.split(","),
//         }),

//         // ✅ ensure category update
//         category: req.body.category,

//         ...(req.file && { image: req.file.filename }),
//       },
//       { new: true }
//     );

//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// ❌ DELETE

exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        category: req.body.category, // ✅ MUST ADD
        subcategory: req.body.subcategory,
        label: req.body.label,
        highlight: req.body.highlight,
        subHighlight: req.body.subHighlight,

        features: req.body.features
          ? req.body.features.split(",").map(f => f.trim())
          : [],

        volume: req.body.volume,

        rating: Number(req.body.rating) || 0,
        reviews: Number(req.body.reviews) || 0,
        price: Number(req.body.price) || 0,
        originalPrice: Number(req.body.originalPrice) || 0,

        ...(req.file && { image: req.file.filename }),
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
};