const express = require("express");
const router = express.Router();

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

// ✅ Seller: create product (image will come as JSON: { image: { url, publicId } })
router.post("/", protect, sellerOnly, createProduct);

// ✅ Seller: update product (image optional as JSON)
router.put("/:id", protect, sellerOnly, updateMyProduct);

// ✅ Seller: delete
router.delete("/:id", protect, sellerOnly, deleteMyProduct);

module.exports = router;