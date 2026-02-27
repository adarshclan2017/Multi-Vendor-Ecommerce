const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

console.log("✅ DEPLOY CHECK: Backend/server.js - 2026-02-27");

const app = express();

/* ==============================
   ✅ CORS (RENDER + VERCEL SAFE)
   ============================== */

/**
 * Add your FIXED frontend production URLs here:
 * - Vercel production domain
 * - Any custom domain (if you add later)
 */
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://multi-vendor-ecommerce-pink.vercel.app",
]);

/**
 * ✅ Allow Vercel Preview Deployments
 * Example:
 * https://multi-vendor-ecommerce-xxxxx-adarshclan2017s-projects.vercel.app
 *
 * This is more controlled than allowing ANY *.vercel.app
 * It only allows:
 * - your project name prefix (multi-vendor-ecommerce)
 * - your Vercel team/user suffix (adarshclan2017s-projects)
 */
const isAllowedVercelPreview = (origin) => {
  try {
    const { hostname } = new URL(origin);

    // ✅ change these 2 strings if your vercel preview pattern changes
    const projectPrefix = "multi-vendor-ecommerce";
    const ownerSuffix = "adarshclan2017s-projects.vercel.app";

    return (
      hostname === `${projectPrefix}.vercel.app` ||
      (hostname.startsWith(`${projectPrefix}-`) && hostname.endsWith(ownerSuffix))
    );
  } catch (e) {
    return false;
  }
};

const corsOptions = {
  origin: (origin, cb) => {
    // Postman / server-to-server
    if (!origin) return cb(null, true);

    // exact allowlist
    if (allowedOrigins.has(origin)) return cb(null, true);

    // vercel preview allow
    if (isAllowedVercelPreview(origin)) return cb(null, true);

    return cb(new Error("Not allowed by CORS: " + origin));
  },

  // ✅ If you use JWT in headers (Authorization: Bearer token) → you can keep false.
  // If you use cookies/sessions → set true.
  credentials: false,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

/**
 * ✅ Preflight handler (NO app.options("*") — avoids path-to-regexp crash)
 */
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

app.use("/api/seller", require("./routes/sellerAnalyticsRoutes"));
app.use("/api/seller/orders", require("./routes/sellerOrderRoutes"));

app.use("/api/users", require("./routes/userRoutes"));

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