const mongoose = require("mongoose");
const Order = require("../models/Order");

// helper: prefer a valid snapshot url; otherwise use populated product image
const pickItemImage = (it) => {
  // snapshot string url (old schema)
  if (typeof it.image === "string") {
    const s = it.image.trim();
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    // ignore "[object Object]" or "/uploads" if not served
  }
  // product.image can be {url, publicId} OR string (depending on your data)
  return it.product?.image || "";
};

const mapOrderItems = (order) => {
  const itemsMapped = (order.items || []).map((it) => ({
    ...it,
    name: it.name || it.product?.name,
    price: it.price || it.product?.price,
    image: pickItemImage(it),
    product: it.product?._id || it.product, // keep id if populated
  }));

  return { ...order, items: itemsMapped };
};

// ✅ GET /api/admin/orders
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate({
        path: "items.product",
        select: "name image price",
      })
      .lean();

    const mapped = (orders || []).map(mapOrderItems);

    res.json({ orders: mapped });
  } catch (err) {
    console.log("❌ getAllOrdersAdmin error:", err);
    res.status(500).json({ message: "Failed to load admin orders" });
  }
};

// ✅ GET /api/admin/orders/:id  (needed for AdminOrderDetails page)
exports.getOrderByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate({
        path: "items.product",
        select: "name image price",
      })
      .lean();

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ order: mapOrderItems(order) });
  } catch (err) {
    console.log("❌ getOrderByIdAdmin error:", err);
    res.status(500).json({ message: "Failed to load order" });
  }
};

// ✅ PUT /api/admin/orders/:id/status
exports.updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const allowed = ["pending", "shipped", "delivered", "cancelled"];
    const next = String(status || "").toLowerCase();

    if (!allowed.includes(next)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status: next },
      { new: true }
    )
      .populate("user", "name email")
      .populate({
        path: "items.product",
        select: "name image price",
      })
      .lean();

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Status updated", order: mapOrderItems(order) });
  } catch (err) {
    console.log("❌ updateOrderStatusAdmin error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};