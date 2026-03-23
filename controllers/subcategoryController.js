const Subcategory = require("../models/Subcategory");

// 🔢 Generate SUB-001 style IDs
const generateSubcategoryId = async () => {
  const last = await Subcategory.findOne().sort({ createdAt: -1 });
  if (!last || !last.subcategoryId) return "SUB-001";

  const num = parseInt(last.subcategoryId.split("-")[1]) + 1;
  return `SUB-${String(num).padStart(3, "0")}`;
};

// ➕ Create Subcategory
exports.createSubcategory = async (req, res) => {
  try {
    const subcategoryId = await generateSubcategoryId();
    const { category, name, disc } = req.body;

    const subcategory = await Subcategory.create({
      subcategoryId,
      category, // Parent Category ID
      name,
      disc,
      image: req.file ? req.file.filename : "",
    });

    res.status(201).json(subcategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📥 Read all subcategories or filter by category
exports.getSubcategories = async (req, res) => {
  try {
    const { category } = req.query;

    let filter = {};
    if (category) filter.category = category; // Only selected category's subcategories

    const subcategories = await Subcategory.find(filter)
      .populate("category", "name"); // populate category name
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update Subcategory
exports.updateSubcategory = async (req, res) => {
  try {
    const updated = await Subcategory.findByIdAndUpdate(
      req.params.id,
      {
        category: req.body.category,
        name: req.body.name,
        disc: req.body.disc,
        ...(req.file && { image: req.file.filename }),
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Delete Subcategory
exports.deleteSubcategory = async (req, res) => {
  try {
    await Subcategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Subcategory deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};