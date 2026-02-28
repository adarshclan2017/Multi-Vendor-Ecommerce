import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/Productcard.css";
import { addToCart } from "../../api/cartapi";
import Stars from "../../components/Stars";

const FALLBACK_IMG = "/no-image.png";

export default function Productcard({ Product }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ supports: string (old /uploads/..) OR object (cloudinary)
  const imageUrl = useMemo(() => {
    const img = Product?.image;

    if (!img) return FALLBACK_IMG;

    // cloudinary: { url, publicId }
    if (typeof img === "object" && img.url) return img.url;

    // old: "/uploads/xxx.jpg"
    if (typeof img === "string") {
      if (img.startsWith("http")) return img;
      // ✅ IMPORTANT: use your backend base url here if needed
      return `${import.meta.env.VITE_API_URL}${img}`;
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
            onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
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

            <Link className="pc-btn pc-btn--ghost" to={`/product/${Product?._id}`}>
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}