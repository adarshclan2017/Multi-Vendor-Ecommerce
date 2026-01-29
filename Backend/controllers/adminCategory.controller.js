const mongoose = require("mongoose");
const Category = require("../models/Category");

/* =========================
   GET ALL CATEGORIES (ADMIN)
========================= */
exports.getAdminCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ categories });
  } catch (err) {
    console.log("❌ getAdminCategories error:", err);
    res.status(500).json({ message: "Failed to load categories" });
  }
};

/* =========================
   CREATE CATEGORY (ADMIN)
========================= */
exports.createAdminCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const exists = await Category.findOne({
      name: new RegExp(`^${name.trim()}$`, "i"),
    });

    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name: name.trim(),
    });

    res.status(201).json({ category });
  } catch (err) {
    console.log("❌ createAdminCategory error:", err);
    res.status(500).json({ message: "Failed to create category" });
  }
};

/* =========================
   UPDATE CATEGORY (ADMIN)
========================= */
exports.updateAdminCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const update = {};

    if (name !== undefined) update.name = name.trim();
    if (status !== undefined) update.status = status;

    const category = await Category.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ category });
  } catch (err) {
    console.log("❌ updateAdminCategory error:", err);
    res.status(500).json({ message: "Failed to update category" });
  }
};

/* =========================
   DELETE CATEGORY (ADMIN)
========================= */
exports.deleteAdminCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.deleteOne();
    res.json({ message: "Category deleted ✅" });
  } catch (err) {
    console.log("❌ deleteAdminCategory error:", err);
    res.status(500).json({ message: "Failed to delete category" });
  }
};
