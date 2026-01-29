const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
} = require("../controllers/adminOrder.controller");

router.get("/orders", protect, adminOnly, getAllOrdersAdmin);
router.put("/orders/:id/status", protect, adminOnly, updateOrderStatusAdmin);

module.exports = router;
