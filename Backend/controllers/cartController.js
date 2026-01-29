const Cart = require("../models/Carts");

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

// GET /api/cart
exports.getMyCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);

    const populated = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price stock image",
    });

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/cart/add  { productId, qty }
exports.addToCart = async (req, res) => {
  try {
    // ✅ debug proof
    console.log("✅ CART ADD USER:", req.user?._id);
    console.log("✅ CART ADD BODY:", req.body);

    const { productId, qty } = req.body || {};

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const q = qty ? Number(qty) : 1;
    if (Number.isNaN(q) || q < 1) {
      return res.status(400).json({ message: "qty must be >= 1" });
    }

    const cart = await getOrCreateCart(req.user._id);

    const existing = cart.items.find((i) => String(i.product) === String(productId));
    if (existing) existing.qty += q;
    else cart.items.push({ product: productId, qty: q });

    await cart.save();

    const populated = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price stock image",
    });

    res.status(201).json(populated);
  } catch (err) {
    console.error("❌ addToCart error:", err);
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/cart/update  { productId, qty }
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, qty } = req.body || {};
    if (!productId) return res.status(400).json({ message: "productId is required" });

    const q = Number(qty);
    if (Number.isNaN(q) || q < 1) return res.status(400).json({ message: "qty must be >= 1" });

    const cart = await getOrCreateCart(req.user._id);

    const item = cart.items.find((i) => String(i.product) === String(productId));
    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    item.qty = q;
    await cart.save();

    const populated = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price stock image",
    });

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/cart/remove/:productId
exports.removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter((i) => String(i.product) !== String(productId));
    await cart.save();

    const populated = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price stock image",
    });

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/cart/clear
exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
