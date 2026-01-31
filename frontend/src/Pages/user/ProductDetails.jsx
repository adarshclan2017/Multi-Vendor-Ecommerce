// src/Pages/user/ProductDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../../styles/ProductDetails.css";
import { getProductById, addReview } from "../../api/productapi";
import { addToCart } from "../../api/cartapi";
import Stars from "../../components/Stars";

const FALLBACK_IMG = "https://via.placeholder.com/1200x900?text=No+Image";

export default function ProductDetails() {
  const { id } = useParams();
  const nav = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState({})


  // ✅ Gallery states
  const [activeImg, setActiveImg] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  // ✅ Zoom state (nice zoom follow)
  const [zoomOn, setZoomOn] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const categoryName = useMemo(() => {
    const c = product?.category;
    if (!c) return "";
    if (typeof c === "string") return c;
    return c?.name || "";
  }, [product?.category]);

  const outOfStock = Number(product?.stock) <= 0;

  // ✅ Build images array (supports: image, images[0], full urls, local paths)
  const images = useMemo(() => {
    const list = [];

    const pushImg = (img) => {
      if (!img) return;
      const s = String(img);
      if (s.startsWith("http")) list.push(s);
      else list.push(`http://localhost:5000${s}`);
    };

    pushImg(product?.image);
    (product?.images || []).forEach(pushImg);

    // remove duplicates
    const uniq = Array.from(new Set(list));
    return uniq.length ? uniq : [FALLBACK_IMG];
  }, [product?.image, product?.images]);

  // ✅ keep active image in sync
  useEffect(() => {
    if (!activeImg && images?.[0]) setActiveImg(images[0]);
    // eslint-disable-next-line
  }, [images]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getProductById(id);
      const p = res.data?.product || res.data;
      setProduct(p);
    } catch (err) {
      console.log("❌ product details error:", err.response?.data || err);
      nav("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return nav("/");
    load();
    // eslint-disable-next-line
  }, [id]);

  // ✅ close preview on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setPreviewOpen(false);
    if (previewOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewOpen]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return nav("/login");

    try {
      setAdding(true);
      await addToCart(product._id, 1);
      nav("/cart");
    } catch (err) {
      console.log("❌ add to cart error:", err.response?.data || err);
    } finally {
      setAdding(false);
    }
  };

  const submitReview = async () => {
    const token = localStorage.getItem("token");
    if (!token) return nav("/login");

    if (!rating || rating < 1 || rating > 5) return

    try {
      setReviewing(true);
      const res = await addReview(product._id, { rating, comment });
      setProduct(res.data?.product || res.data?.updatedProduct || res.data);
      setRating(5);
      setComment("");
    } catch (err) {
      console.log("❌ review error:", err.response?.data || err);
      setErrors({ message: err.response?.data?.message || "Failed to add review" });
    } finally {
      setReviewing(false);
    }
  };

  // ✅ mouse move to update zoom position
  const onMove = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * 100;
    const y = ((e.clientY - box.top) / box.height) * 100;
    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  if (loading) {
    return (
      <div className="pd-page">
        <div className="pd-empty">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-page">
        <div className="pd-empty">Product not found.</div>
      </div>
    );
  }

  return (
    <div className="pd-page">
      <div className="pd-topbar">
        <Link className="pd-back" to="/">
          ← Back to products
        </Link>
        <Link className="pd-cart" to="/cart">
          Go to Cart
        </Link>
      </div>

      <div className="pd-card">
        {/* ✅ LEFT: Pro Gallery */}
        <div className="pd-gallery">
          {/* Thumbnails */}
          <div className="pd-thumbs">
            {images.map((img, idx) => {
              const active = img === activeImg;
              return (
                <button
                  key={img + idx}
                  className={`pd-thumb ${active ? "active" : ""}`}
                  onClick={() => setActiveImg(img)}
                  type="button"
                  title="View image"
                >
                  <img
                    src={img}
                    alt={`thumb-${idx}`}
                    onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                  />
                </button>
              );
            })}
          </div>

          {/* Main image */}
          <div
            className={`pd-main ${zoomOn ? "zoom" : ""}`}
            onMouseEnter={() => setZoomOn(true)}
            onMouseLeave={() => setZoomOn(false)}
            onMouseMove={onMove}
            onClick={() => setPreviewOpen(true)}
            role="button"
            tabIndex={0}
          >
            <img
              className="pd-mainImg"
              src={activeImg || images[0]}
              alt={product?.name || "Product"}
              loading="lazy"
              onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              style={{
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
            />

            <span className={`pd-badge ${outOfStock ? "danger" : "ok"}`}>
              {outOfStock ? "Out of stock" : `In stock: ${product?.stock ?? 0}`}
            </span>

            <div className="pd-hint">Click to view full</div>
          </div>
        </div>

        {/* ✅ RIGHT: Info */}
        <div className="pd-info">
          <div className="pd-head">
            <h2 className="pd-title">{product?.name}</h2>
            <div className="pd-price">
              ₹ {Number(product?.price || 0).toLocaleString("en-IN")}
            </div>
          </div>

          <div className="pd-ratingRow">
            <Stars value={product?.rating || 0} size={18} />
            <span className="pd-ratingText">
              {Number(product?.rating || 0).toFixed(1)} / 5 • {product?.numReviews || 0} reviews
            </span>
          </div>

          {categoryName ? <div className="pd-cat">{categoryName}</div> : null}

          <p className="pd-desc">
            {product?.description ? product.description : "No description provided."}
          </p>

          <div className="pd-actions">
            <button
              className="pd-btn primary"
              onClick={handleAddToCart}
              disabled={outOfStock || adding}
              title={outOfStock ? "Out of stock" : "Add to cart"}
            >
              {adding ? "Adding..." : outOfStock ? "Unavailable" : "Add to Cart"}
            </button>

            <button className="pd-btn ghost" onClick={() => nav("/cart")}>
              View Cart
            </button>
          </div>

          {/* Review box */}
          <div className="pd-reviewBox">
            <h4 className="pd-reviewTitle">Write a Review</h4>

            <div className="pd-reviewForm">
              <label>Rating</label>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r > 1 ? "s" : ""}
                  </option>
                ))}
              </select>

              <label>Comment</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your feedback..."
              />
              {errors.message && <p className="error text-danger">{errors.message}</p>}
              <button onClick={submitReview} disabled={reviewing}>
                {reviewing ? "Posting..." : "Post Review"}
              </button>
            </div>

            <div className="pd-reviewsList">
              {(product?.reviews || [])
                .slice()
                .reverse()
                .map((r) => (
                  <div key={r._id} className="pd-reviewItem">
                    <div className="pd-reviewTop">
                      <b>{r.name}</b>
                      <Stars value={r.rating} size={14} />
                    </div>
                    <p>{r.comment || "—"}</p>
                    <span className="pd-date">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="pd-meta">
            <div>
              <span>ID:</span> <b className="pd-mono">{product?._id}</b>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Fullscreen Preview */}
      {previewOpen && (
        <div className="pd-modal" onClick={() => setPreviewOpen(false)}>
          <div className="pd-modalBox" onClick={(e) => e.stopPropagation()}>
            <button className="pd-close" onClick={() => setPreviewOpen(false)}>
              ✕
            </button>

            <img
              className="pd-modalImg"
              src={activeImg || images[0]}
              alt={product?.name || "Product"}
              onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
            />

            {/* optional: next/prev */}
            {images.length > 1 && (
              <div className="pd-modalNav">
                <button
                  onClick={() => {
                    const i = images.indexOf(activeImg || images[0]);
                    const prev = (i - 1 + images.length) % images.length;
                    setActiveImg(images[prev]);
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={() => {
                    const i = images.indexOf(activeImg || images[0]);
                    const next = (i + 1) % images.length;
                    setActiveImg(images[next]);
                  }}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
