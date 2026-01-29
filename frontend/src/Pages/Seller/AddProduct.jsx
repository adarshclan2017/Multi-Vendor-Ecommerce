import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/SellerAddProduct.css";

import { createProduct } from "../../api/productapi";
import { getPublicCategories } from "../../api/categoryApi";

function AddProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [saving, setSaving] = useState(false);

  const [product, setProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "", // ✅ NEW
    description: "",
    image: null,
  });

  const imagePreview = useMemo(() => {
    if (!product.image) return "";
    return URL.createObjectURL(product.image);
  }, [product.image]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // ✅ Protect seller page (must be logged in)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      navigate("/login");
    }
  }, [navigate]);

  // ✅ Load categories (PUBLIC)
  useEffect(() => {
    (async () => {
      try {
        setLoadingCats(true);
        const res = await getPublicCategories();
        setCategories(res.data?.categories || []);
      } catch (e) {
        console.log("❌ category load error:", e.response?.data || e);
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setProduct((prev) => ({
      ...prev,
      [name]: files && files.length ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    console.log("✅ Token on AddProduct:", token);

    if (!token) {
      alert("Token missing. Please login again.");
      navigate("/login");
      return;
    }

    if (!product.category) {
      alert("Please select a category");
      return;
    }

    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("name", product.name);
      fd.append("price", product.price);
      fd.append("stock", product.stock);
      fd.append("category", product.category); // ✅ NEW
      fd.append("description", product.description);
      if (product.image) fd.append("image", product.image);

      const res = await createProduct(fd);

      console.log("✅ Saved product:", res.data);
      alert("Product added successfully!");

      // reset state + UI
      setProduct({
        name: "",
        price: "",
        stock: "",
        category: "",
        description: "",
        image: null,
      });
      e.target.reset();
    } catch (err) {
      console.error("❌ Add product error:", err.response?.data || err);
      alert(err.response?.data?.message || "Add product failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sap-page">
      <h2 className="sap-title">Add New Product</h2>

      <form className="sap-card" onSubmit={handleSubmit}>
        <div className="sap-grid">
          <div className="sap-field">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter product name"
              value={product.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* ✅ Category Dropdown */}
          <div className="sap-field">
            <label>Category *</label>
            <div className="sap-selectWrap">
              <select
                name="category"
                value={product.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories
                  .filter((c) => c.status === "active")
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
              </select>
              <span className="sap-selectArrow">▼</span>
            </div>
          </div>

          <div className="sap-field">
            <label>Price (₹) *</label>
            <input
              type="number"
              name="price"
              placeholder="Enter price"
              value={product.price}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="sap-field">
            <label>Stock *</label>
            <input
              type="number"
              name="stock"
              placeholder="Available stock"
              value={product.stock}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="sap-field full">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Product description"
              rows="5"
              value={product.description}
              onChange={handleChange}
            />
          </div>

          <div className="sap-field full">
            <label>Product Image</label>
            <div className="sap-upload">
              <input type="file" name="image" accept="image/*" onChange={handleChange} />

              {imagePreview ? (
                <img className="sap-preview" src={imagePreview} alt="preview" />
              ) : (
                <div className="sap-placeholder">No image</div>
              )}
            </div>
          </div>
        </div>

        <button type="submit" className="sap-btn" disabled={saving}>
          {saving ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;
