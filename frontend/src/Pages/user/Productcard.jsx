import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/Productcard.css";
import { addToCart } from "../../api/cartapi";
import Stars from "../../components/Stars";

// ✅ Make sure this file exists in public folder
// public/no-image.png
const FALLBACK_IMG = "/no-image.png";

export default function Productcard({ Product }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ SAFE IMAGE HANDLING (Cloudinary + uploads + block placeholder)
  const imageUrl = useMemo(() => {
    const img = Product?.image;

    if (!img) return FALLBACK_IMG;

    // Cloudinary object { url, publicId }
    if (typeof img === "object" && img?.url) {
      return img.url;
    }

    if (typeof img === "string") {
      const s = img.trim();

      // 🔥 BLOCK placeholder domain (your main issue)
      if (s.includes("via.placeholder.com")) {
        return FALLBACK_IMG;
      }

      // Full external URL
      if (s.startsWith("http")) {
        return s;
      }

      // Local upload path ("/uploads/xxx.jpg")
      const base = import.meta.env.VITE_API_URL || "";
      return `${base}${s.startsWith("/") ? s : `/${s}`}`;
    }

    return FALLBACK_IMG;
  }, [Product?.image]);

  const categoryName = useMemo(() => {
    const c = Product?.category;
    if (!c) return "";
    if (typeof c === "string") return c;
    return c?.name || "";
  }, [Product?.category]);

  const outOfStock = Number(Product?.stock) <= 0;

  const handleAddToCart = async () => {
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to add items to cart");
      return navigate("/login");
    }

    if (!Product?._id) {
      setError("Product information missing");
      return;
    }

    try {
      await addToCart(Product._id, 1);
      setSuccess("Added to cart successfully ✅");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Add to cart failed");
      setTimeout(() => setError(""), 4000);
    }
  };

  return (
    <div className="col mb-4">
      <div className="pc-card">
        <Link to={`/product/${Product?._id}`} className="pc-media">
          <img
            className="pc-img"
            src={imageUrl}
            alt={Product?.name || "Product"}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null; // prevent infinite loop
              e.currentTarget.src = FALLBACK_IMG;
            }}
          />

          <span
            className={`pc-badge ${
              outOfStock ? "pc-badge--danger" : "pc-badge--ok"
            }`}
          >
            {outOfStock ? "Out of stock" : `Stock: ${Product?.stock ?? 0}`}
          </span>
        </Link>

        <div className="pc-body">
          <div className="pc-top">
            <div className="pc-left">
              <h5 className="pc-title" title={Product?.name}>
                {Product?.name}
              </h5>

              {categoryName && (
                <p className="pc-cat" title={categoryName}>
                  {categoryName}
                </p>
              )}
            </div>

            <p className="pc-price">₹ {Product?.price}</p>
          </div>

          <div className="pc-ratingRow">
            <Stars value={Product?.rating || 0} size={14} />
            <span className="pc-rev">({Product?.numReviews || 0})</span>
          </div>

          {error && <p className="pc-msg pc-msg--error">{error}</p>}
          {success && <p className="pc-msg pc-msg--success">{success}</p>}

          <div className="pc-actions">
            <button
              className="pc-btn pc-btn--primary"
              onClick={handleAddToCart}
              disabled={outOfStock}
            >
              {outOfStock ? "Unavailable" : "Add to cart"}
            </button>

            <Link
              className="pc-btn pc-btn--ghost"
              to={`/product/${Product?._id}`}
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}