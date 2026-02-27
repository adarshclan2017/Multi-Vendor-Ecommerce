const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const adminSettingsRoutes = require("./routes/adminSettingsRoutes");

dotenv.config();

const app = express();

/* ==============================
   ✅ CORS CONFIG (PRODUCTION SAFE)
   ============================== */

const allowedOrigins = [
  "http://localhost:5173",
  "https://multi-vendor-ecommerce-pink.vercel.app",
];

// Allow any Vercel preview URL automatically
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman/server-to-server

      if (
        allowedOrigins.includes(origin) ||
        origin.includes("vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight
app.options("*", cors());

/* ==============================
   ✅ BODY PARSERS
   ============================== */

app.use(express.json());
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

// Seller routes
app.use("/api/seller", require("./routes/sellerAnalyticsRoutes"));
app.use("/api/seller/orders", require("./routes/sellerOrderRoutes"));

// User routes
app.use("/api/users", require("./routes/userRoutes"));

// Admin routes
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/admin/categories", require("./routes/adminCategoryRoutes"));
app.use("/api/admin/settings", adminSettingsRoutes);

app.use("/api/categories", require("./routes/categoryRoutes"));

/* ==============================
   ✅ HEALTH CHECK
   ============================== */

app.get("/", (req, res) => {
  res.send("API Running ✅");
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});