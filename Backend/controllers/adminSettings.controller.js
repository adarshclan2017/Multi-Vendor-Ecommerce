const AdminSettings = require("../models/AdminSettings");

// always keep ONE settings document
const getOrCreate = async () => {
  let doc = await AdminSettings.findOne();
  if (!doc) doc = await AdminSettings.create({});
  return doc;
};

// ✅ GET settings
exports.getAdminSettings = async (req, res) => {
  try {
    const settings = await getOrCreate();
    res.json({ settings });
  } catch (err) {
    console.log("❌ getAdminSettings error:", err);
    res.status(500).json({ message: "Failed to load settings" });
  }
};

// ✅ UPDATE settings
exports.updateAdminSettings = async (req, res) => {
  try {
    const settings = await getOrCreate();

    const allowed = [
      "storeName",
      "supportEmail",
      "supportPhone",
      "currency",
      "taxPercent",
      "shippingCharge",
      "allowCOD",
      "maintenanceMode",
      "hideInactiveCategoryProducts",
    ];

    allowed.forEach((key) => {
      if (req.body[key] !== undefined) settings[key] = req.body[key];
    });

    await settings.save();
    res.json({ settings, message: "Settings updated ✅" });
  } catch (err) {
    console.log("❌ updateAdminSettings error:", err);
    res.status(500).json({ message: "Failed to update settings" });
  }
};
