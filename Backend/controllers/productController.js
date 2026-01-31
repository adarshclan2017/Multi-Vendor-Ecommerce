const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");
const AdminSettings = require("../models/AdminSettings"); // ✅ add at top once



// =========================
// HELPERS
// =========================

// convert category input (id OR name) -> Category document
const resolveCategoryDoc = async (categoryValue) => {
  if (!categoryValue) return null;

  // if frontend sends id
  if (mongoose.Types.ObjectId.isValid(categoryValue)) {
    return await Category.findById(categoryValue);
  }

  // if frontend sends name
  const name = String(categoryValue || "").trim();
  if (!name) return null;

  return await Category.findOne({ name });
};

// ensure category is valid + active (returns ObjectId or null)
const resolveActiveCategoryId = async (categoryValue) => {
  if (!categoryValue) return null;

  const cat = await resolveCategoryDoc(categoryValue);
  if (!cat) throw new Error("Invalid category");
  if (cat.status !== "active") throw new Error("Category is inactive");

  return cat._id;
};

// =========================
// PUBLIC
// =========================

// ✅ Public: all products (ONLY active categories)
// - shows product if category is null OR category.status === active

exports.getProducts = async (req, res) => {
  try {
    // ✅ read settings (create default if not exists)
    let settings = await AdminSettings.findOne();
    if (!settings) settings = await AdminSettings.create({});

    // ✅ maintenance mode: block user browsing
    if (settings.maintenanceMode) {
      return res.status(503).json({
        message: "Store is under maintenance. Please try again later.",
      });
    }

    const products = await Product.find()
      .populate("seller", "name email role")
      .populate("category", "name status")
      .sort({ createdAt: -1 });

    // ✅ if admin enabled hiding inactive category products
    const filtered =
      settings.hideInactiveCategoryProducts === false
        ? products
        : (products || []).filter((p) => {
            // show if no category OR category is active
            if (!p.category) return true;
            return p.category.status === "active";
          });

    res.json(filtered);
  } catch (err) {
    console.log("❌ getProducts error:", err);
    res.status(500).json({ message: err.message });
  }
};


// ✅ Public: single product (BLOCK if category inactive)
exports.getProductById = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) settings = await AdminSettings.create({});

    if (settings.maintenanceMode) {
      return res.status(503).json({
        message: "Store is under maintenance. Please try again later.",
      });
    }

    const product = await Product.findById(req.params.id)
      .populate("seller", "name email role")
      .populate("category", "name status");

    if (!product) return res.status(404).json({ message: "Product not found" });

    // ✅ block inactive category product when setting is ON
    if (
      settings.hideInactiveCategoryProducts !== false &&
      product.category &&
      product.category.status === "inactive"
    ) {
      return res.status(404).json({ message: "Product not available" });
    }

    res.json(product);
  } catch (err) {
    console.log("❌ getProductById error:", err);
    res.status(500).json({ message: err.message });
  }
};

// =========================
// SELLER
// =========================

// ✅ Seller: create product (category must be ACTIVE)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res
        .status(400)
        .json({ message: "name, price, stock are required" });
    }

    // category optional, but if present it must be active
    let categoryId = null;
    if (category) {
      try {
        categoryId = await resolveActiveCategoryId(category);
      } catch (e) {
        return res.status(400).json({ message: e.message });
      }
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const product = await Product.create({
      name: String(name).trim(),
      description: description ? String(description) : "",
      price: Number(price),
      stock: Number(stock),
      category: categoryId || undefined,
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

// ✅ Seller: my products
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

// ✅ Seller: update my product (category must be ACTIVE if changed)
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
      return res
        .status(403)
        .json({ message: "You can update only your products" });
    }

    const { name, description, price, stock, category } = req.body;

    if (name !== undefined) product.name = String(name).trim();
    if (description !== undefined) product.description = String(description);
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);

    // update category if provided (must be active)
    if (category !== undefined) {
      if (!category) {
        product.category = undefined; // allow clearing
      } else {
        try {
          const categoryId = await resolveActiveCategoryId(category);
          product.category = categoryId;
        } catch (e) {
          return res.status(400).json({ message: e.message });
        }
      }
    }

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

// ✅ Seller: delete my product
exports.deleteMyProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (String(product.seller) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You can delete only your products" });
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

exports.adminCreateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, seller } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res
        .status(400)
        .json({ message: "name, price, stock are required" });
    }

    let categoryId = null;
    if (category) {
      try {
        categoryId = await resolveActiveCategoryId(category);
      } catch (e) {
        return res.status(400).json({ message: e.message });
      }
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const product = await Product.create({
      name: String(name).trim(),
      description: description ? String(description) : "",
      price: Number(price),
      stock: Number(stock),
      category: categoryId || undefined,
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
      if (!category) {
        product.category = undefined;
      } else {
        try {
          const categoryId = await resolveActiveCategoryId(category);
          product.category = categoryId;
        } catch (e) {
          return res.status(400).json({ message: e.message });
        }
      }
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

exports.addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // ✅ only logged-in user can review
    const already = product.reviews.find(
      (r) => String(r.user) === String(req.user._id)
    );
    if (already) return res.status(400).json({ message: "You already reviewed this product" });

    const review = {
      user: req.user._id,
      name: req.user.name || "User",
      rating: Number(rating),
      comment: comment || "",
    };

    if (!review.rating || review.rating < 1 || review.rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({ message: "Review added ✅", product });
  } catch (err) {
    console.log("❌ addProductReview error:", err);
    res.status(500).json({ message: err.message });
  }
};
