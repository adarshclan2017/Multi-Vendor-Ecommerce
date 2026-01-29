const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// ✅ FIX: prevent OverwriteModelError
module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
