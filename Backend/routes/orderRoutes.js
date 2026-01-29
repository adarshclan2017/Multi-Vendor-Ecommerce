const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
} = require("../controllers/ordercontroller");

// user
router.post("/place", protect, placeOrder);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelMyOrder);

module.exports = router;
