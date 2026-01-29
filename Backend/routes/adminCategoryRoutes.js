const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");
const controller = require("../controllers/adminCategory.controller");

router.get("/", protect, adminOnly, controller.getAdminCategories);
router.post("/", protect, adminOnly, controller.createAdminCategory);
router.put("/:id", protect, adminOnly, controller.updateAdminCategory);
router.delete("/:id", protect, adminOnly, controller.deleteAdminCategory);

module.exports = router;
