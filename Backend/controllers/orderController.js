const Order = require("../models/Order");
const Cart = require("../models/Carts"); // make sure path matches your file name
const Product = require("../models/Product");

// POST /api/orders/place
exports.placeOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { address, items: bodyItems = [], total: bodyTotal } = req.body;

        if (!address?.fullName) {
            return res.status(400).json({ message: "Address is required" });
        }

        let items = [];
        let total = 0;

        // ✅ 1. Try cart from DB
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (cart && cart.items && cart.items.length > 0) {
            items = cart.items.map((ci) => ({
                product: ci.product._id,
                qty: ci.qty,
                price: ci.product.price,
                name: ci.product.name,
                image: ci.product.image,
            }));

            total = items.reduce((s, it) => s + it.price * it.qty, 0);

            // clear cart
            cart.items = [];
            await cart.save();
        }
        // ✅ 2. Fallback: use frontend payload
        else {
            if (!Array.isArray(bodyItems) || bodyItems.length === 0) {
                return res.status(400).json({ message: "Cart is empty" });
            }

            for (const i of bodyItems) {
                const product = await Product.findById(i.productId);
                if (!product) {
                    return res.status(400).json({ message: "Product not found" });
                }

                items.push({
                    product: product._id,
                    qty: Number(i.qty || 1),
                    price: product.price,
                    name: product.name,
                    image: product.image,
                });
            }

            total = Number(
                bodyTotal ?? items.reduce((s, it) => s + it.price * it.qty, 0)
            );
        }

        const order = await Order.create({
            user: userId,
            items,
            address,
            total,
            status: "pending",
        });

        return res.status(201).json({ order });
    } catch (err) {
        console.log("❌ placeOrder error:", err);
        return res.status(500).json({ message: "Place order failed" });
    }
};
// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ Only owner (or admin if you want)
    if (String(order.user) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json({ order });
  } catch (err) {
    console.log("❌ getOrderById error:", err);
    res.status(500).json({ message: "Failed to load order details" });
  }
};
// PUT /api/orders/:id/cancel
exports.cancelMyOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const orderId = req.params.id;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // ✅ owner check
        if (String(order.user) !== String(userId)) {
            return res.status(403).json({ message: "Not allowed" });
        }

        // ✅ only pending can cancel
        if (String(order.status).toLowerCase() !== "pending") {
            return res.status(400).json({ message: "Only pending orders can be cancelled" });
        }

        order.status = "cancelled";
        await order.save();

        return res.json({ message: "Order cancelled", order });
    } catch (err) {
        console.log("❌ cancelMyOrder error:", err);
        return res.status(500).json({ message: "Cancel order failed" });
    }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.log("❌ getMyOrders error:", err);
    res.status(500).json({ message: "Failed to load orders" });
  }
};
