const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const { protect, sellerOnly } = require("../middleware/authMiddleware");

const {
  getProducts,
  getProductById,
  createProduct,
  getMyProducts,
  updateMyProduct,
  deleteMyProduct,
  addProductReview,
} = require("../controllers/productController");

// ✅ Public
router.get("/", getProducts);

// ✅ Seller: my products (must be BEFORE "/:id")
router.get("/seller/me", protect, sellerOnly, getMyProducts);

// ✅ Public: single product
router.get("/:id", getProductById);

// ✅ Reviews
router.post("/:id/reviews", protect, addProductReview);

/// ✅ Seller: create product (multipart)
router.post("/", protect, sellerOnly, upload.single("image"), createProduct);

// ✅ Seller: update product (multipart optional)
router.put("/:id", protect, sellerOnly, upload.single("image"), updateMyProduct);

// ✅ Seller: delete
router.delete("/:id", protect, sellerOnly, deleteMyProduct);

module.exports = router;