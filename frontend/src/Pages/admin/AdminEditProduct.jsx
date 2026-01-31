import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../../styles/AdminEditProduct.css";
import { updateAdminProduct, getAdminProductById } from "../../api/adminApi";
import { getAdminCategories } from "../../api/adminCategoryApi";

export default function AdminEditProduct() {
  const nav = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    image: "",
  });

  const [imageFile, setImageFile] = useState(null);

  const [error, setError] = useState("");

  // ✅ Load categories
  const loadCategories = async () => {
    try {
      setError("");
      const res = await getAdminCategories();
      setCategories(res.data?.categories || []);
    } catch (err) {
      console.log("❌ category load error:", err.response?.data || err);
      setError("Failed to load categories");
    }
  };

  // ✅ Image preview (file > server image)
  const imagePreview = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);

    if (form.image) {
      if (String(form.image).startsWith("http")) return form.image;
      return `http://localhost:5000${form.image}`;
    }
    return "";
  }, [imageFile, form.image]);

  // ✅ Clean up created object URL (avoid memory leak)
  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // ✅ Load product
  const loadProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getAdminProductById(id);
      const p = res.data?.product;

      if (!p) {
        setError("Product not found");
        nav("/admin/product");
        return;
      }

      const categoryId =
        typeof p.category === "object" ? p.category?._id || "" : p.category || "";

      setForm({
        name: p.name || "",
        price: p.price ?? "",
        stock: p.stock ?? "",
        category: categoryId,
        description: p.description || "",
        image: p.image || "",
      });
    } catch (err) {
      console.log("❌ load product error:", err.response?.data || err);
      setError("Failed to load product details");
      nav("/admin/product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      nav("/admin/product");
      return;
    }

    loadCategories();
    loadProduct();
    // eslint-disable-next-line
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;

    // optional: clear error when user edits
    if (error) setError("");

    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.category) {
      setError("Please select a category");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("price", String(form.price));
      fd.append("stock", String(form.stock));
      fd.append("category", form.category);
      fd.append("description", form.description || "");
      if (imageFile) fd.append("image", imageFile);

      await updateAdminProduct(id, fd);
      nav("/admin/product");
    } catch (err) {
      console.log("❌ update product error:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="aep-page">
      <div className="aep-head">
        <div>
          <h2 className="aep-title">Edit Product</h2>
          <p className="aep-sub">
            Product ID: <span className="aep-mono">{id}</span>
          </p>
        </div>

        <Link className="aep-back" to="/admin/product">
          ← Back
        </Link>
      </div>

      {/* ✅ Error message UI */}
      {error && <div className="aep-error">{error}</div>}

      {loading ? (
        <div className="aep-empty">Loading...</div>
      ) : (
        <form className="aep-card" onSubmit={onSubmit}>
          <div className="aep-grid">
            <div className="aep-field">
              <label>Product Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                required
              />
            </div>

            <div className="aep-field">
              <label>Category *</label>

              <div style={{ position: "relative" }}>
                <select
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    appearance: "none",
                    outline: "none",
                    boxShadow: "0 8px 18px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select category</option>

                  {categories
                    .filter((c) => String(c.status).toLowerCase() === "active")
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </select>

                <span
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  ▼
                </span>
              </div>
            </div>

            <div className="aep-field">
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={onChange}
                required
                min="0"
              />
            </div>

            <div className="aep-field">
              <label>Stock *</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={onChange}
                required
                min="0"
              />
            </div>

            <div className="aep-field full">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={5}
              />
            </div>

            <div className="aep-field full">
              <label>Replace Image</label>

              <div className="aep-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (error) setError("");
                    setImageFile(e.target.files?.[0] || null);
                  }}
                />

                {imagePreview ? (
                  <img
                    className="aep-preview"
                    src={imagePreview}
                    alt="preview"
                    onError={(e) => (e.currentTarget.src = "/no-image.png")}
                  />
                ) : (
                  <div className="aep-placeholder">No image</div>
                )}
              </div>
            </div>
          </div>

          <button className="aep-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
}
