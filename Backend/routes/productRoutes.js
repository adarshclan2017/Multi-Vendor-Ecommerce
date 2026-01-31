const express = require("express");
const router = express.Router();
const { addProductReview } = require("../controllers/productController");

// ✅ FIX: correct upload middleware filename
const upload = require("../middleware/uploadMiddleware");

// ✅ auth middlewares
const { protect, sellerOnly } = require("../middleware/authMiddleware");

// ✅ controllers (must exist and be exported)
const {
  getProducts,
  getProductById,
  createProduct,
  getMyProducts,
  updateMyProduct,
  deleteMyProduct,
} = require("../controllers/productController");

// ✅ Public
router.get("/", getProducts);

// ✅ Seller: my products (must be BEFORE "/:id")
router.get("/seller/me", protect, sellerOnly, getMyProducts);

// ✅ Public: single product
router.get("/:id", getProductById);
router.post("/:id/reviews", protect, addProductReview);

// ✅ Seller: create product (with image)
router.post("/", protect, sellerOnly, upload.single("image"), createProduct);

// ✅ Seller: update product (with optional image)
router.put("/:id", protect, sellerOnly, upload.single("image"), updateMyProduct);

// ✅ Seller: delete
router.delete("/:id", protect, sellerOnly, deleteMyProduct);

module.exports = router;
