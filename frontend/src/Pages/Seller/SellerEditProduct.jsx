import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/SellerEditProduct.css";
import { getProductById, updateProduct } from "../../api/productapi";
import { getPublicCategories } from "../../api/categoryApi";

// ✅ Local fallback (NO external DNS)
const FALLBACK_IMG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'>
      <rect width='100%' height='100%' fill='#f2f2f2'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
        font-family='Arial' font-size='18' fill='#666'>
        No Image
      </text>
    </svg>
  `);

function SellerEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);

  const [categories, setCategories] = useState([]);

  const [product, setProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    image: null, // new uploaded file
  });

  // ✅ store current image URL (Cloudinary)
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const newImagePreview = useMemo(() => {
    if (!product.image) return "";
    return URL.createObjectURL(product.image);
  }, [product.image]);

  useEffect(() => {
    return () => {
      if (newImagePreview) URL.revokeObjectURL(newImagePreview);
    };
  }, [newImagePreview]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const res = await getProductById(id);
        const p = res.data?.product || res.data;

        setProduct({
          name: p?.name || "",
          price: p?.price ?? "",
          stock: p?.stock ?? "",
          description: p?.description || "",
          category:
            typeof p?.category === "object"
              ? p?.category?._id || ""
              : p?.category || "",
          image: null,
        });

        // ✅ handle new image format {url, publicId} or old string URL
        const imgUrl =
          p?.image?.url ||
          (typeof p?.image === "string" && p.image.startsWith("http")
            ? p.image
            : "");

        setCurrentImageUrl(imgUrl);
      } catch (err) {
        console.log("❌ load product error:", err.response?.data || err);
        setError("Failed to load product");
        navigate("/seller/product");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate]);

  // ✅ Load categories
  useEffect(() => {
    (async () => {
      try {
        setLoadingCats(true);
        const res = await getPublicCategories();
        setCategories(res.data?.categories || []);
      } catch (e) {
        console.log("❌ category load error:", e.response?.data || e);
        setError("Failed to load categories");
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (error) setError("");
    if (success) setSuccess("");

    setProduct((prev) => ({
      ...prev,
      [name]: files && files.length ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!product.category) {
    setError("Please select a category");
    return;
  }

  try {
    setSaving(true);
    setError("");
    setSuccess("");

    // ✅ build JSON payload (your backend expects JSON)
    const payload = {
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      description: product.description,
    };

    // ✅ If new image chosen, upload first then attach {url, publicId}
    if (product.image) {
      const fd = new FormData();
      fd.append("image", product.image);

      // IMPORTANT: this endpoint is your upload route
      const up = await api.post("/upload", fd); // <-- use your axios instance
      payload.image = up.data; // { url, publicId }
    }

    // ✅ Update product with JSON
    await updateProduct(id, payload);

    setSuccess("Product updated successfully ✅");
    navigate("/seller/product");
  } catch (err) {
    console.log("❌ update failed:", err.response?.data || err);
    setError(err.response?.data?.message || "Update failed");
  } finally {
    setSaving(false);
  }
};
  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div className="sep-page">
      <div className="sep-head">
        <div>
          <h2 className="sep-title">Edit Product</h2>
          <p className="sep-sub">Update your product details</p>
        </div>

        <button className="sep-back" onClick={() => navigate("/seller/product")}>
          ← Back
        </button>
      </div>

      {error && <div className="sep-error">{error}</div>}
      {success && <div className="sep-success">{success}</div>}

      <form className="sep-card" onSubmit={handleSubmit}>
        <div className="sep-grid">
          <div className="sep-field">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="sep-field">
            <label>Category *</label>
            <div className="sep-selectWrap">
              <select
                name="category"
                value={product.category}
                onChange={handleChange}
                required
                disabled={loadingCats}
              >
                <option value="">
                  {loadingCats ? "Loading categories..." : "Select category"}
                </option>

                {categories
                  .filter((c) => String(c.status).toLowerCase() === "active")
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
              </select>
              <span className="sep-selectArrow">▼</span>
            </div>
          </div>

          <div className="sep-field">
            <label>Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="sep-field">
            <label>Stock *</label>
            <input
              type="number"
              name="stock"
              value={product.stock}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="sep-field full">
            <label>Description</label>
            <textarea
              name="description"
              rows="5"
              value={product.description}
              onChange={handleChange}
            />
          </div>

          <div className="sep-field full">
            <label>Images</label>

            <div className="sep-images">
              <div className="sep-imgBlock">
                <div className="sep-imgTitle">Current</div>
                <img
                  src={currentImageUrl || FALLBACK_IMG}
                  alt="current"
                  onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                />
              </div>

              <div className="sep-imgBlock">
                <div className="sep-imgTitle">New (preview)</div>
                {newImagePreview ? (
                  <img src={newImagePreview} alt="preview" />
                ) : (
                  <div className="sep-imgPlaceholder">No new image</div>
                )}
              </div>
            </div>

            <div className="sep-upload">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
              />
              <small>Upload only if you want to replace the image</small>
            </div>
          </div>
        </div>

        <button className="sep-btn" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Update Product"}
        </button>
      </form>
    </div>
  );
}

export default SellerEditProduct;