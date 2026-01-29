import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProducts, deleteProduct } from "../../api/productapi";
import "../../styles/SellerProducts.css";

function SellerProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await getMyProducts();
      setProducts(res.data || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load products");
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    loadProducts();
    // eslint-disable-next-line
  }, []);

  const getCategoryName = (p) => {
    if (!p?.category) return "Uncategorized";
    // populated object
    if (typeof p.category === "object") return p.category?.name || "Uncategorized";
    // string/id fallback
    return String(p.category);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      setDeletingId(id);
      await deleteProduct(id);

      // instant UI update
      setProducts((prev) => prev.filter((x) => x._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="my-products">
      <div className="my-products-header">
        <div>
          <h2>My Products</h2>
          <p className="subtext">Manage your products and stock</p>
        </div>

        <button className="add-btn" onClick={() => navigate("/seller/addproduct")}>
          + Add Product
        </button>
      </div>

      {loading ? (
        <p className="status">Loading...</p>
      ) : products.length === 0 ? (
        <p className="status">No products found.</p>
      ) : (
        <div className="products-grid">
          {products.map((p) => (
            <div className="product-card" key={p._id}>
              <div className="img-box">
                <img
                  src={
                    p.image
                      ? `http://localhost:5000${p.image}`
                      : "https://via.placeholder.com/300"
                  }
                  alt={p.name}
                  onError={(e) =>
                    (e.currentTarget.src = "https://via.placeholder.com/300")
                  }
                />
              </div>

              <div className="info">
                <div className="name-row">
                  <h4 title={p.name}>{p.name}</h4>

                  {/* ✅ Category Badge */}
                  <span className="cat-badge">{getCategoryName(p)}</span>
                </div>

                <p className="price">₹ {Number(p.price || 0).toLocaleString("en-IN")}</p>
                <p className={`stock ${Number(p.stock || 0) <= 0 ? "out" : Number(p.stock || 0) <= 5 ? "low" : "in"}`}>
                  Stock: {p.stock}
                </p>
              </div>

              <div className="actions">
                <button className="edit" onClick={() => navigate(`/seller/edit/${p._id}`)}>
                  Edit
                </button>

                <button
                  className="delete"
                  onClick={() => handleDelete(p._id)}
                  disabled={deletingId === p._id}
                >
                  {deletingId === p._id ? "Deleting..." : "Delete"}
                </button>
              </div>

              <div className="pid">ID: {p._id}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerProducts;
