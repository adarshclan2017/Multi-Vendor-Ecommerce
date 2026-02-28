const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/category");
const AdminSettings = require("../models/AdminSettings");

// ✅ Cloudinary
const cloudinary = require("../config/cloudinary");

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

// safely parse image object from req.body (Cloudinary)
const parseImage = (value) => {
  // value may already be object (axios sends JSON)
  if (!value) return null;

  if (typeof value === "object") {
    const url = String(value.url || "").trim();
    const publicId = String(value.publicId || "").trim();
    if (!url) return null;
    return { url, publicId };
  }

  // sometimes frontend sends JSON string
  if (typeof value === "string") {
    try {
      const obj = JSON.parse(value);
      const url = String(obj?.url || "").trim();
      const publicId = String(obj?.publicId || "").trim();
      if (!url) return null;
      return { url, publicId };
    } catch {
      // if someone sends plain url string (not recommended)
      const url = String(value || "").trim();
      if (!url) return null;
      return { url, publicId: "" };
    }
  }

  return null;
};

const deleteCloudinaryByPublicId = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    // don't fail the request if image delete fails
    console.log("⚠️ Cloudinary destroy failed:", e.message);
  }
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
// ✅ image comes from JSON: req.body.image = { url, publicId }
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ message: "name, price, stock are required" });
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

    // ✅ image from multipart
    if (!req.file) {
      return res.status(400).json({ message: "Product image is required." });
    }

    const b64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;

    const uploadRes = await cloudinary.uploader.upload(dataUri, {
      folder: "products",
    });

    const product = await Product.create({
      name: String(name).trim(),
      description: description ? String(description) : "",
      price: Number(price),
      stock: Number(stock),
      category: categoryId || undefined,
      image: { url: uploadRes.secure_url, publicId: uploadRes.public_id },
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
// ✅ if new image is sent, delete old cloudinary image
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

    // ✅ image update via multipart (req.file is optional)
if (req.file) {
  const oldPublicId = product.image?.publicId;

  const b64 = req.file.buffer.toString("base64");
  const dataUri = `data:${req.file.mimetype};base64,${b64}`;

  const uploadRes = await cloudinary.uploader.upload(dataUri, {
    folder: "products",
  });

  product.image = {
    url: uploadRes.secure_url,
    publicId: uploadRes.public_id,
  };

  // delete old image
  if (oldPublicId && oldPublicId !== product.image.publicId) {
    await deleteCloudinaryByPublicId(oldPublicId);
  }
}

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

// ✅ Seller: delete my product (also delete cloudinary image)
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

    // delete cloudinary image
    await deleteCloudinaryByPublicId(product.image?.publicId);

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

// ✅ Admin: create product (image from JSON)
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

    const imageObj = parseImage(req.body.image);
    if (!imageObj?.url) {
      return res.status(400).json({
        message: "Product image is required. Upload to Cloudinary and send {url, publicId}.",
      });
    }

    const product = await Product.create({
      name: String(name).trim(),
      description: description ? String(description) : "",
      price: Number(price),
      stock: Number(stock),
      category: categoryId || undefined,
      image: { url: imageObj.url, publicId: imageObj.publicId || "" },
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

// ✅ Admin: update product (delete old cloudinary if changed)
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

    // ✅ image update
    if (req.body.image !== undefined) {
      const newImage = parseImage(req.body.image);
      if (newImage?.url) {
        const oldPublicId = product.image?.publicId;

        product.image = {
          url: newImage.url,
          publicId: newImage.publicId || "",
        };

        if (oldPublicId && oldPublicId !== product.image.publicId) {
          await deleteCloudinaryByPublicId(oldPublicId);
        }
      }
    }

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

// ✅ Admin: delete product (also delete cloudinary image)
exports.adminDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await deleteCloudinaryByPublicId(product.image?.publicId);

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
    if (already)
      return res
        .status(400)
        .json({ message: "You already reviewed this product" });

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
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({ message: "Review added ✅", product });
  } catch (err) {
    console.log("❌ addProductReview error:", err);
    res.status(500).json({ message: err.message });
  }
};