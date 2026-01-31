const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },

    // ✅ category ref
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    image: { type: String, default: "" },

    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // ✅ reviews
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 }, // avg rating
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);
