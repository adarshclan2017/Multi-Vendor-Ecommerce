const Order = require("../models/order");
const Product = require("../models/product");

exports.getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // seller product ids
    const sellerProducts = await Product.find({ seller: sellerId }).select("_id");
    const productIds = sellerProducts.map((p) => String(p._id));

    // orders that contain seller items
    const orders = await Order.find({ "items.product": { $in: productIds } })
      .sort({ createdAt: -1 })
      .lean();

    // ✅ compute metrics only from seller items
    let totalRevenue = 0;
    let deliveredRevenue = 0;
    let shippedRevenue = 0;
    let pendingRevenue = 0;

    let totalItemsSold = 0;
    let deliveredCount = 0;
    let shippedCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    for (const o of orders) {
      const sellerItems = (o.items || []).filter((it) =>
        productIds.includes(String(it.product))
      );

      const orderSubtotal = sellerItems.reduce(
        (s, it) => s + Number(it.price || 0) * Number(it.qty || 0),
        0
      );

      totalRevenue += orderSubtotal;

      // treat status: if you use item.status, use it; else fallback to o.status
      const statuses = sellerItems.map((it) => String(it.status || o.status || "pending").toLowerCase());

      // items sold
      for (const it of sellerItems) totalItemsSold += Number(it.qty || 0);

      // count order buckets by "best" status logic
      if (statuses.every((s) => s === "delivered")) {
        deliveredCount += 1;
        deliveredRevenue += orderSubtotal;
      } else if (statuses.some((s) => s === "shipped")) {
        shippedCount += 1;
        shippedRevenue += orderSubtotal;
      } else if (statuses.some((s) => s === "cancelled")) {
        cancelledCount += 1;
      } else {
        pendingCount += 1;
        pendingRevenue += orderSubtotal;
      }
    }

    return res.json({
      stats: {
        totalRevenue,
        deliveredRevenue,
        shippedRevenue,
        pendingRevenue,
        totalItemsSold,
        orders: {
          total: orders.length,
          delivered: deliveredCount,
          shipped: shippedCount,
          pending: pendingCount,
          cancelled: cancelledCount,
        },
      },
    });
  } catch (err) {
    console.log("❌ getSellerAnalytics error:", err);
    return res.status(500).json({ message: "Failed to load analytics" });
  }
};


exports.getSellerMonthlyRevenue = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const sellerProducts = await Product.find({ seller: sellerId }).select("_id");
    const productIds = sellerProducts.map((p) => String(p._id));

    const orders = await Order.find({ "items.product": { $in: productIds } })
      .sort({ createdAt: 1 })
      .lean();

    const map = {}; // "YYYY-MM" => revenue

    for (const o of orders) {
      const monthKey = new Date(o.createdAt).toISOString().slice(0, 7); // YYYY-MM

      const sellerItems = (o.items || []).filter((it) =>
        productIds.includes(String(it.product))
      );

      const subtotal = sellerItems.reduce(
        (s, it) => s + Number(it.price || 0) * Number(it.qty || 0),
        0
      );

      map[monthKey] = (map[monthKey] || 0) + subtotal;
    }

    const series = Object.keys(map)
      .sort()
      .map((k) => ({ month: k, revenue: Math.round(map[k]) }));

    res.json({ series });
  } catch (err) {
    console.log("❌ getSellerMonthlyRevenue error:", err);
    res.status(500).json({ message: "Failed to load monthly revenue" });
  }
};