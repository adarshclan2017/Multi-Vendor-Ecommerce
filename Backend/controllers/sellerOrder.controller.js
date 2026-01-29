const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");

// ✅ GET seller orders (only items that belong to this seller)
exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate({
        path: "items.product",
        select: "name image price seller",
      })
      .lean();

    const filtered = orders
      .map((o) => {
        const sellerItems = (o.items || []).filter((it) => {
          const p = it.product;
          if (!p) return false;
          return String(p.seller) === String(sellerId);
        });

        if (sellerItems.length === 0) return null;

        const sellerTotal = sellerItems.reduce(
          (sum, it) =>
            sum +
            Number(it.price || it.product?.price || 0) * Number(it.qty || 0),
          0
        );

        const itemsMapped = sellerItems.map((it) => ({
          ...it,
          name: it.name || it.product?.name,
          image: it.image || it.product?.image,
          price: it.price || it.product?.price,
          product: it.product?._id, // keep only product id for frontend
        }));

        return { ...o, items: itemsMapped, sellerTotal };
      })
      .filter(Boolean);

    res.json({ orders: filtered });
  } catch (err) {
    console.log("❌ getSellerOrders error:", err);
    res.status(500).json({ message: "Failed to load seller orders" });
  }
};

// ✅ GET one seller order by id (only this seller's items)
exports.getSellerOrderById = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id)
      .populate({
        path: "items.product",
        select: "name image price seller",
      })
      .lean();

    if (!order) return res.status(404).json({ message: "Order not found" });

    const sellerItems = (order.items || []).filter((it) => {
      const p = it.product;
      if (!p) return false;
      return String(p.seller) === String(sellerId);
    });

    if (sellerItems.length === 0) {
      return res.status(403).json({ message: "Not allowed for this order" });
    }

    const sellerTotal = sellerItems.reduce(
      (sum, it) =>
        sum + Number(it.price || it.product?.price || 0) * Number(it.qty || 0),
      0
    );

    const itemsMapped = sellerItems.map((it) => ({
      ...it,
      name: it.name || it.product?.name,
      image: it.image || it.product?.image,
      price: it.price || it.product?.price,
      product: it.product?._id,
    }));

    res.json({ order: { ...order, items: itemsMapped, sellerTotal } });
  } catch (err) {
    console.log("❌ getSellerOrderById error:", err);
    res.status(500).json({ message: "Failed to load seller order" });
  }
};

// ✅ UPDATE status (seller can update status only if order contains seller item)
exports.updateSellerOrderStatus = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const allowed = ["pending", "shipped", "delivered", "cancelled"];
    const nextStatus = String(status || "").toLowerCase();

    if (!allowed.includes(nextStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Load order and check seller ownership via populated items.product.seller
    const order = await Order.findById(id).populate({
      path: "items.product",
      select: "seller",
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const hasSellerItem = (order.items || []).some((it) => {
      const p = it.product;
      if (!p) return false;
      return String(p.seller) === String(sellerId);
    });

    if (!hasSellerItem) {
      return res.status(403).json({ message: "Not allowed for this order" });
    }

    order.status = nextStatus;
    await order.save();

    res.json({ message: "Status updated", order });
  } catch (err) {
    console.log("❌ updateSellerOrderStatus error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};
