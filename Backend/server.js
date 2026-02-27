const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

console.log("✅ DEPLOY CHECK: running Backend/server.js (NO STAR OPTIONS) - 2026-02-27");

const app = express();

/* ==============================
   ✅ CORS (RENDER + VERCEL SAFE)
   ============================== */

const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://multi-vendor-ecommerce-pink.vercel.app",
]);

const corsOptions = {
  origin: (origin, cb) => {
    // allow requests with no origin (Postman, server-to-server)
    if (!origin) return cb(null, true);

    if (allowedOrigins.has(origin)) return cb(null, true);

    // block unknown origins
    return cb(new Error("Not allowed by CORS: " + origin));
  },

  // ✅ Keep true ONLY if you use cookies (sessions).
  // If you're using JWT in Authorization header, set this to false.
  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

/* ✅ Preflight handler for ALL OPTIONS requests
   (No app.options("*") to avoid path-to-regexp crash) */
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return cors(corsOptions)(req, res, next);
  }
  next();
});

/* ==============================
   ✅ BODY PARSERS
   ============================== */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ==============================
   ✅ STATIC FILES
   ============================== */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ==============================
   ✅ ROUTES
   ============================== */

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));


// ✅ Seller routes
app.use("/api/seller", require("./routes/sellerAnalyticsRoutes"));
app.use("/api/seller/orders", require("./routes/sellerOrderRoutes"));

// ✅ Users routes
app.use("/api/users", require("./routes/userRoutes"));

// ✅ Admin routes
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/admin/categories", require("./routes/adminCategoryRoutes"));
app.use("/api/admin/settings", require("./routes/adminSettingsRoutes"));

app.use("/api/categories", require("./routes/categoryRoutes"));

/* ==============================
   ✅ HEALTH CHECK
   ============================== */

app.get("/", (req, res) => {
  res.send("API Running ✅");
});

/* ==============================
   ✅ GLOBAL ERROR HANDLER
   ============================== */

app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.message);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

/* ==============================
   ✅ DATABASE CONNECTION
   ============================== */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err.message));

/* ==============================
   ✅ START SERVER
   ============================== */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));