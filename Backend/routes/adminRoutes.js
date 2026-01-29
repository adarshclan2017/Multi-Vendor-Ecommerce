const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const adminController = require("../controllers/admin.controller");

// ===== DASHBOARD =====
router.get("/stats", protect, adminOnly, adminController.getAdminStats);

// ===== ORDERS =====
router.get("/orders", protect, adminOnly, adminController.getAdminOrders);
router.get("/orders/:id", protect, adminOnly, adminController.getAdminOrderById);
router.put(
  "/orders/:id/status",
  protect,
  adminOnly,
  adminController.updateOrderStatus
);

// ===== USERS =====
router.get("/users", protect, adminOnly, adminController.getAdminUsers);
router.put("/users/:id", protect, adminOnly, adminController.updateAdminUser);

// ===== PRODUCTS (ADMIN FULL CRUD) =====
router.get("/products", protect, adminOnly, adminController.getAdminProducts);
router.get("/products/:id", protect, adminOnly, adminController.getAdminProductById);

router.post(
  "/products",
  protect,
  adminOnly,
  upload.single("image"),
  adminController.createAdminProduct
);

router.put(
  "/products/:id",
  protect,
  adminOnly,
  upload.single("image"),
  adminController.updateAdminProduct
);

router.delete(
  "/products/:id",
  protect,
  adminOnly,
  adminController.deleteAdminProduct
);

module.exports = router;
