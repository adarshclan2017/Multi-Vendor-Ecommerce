const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const adminSettingsRoutes = require("./routes/adminSettingsRoutes");

dotenv.config();

const app = express();

// ✅ CORS (keep only ONE)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));


// ✅ Seller routes
app.use("/api/seller", require("./routes/sellerAnalyticsRoutes"));
app.use("/api/seller/orders", require("./routes/sellerOrderRoutes"));

// ✅ Users routes (if you use it)
app.use("/api/users", require("./routes/userRoutes"));

// ✅ Admin routes (ONLY ONE)
// IMPORTANT: Make sure this file exists: Backend/routes/adminRoutes.js
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/admin/categories", require("./routes/adminCategoryRoutes"));

app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/admin/settings", adminSettingsRoutes);



// ✅ Health check (optional)
app.get("/", (req, res) => {
  res.send("API Running ✅");
});

// ✅ DB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
