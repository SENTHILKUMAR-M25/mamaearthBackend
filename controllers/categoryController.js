const Category = require("../models/Category");

// 🔢 Generate CAT-001
const generateCategoryId = async () => {
  const last = await Category.findOne().sort({ createdAt: -1 });

  if (!last || !last.categoryId) return "CAT-001";

  const num = parseInt(last.categoryId.split("-")[1]) + 1;
  return `CAT-${String(num).padStart(3, "0")}`;
};

exports.createCategory = async (req, res) => {
  try {
    const categoryId = await generateCategoryId();

    const category = await Category.create({
      categoryId,
      name: req.body.name,
      disc: req.body.disc,   // ✅ ADD THIS
      image: req.file ? req.file.filename : "",
    });

    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📥 READ
exports.getCategories = async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
};

// ✏️ UPDATE
// exports.updateCategory = async (req, res) => {
//   try {
//     const updated = await Category.findByIdAndUpdate(
//       req.params.id,
//       {
//         name: req.body.name,
//         ...(req.file && { image: req.file.filename }),
//       },
//       { new: true }
//     );

//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



exports.updateCategory = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        disc: req.body.disc,   // ✅ ADD THIS
        ...(req.file && { image: req.file.filename }),
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ DELETE
exports.deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
};