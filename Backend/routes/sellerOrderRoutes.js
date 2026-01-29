const express = require("express");
const router = express.Router();

const { protect, sellerOnly } = require("../middleware/authMiddleware");

const {
  getSellerOrders,
  getSellerOrderById,
  updateSellerOrderStatus,
} = require("../controllers/sellerOrder.controller");

console.log("SELLER ORDER HANDLERS:", {
  getSellerOrders: typeof getSellerOrders,
  getSellerOrderById: typeof getSellerOrderById,
  updateSellerOrderStatus: typeof updateSellerOrderStatus,
});

router.get("/", protect, sellerOnly, getSellerOrders);
router.get("/:id", protect, sellerOnly, getSellerOrderById);
router.put("/:id/status", protect, sellerOnly, updateSellerOrderStatus);

module.exports = router;
