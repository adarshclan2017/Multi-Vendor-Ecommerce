const AdminSettings = require("../models/AdminSettings");

// Get settings (always return one doc)
exports.getAdminSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();

    if (!settings) {
      settings = await AdminSettings.create({});
    }

    res.json({ settings });
  } catch (err) {
    console.log("❌ getAdminSettings error:", err);
    res.status(500).json({ message: "Failed to load settings" });
  }
};

// Update settings
exports.updateAdminSettings = async (req, res) => {
  try {
    const allowed = [
      "storeName",
      "supportEmail",
      "supportPhone",
      "currency",
      "maintenanceMode",
      "hideInactiveCategoryProducts",
    ];

    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    let settings = await AdminSettings.findOne();

    if (!settings) {
      settings = await AdminSettings.create(update);
    } else {
      Object.assign(settings, update);
      await settings.save();
    }

    res.json({ settings, message: "Settings updated ✅" });
  } catch (err) {
    console.log("❌ updateAdminSettings error:", err);
    res.status(500).json({ message: "Failed to update settings" });
  }
};
