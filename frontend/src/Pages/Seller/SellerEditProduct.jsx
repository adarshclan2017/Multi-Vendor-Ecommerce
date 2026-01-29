import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/SellerEditProduct.css";
import { getProductById, updateProduct } from "../../api/productapi";
import { getPublicCategories } from "../../api/categoryApi";

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
    category: "", // ✅ NEW
    description: "",
    image: null, // new file
  });

  const [currentImage, setCurrentImage] = useState(""); // existing image path

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
        const res = await getProductById(id);

        setProduct({
          name: res.data?.name || "",
          price: res.data?.price ?? "",
          stock: res.data?.stock ?? "",
          description: res.data?.description || "",
          // ✅ if populated: res.data.category._id else res.data.category
          category:
            typeof res.data?.category === "object"
              ? res.data?.category?._id || ""
              : res.data?.category || "",
          image: null,
        });

        setCurrentImage(res.data?.image || "");
      } catch (err) {
        alert(err.response?.data?.message || "Failed to load product");
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

    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("name", product.name);
      fd.append("price", product.price);
      fd.append("stock", product.stock);
      fd.append("category", product.category); // ✅ NEW
      fd.append("description", product.description);

      // ✅ only send new image if user selected one
      if (product.image) fd.append("image", product.image);

      await updateProduct(id, fd);

      alert("Product updated ✅");
      navigate("/seller/product"); // ✅ your seller products route
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
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
                  .filter((c) => c.status === "active")
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
                  src={
                    currentImage
                      ? `http://localhost:5000${currentImage}`
                      : "https://via.placeholder.com/320x200"
                  }
                  alt="current"
                  onError={(e) =>
                    (e.currentTarget.src = "https://via.placeholder.com/320x200")
                  }
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
