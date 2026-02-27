const express = require("express");
const router = express.Router();
const Category = require("../models/category"); // ✅ adjust path/name if different

// ✅ Public: show only active categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" }).sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    console.log("❌ public categories error:", err);
    res.status(500).json({ message: "Failed to load categories" });
  }
});

module.exports = router;
