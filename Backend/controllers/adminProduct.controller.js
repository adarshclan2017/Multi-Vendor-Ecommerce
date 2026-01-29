const mongoose = require("mongoose");
const Product = require("../models/product.model"); 
// ✅ CHANGE THIS PATH to your product model file:
// examples: "../models/Product", "../models/productModel", "../models/product.model"

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/admin/products
exports.getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    return res.json({ products });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load products" });
  }
};

// GET /api/admin/products/:id
exports.getAdminProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid product id" });

    const product = await Product.findById(id).populate("category");
    if (!product) return res.status(404).json({ message: "Product not found" });

    return res.json({ product });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load product" });
  }
};

// POST /api/admin/products
exports.createAdminProduct = async (req, res) => {
  try {
    const { name, price, stock, category, description } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const product = await Product.create({
      name,
      price,
      stock,
      category,
      description,
      image,
    });

    return res.status(201).json({ product });
  } catch (err) {
    return res.status(500).json({ message: "Create product failed" });
  }
};

// PUT /api/admin/products/:id
exports.updateAdminProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid product id" });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, price, stock, category, description } = req.body;

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;

    if (req.file) product.image = `/uploads/${req.file.filename}`;

    await product.save();
    return res.json({ product });
  } catch (err) {
    return res.status(500).json({ message: "Update product failed" });
  }
};

// DELETE /api/admin/products/:id
exports.deleteAdminProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid product id" });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    return res.json({ message: "Deleted ✅" });
  } catch (err) {
    return res.status(500).json({ message: "Delete product failed" });
  }
};
