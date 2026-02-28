const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        qty: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
        name: { type: String, required: true },

        // ✅ store cloudinary snapshot
        image: {
          url: { type: String, default: "" },
          publicId: { type: String, default: "" },
        },
      },
    ],

    address: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    total: { type: Number, required: true },

    status: { type: String, default: "pending" }, // pending/shipped/delivered/cancelled
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
