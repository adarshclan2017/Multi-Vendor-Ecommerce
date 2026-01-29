const mongoose = require("mongoose");

const adminSettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "NOVA WORLD", trim: true },
    supportEmail: { type: String, default: "Novaworld@gmail.com", trim: true },
    supportPhone: { type: String, default: "+91 90000 00000", trim: true },

    currency: {
      type: String,
      enum: ["INR", "USD", "EUR", "GBP"],
      default: "INR",
    },

    maintenanceMode: { type: Boolean, default: false },
    hideInactiveCategoryProducts: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.AdminSettings ||
  mongoose.model("AdminSettings", adminSettingsSchema);
