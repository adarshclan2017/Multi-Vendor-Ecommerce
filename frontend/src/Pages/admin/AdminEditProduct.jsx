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
    category: "", // ✅ must store categoryId
    description: "",
    image: "",
  });

  const [imageFile, setImageFile] = useState(null);

  // ✅ Load categories
  const loadCategories = async () => {
    try {
      const res = await getAdminCategories();
      setCategories(res.data?.categories || []);
    } catch (err) {
      console.log("❌ category load error:", err.response?.data || err);
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
      const res = await getAdminProductById(id);
      const p = res.data?.product;

      if (!p) {
        alert("Product not found");
        nav("/admin/product");
        return;
      }

      // ✅ convert category to id always (handles populated object OR string id)
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
      alert(err.response?.data?.message || "Failed to load product");
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

    // small safety for number fields (optional)
    if (name === "price" || name === "stock") {
      setForm((p) => ({ ...p, [name]: value }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // ✅ basic validation
    if (!form.category) {
      alert("Please select a category");
      return;
    }

    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("price", String(form.price));
      fd.append("stock", String(form.stock));
      fd.append("category", form.category); // ✅ MUST BE categoryId (_id)
      fd.append("description", form.description || "");
      if (imageFile) fd.append("image", imageFile);

      // debug once if needed:
      // console.log("Sending category:", form.category);

      await updateAdminProduct(id, fd);

      alert("Product updated ✅");
      nav("/admin/product");
    } catch (err) {
      console.log("❌ update product error:", err.response?.data || err);
      alert(err.response?.data?.message || "Update failed");
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

            {/* ✅ CATEGORY DROPDOWN (FIXED) */}
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
                      // ✅ value must be _id
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
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
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
