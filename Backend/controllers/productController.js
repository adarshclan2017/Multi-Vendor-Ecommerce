const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category"); // ✅ make sure file name exists: models/Category.js

// helper: accept categoryId OR category name, return ObjectId or undefined
const resolveCategoryId = async (categoryValue) => {
  if (!categoryValue) return undefined;

  // if frontend sends id
  if (mongoose.Types.ObjectId.isValid(categoryValue)) {
    return categoryValue;
  }

  // if frontend sends name
  const cat = await Category.findOne({ name: String(categoryValue).trim() }).select("_id");
  return cat?._id;
};

// =========================
// PUBLIC
// =========================

// Public: all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "name email role")
      .populate("category", "name status")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.log("❌ getProducts error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Public: single product
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id)
      .populate("seller", "name email role")
      .populate("category", "name status");

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    console.log("❌ getProductById error:", err);
    res.status(500).json({ message: err.message });
  }
};

// =========================
// SELLER
// =========================

// Seller: create product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ message: "name, price, stock are required" });
    }

    // ✅ convert category name/id -> category ObjectId
    const categoryId = await resolveCategoryId(category);

    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const product = await Product.create({
      name: String(name).trim(),
      description: description ? String(description) : "",
      price: Number(price),
      stock: Number(stock),
      category: categoryId, // ✅ ObjectId
      image: imagePath,
      seller: req.user._id,
    });

    const saved = await Product.findById(product._id)
      .populate("seller", "name email role")
      .populate("category", "name status");

    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ createProduct error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Seller: my products
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .populate("category", "name status")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.log("❌ getMyProducts error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Seller: update my product
exports.updateMyProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // only owner seller can update
    if (String(product.seller) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can update only your products" });
    }

    const { name, description, price, stock, category } = req.body;

    if (name !== undefined) product.name = String(name).trim();
    if (description !== undefined) product.description = String(description);
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);

    // ✅ update category if provided
    if (category !== undefined) {
      product.category = await resolveCategoryId(category);
    }

    // update image if uploaded
    if (req.file) product.image = `/uploads/${req.file.filename}`;

    await product.save();

    const updated = await Product.findById(id)
      .populate("seller", "name email role")
      .populate("category", "name status");

    res.json(updated);
  } catch (err) {
    console.log("❌ updateMyProduct error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Seller: delete my product
exports.deleteMyProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (String(product.seller) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can delete only your products" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted ✅" });
  } catch (err) {
    console.log("❌ deleteMyProduct error:", err);
    res.status(500).json({ message: err.message });
  }
};

// =========================
// ADMIN (use in /api/admin/products routes)
// =========================

// Admin: get all products
exports.adminGetProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "name email role")
      .populate("category", "name status")
      .sort({ createdAt: -1 });

    res.json({ products });
  } catch (err) {
    console.log("❌ adminGetProducts error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Admin: get product by id
exports.adminGetProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id)
      .populate("seller", "name email role")
      .populate("category", "name status");

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    console.log("❌ adminGetProductById error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Admin: create product
exports.adminCreateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, seller } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ message: "name, price, stock are required" });
    }

    const categoryId = await resolveCategoryId(category);

    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const product = await Product.create({
      name: String(name).trim(),
      description: description ? String(description) : "",
      price: Number(price),
      stock: Number(stock),
      category: categoryId,
      image: imagePath,
      seller: seller || req.user._id,
    });

    const saved = await Product.findById(product._id)
      .populate("seller", "name email role")
      .populate("category", "name status");

    res.status(201).json({ product: saved });
  } catch (err) {
    console.log("❌ adminCreateProduct error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Admin: update any product
exports.adminUpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, description, price, stock, category, seller } = req.body;

    if (name !== undefined) product.name = String(name).trim();
    if (description !== undefined) product.description = String(description);
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);

    if (category !== undefined) {
      product.category = await resolveCategoryId(category);
    }

    if (seller !== undefined) product.seller = seller;

    if (req.file) product.image = `/uploads/${req.file.filename}`;

    await product.save();

    const updated = await Product.findById(id)
      .populate("seller", "name email role")
      .populate("category", "name status");

    res.json({ product: updated });
  } catch (err) {
    console.log("❌ adminUpdateProduct error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Admin: delete any product
exports.adminDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.json({ message: "Product deleted ✅" });
  } catch (err) {
    console.log("❌ adminDeleteProduct error:", err);
    res.status(500).json({ message: err.message });
  }
};
