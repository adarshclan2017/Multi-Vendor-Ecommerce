const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const adminSettingsRoutes = require("./routes/adminSettingsRoutes");

dotenv.config();

const app = express();

/* ==============================
   ✅ CORS CONFIG (FINAL FIX)
   - Allows localhost
   - Allows your production Vercel domain
   - Allows ANY vercel preview domain (*.vercel.app)
   - Uses SAME rules for preflight (OPTIONS)
   ============================== */

const allowedOrigins = [
  "http://localhost:5173",
  "https://multi-vendor-ecommerce-pink.vercel.app",
];

// ✅ One CORS options object used for both app.use + app.options
const corsOptions = {
  origin: function (origin, callback) {
    // allow Postman / server-to-server (no origin)
    if (!origin) return callback(null, true);

    // allow exact allowed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // allow any vercel preview url
    if (origin.endsWith(".vercel.app")) return callback(null, true);

    return callback(new Error("CORS blocked: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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

// ✅ Seller routes
app.use("/api/seller", require("./routes/sellerAnalyticsRoutes"));
app.use("/api/seller/orders", require("./routes/sellerOrderRoutes"));

// ✅ Users routes
app.use("/api/users", require("./routes/userRoutes"));

// ✅ Admin routes
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