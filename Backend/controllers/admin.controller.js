const mongoose = require("mongoose");
const Order = require("../models/order");
const User = require("../models/User");
const Product = require("../models/product"); // ✅ keep this consistent with your project

/* =========================
   DASHBOARD STATS
========================= */
exports.getAdminStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({ totalOrders, totalUsers, totalRevenue });
  } catch (err) {
    console.log("❌ getAdminStats error:", err);
    res.status(500).json({ message: "Failed to load admin stats" });
  }
};

/* =========================
   ORDERS
========================= */
exports.getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.log("❌ getAdminOrders error:", err);
    res.status(500).json({ message: "Failed to load orders" });
  }
};

exports.getAdminOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ order });
  } catch (err) {
    console.log("❌ getAdminOrderById error:", err);
    res.status(500).json({ message: "Failed to load order" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const allowed = ["pending", "shipped", "delivered", "cancelled"];
    const st = String(status || "").toLowerCase();
    if (!allowed.includes(st)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status: st },
      { new: true }
    ).populate("user", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ order });
  } catch (err) {
    console.log("❌ updateOrderStatus error:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

/* =========================
   USERS
========================= */
exports.getAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("_id name email role status createdAt")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (err) {
    console.log("❌ getAdminUsers error:", err);
    res.status(500).json({ message: "Failed to load users" });
  }
};

exports.updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const allowedRoles = ["user", "seller", "admin"];
    const allowedStatus = ["active", "blocked"];
    const update = {};

    if (role) {
      const r = String(role).toLowerCase();
      if (!allowedRoles.includes(r)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      update.role = r;
    }

    if (status) {
      const s = String(status).toLowerCase();
      if (!allowedStatus.includes(s)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      update.status = s;
    }

    const user = await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
      select: "_id name email role status createdAt",
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.log("❌ updateAdminUser error:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
};

/* =========================
   PRODUCTS (ADMIN)
========================= */

// ✅ GET ALL PRODUCTS
// ✅ GET ALL PRODUCTS (Admin)
exports.getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json({ products });
  } catch (err) {
    console.log("❌ getAdminProducts error:", err);
    res.status(500).json({ message: "Failed to load products" });
  }
};

// ✅ GET PRODUCT BY ID (Admin)
exports.getAdminProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id).populate("seller", "name email");
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ product });
  } catch (err) {
    console.log("❌ getAdminProductById error:", err);
    res.status(500).json({ message: "Failed to load product" });
  }
};

// ✅ CREATE PRODUCT (Admin)  --- FIXED seller required
exports.createAdminProduct = async (req, res) => {
  try {
    const { name, price, stock, category, description, seller } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ message: "name, price, stock are required" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    // ✅ IMPORTANT FIX:
    // seller is REQUIRED in schema, so use:
    // 1) seller from body if provided
    // 2) otherwise default to logged-in admin id (req.user._id)
    const sellerId = seller || req.user._id;

    const product = await Product.create({
      name,
      price: Number(price),
      stock: Number(stock),
      category: category || "",
      description: description || "",
      image,
      seller: sellerId,
    });

    res.status(201).json({ product });
  } catch (err) {
    console.log("❌ createAdminProduct error:", err);
    res.status(500).json({ message: "Failed to create product", error: err.message });
  }
};

// ✅ UPDATE PRODUCT (Admin)
exports.updateAdminProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const { name, price, stock, category, description, seller } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;

    // ✅ allow admin to change seller (optional)
    if (seller !== undefined && seller) product.seller = seller;

    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();

    res.json({ product });
  } catch (err) {
    console.log("❌ updateAdminProduct error:", err);
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
};

// ✅ DELETE PRODUCT (Admin)
exports.deleteAdminProduct = async (req, res) => {
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
    console.log("❌ deleteAdminProduct error:", err);
    res.status(500).json({ message: "Failed to delete product" });
  }
};
