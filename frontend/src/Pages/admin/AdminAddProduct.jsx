import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/AdminAddProduct.css";

import { createAdminProduct } from "../../api/adminApi";
import { getAdminCategories } from "../../api/adminCategoryApi";

export default function AdminAddProduct() {
  const nav = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
  });

  const [image, setImage] = useState(null);

  const imagePreview = useMemo(() => {
    if (!image) return "";
    return URL.createObjectURL(image);
  }, [image]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // ✅ Load categories from DB
  useEffect(() => {
    (async () => {
      try {
        setLoadingCats(true);
        const res = await getAdminCategories();
        setCategories(res.data?.categories || []);
      } catch (e) {
        console.log("❌ category load error:", e.response?.data || e);
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.category) {
      alert("Please select a category");
      return;
    }

    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("stock", form.stock);
      fd.append("category", form.category);
      fd.append("description", form.description);
      if (image) fd.append("image", image);

      await createAdminProduct(fd);

      alert("Product added ✅");
      nav("/admin/product");
    } catch (err) {
      console.log("❌ add product error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="aap-page">
      <div className="aap-head">
        <div>
          <h2 className="aap-title">Add Product</h2>
          <p className="aap-sub">Create a new product and assign a category</p>
        </div>

        <Link className="aap-back" to="/admin/product">
          ← Back
        </Link>
      </div>

      <form className="aap-card" onSubmit={onSubmit}>
        <div className="aap-grid">
          <div className="aap-field">
            <label>Product Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="aap-field">
            <label>Category *</label>

            <div className="aap-selectWrap">
              <select
                name="category"
                value={form.category}
                onChange={onChange}
                required
                disabled={loadingCats}
              >
                <option value="">
                  {loadingCats ? "Loading categories..." : "Select Category"}
                </option>

                {categories
                  .filter((c) => c.status !== "inactive")
                  .map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
              </select>

              <span className="aap-selectArrow">▼</span>
            </div>
          </div>

          <div className="aap-field">
            <label>Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={onChange}
              placeholder="Enter price"
              required
              min="0"
            />
          </div>

          <div className="aap-field">
            <label>Stock *</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={onChange}
              placeholder="Enter stock"
              required
              min="0"
            />
          </div>

          <div className="aap-field full">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Write product description..."
              rows={5}
            />
          </div>

          <div className="aap-field full">
            <label>Product Image</label>

            <div className="aap-upload">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />

              {imagePreview ? (
                <img
                  className="aap-preview"
                  src={imagePreview}
                  alt="preview"
                  onError={(e) => (e.currentTarget.src = "/no-image.png")}
                />
              ) : (
                <div className="aap-placeholder">No image</div>
              )}
            </div>
          </div>
        </div>

        <button className="aap-btn" type="submit" disabled={saving}>
          {saving ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
