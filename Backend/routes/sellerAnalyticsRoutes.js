const router = require("express").Router();
const { protect, sellerOnly } = require("../middleware/authMiddleware");
const { getSellerAnalytics,getSellerMonthlyRevenue } = require("../controllers/sellerAnalytics.controller");

router.get("/analytics", protect, sellerOnly, getSellerAnalytics);
router.get("/analytics/monthly", protect, sellerOnly, getSellerMonthlyRevenue);

module.exports = router;
