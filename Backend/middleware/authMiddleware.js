const jwt = require("jsonwebtoken");
const User = require("../models/User"); // change path if your model differs

// ✅ Protect routes (Bearer token)
// middleware/auth.js

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select("-password");
  if (!user) return res.status(401).json({ message: "User not found" });

  // ✅ BLOCK CHECK HERE ALSO
  if (user.status === "blocked") {
    return res.status(403).json({
      message: "Account blocked by admin",
    });
  }

  req.user = user;
  next();
};


// ✅ Admin only (use this in admin routes)
const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ message: "Admin access only" });
};

// ✅ Seller only (use this in seller/product routes)
const sellerOnly = (req, res, next) => {
  if (req.user?.role === "seller") return next();
  return res.status(403).json({ message: "Seller access only" });
};

// ✅ (optional) Admin OR Seller (if you ever need it)
const sellerOrAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role === "seller" || role === "admin") return next();
  return res.status(403).json({ message: "Seller/Admin access only" });
};

module.exports = { protect, adminOnly, sellerOnly, sellerOrAdmin };

