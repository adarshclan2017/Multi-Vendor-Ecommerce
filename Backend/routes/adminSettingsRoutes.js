const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");
const controller = require("../controllers/adminSettings.controller");

// /api/admin/settings
router.get("/", protect, adminOnly, controller.getAdminSettings);
router.put("/", protect, adminOnly, controller.updateAdminSettings);

module.exports = router;
