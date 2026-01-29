const jwt = require("jsonwebtoken");
const User = require("../models/User"); // change path if your model differs

// ✅ Protect routes (Bearer token)
const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
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

