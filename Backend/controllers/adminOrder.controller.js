const Order = require("../models/order");

// GET /api/admin/orders
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email"); // optional (needs User model)

    res.json({ orders });
  } catch (err) {
    console.log("❌ getAllOrdersAdmin error:", err);
    res.status(500).json({ message: "Failed to load admin orders" });
  }
};

// PUT /api/admin/orders/:id/status
exports.updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(String(status).toLowerCase())) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status: String(status).toLowerCase() },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Status updated", order });
  } catch (err) {
    console.log("❌ updateOrderStatusAdmin error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};
