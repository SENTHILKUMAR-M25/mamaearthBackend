const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createSubcategory,
  getSubcategories,
  updateSubcategory,
  deleteSubcategory,
} = require("../controllers/subcategoryController");

// 📸 Multer setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Routes
router.post("/", upload.single("image"), createSubcategory);
router.get("/", getSubcategories);
router.put("/:id", upload.single("image"), updateSubcategory);
router.delete("/:id", deleteSubcategory);

module.exports = router;