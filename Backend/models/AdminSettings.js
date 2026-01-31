const mongoose = require("mongoose");

const adminSettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "PowerHouse Ecommerce", trim: true },
    supportEmail: { type: String, default: "support@example.com", trim: true },
    supportPhone: { type: String, default: "+91 90000 00000", trim: true },

    currency: { type: String, enum: ["INR", "USD", "EUR", "GBP"], default: "INR" },

    taxPercent: { type: Number, default: 0, min: 0 },
    shippingCharge: { type: Number, default: 0, min: 0 },

    allowCOD: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },

    // ✅ Important setting for your case
    hideInactiveCategoryProducts: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.AdminSettings ||
  mongoose.model("AdminSettings", adminSettingsSchema);
