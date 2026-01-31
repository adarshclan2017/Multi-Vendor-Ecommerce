import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProducts, deleteProduct } from "../../api/productapi";
import "../../styles/SellerProducts.css";

function SellerProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  // ✅ UI messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ custom confirm modal
  const [confirmDel, setConfirmDel] = useState(null); // { _id, name }
  const [deleting, setDeleting] = useState(false);

  const flashSuccess = (text, ms = 2500) => {
    setSuccess(text);
    setTimeout(() => setSuccess(""), ms);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await getMyProducts();
      setProducts(res.data || []);
    } catch (err) {
      console.log("❌ load products:", err.response?.data || err);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        return navigate("/login");
      }

      setError(err.response?.data?.message || "Failed to load products");
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
    if (typeof p.category === "object") return p.category?.name || "Uncategorized";
    return String(p.category);
  };

  // ✅ open confirm modal
  const askDelete = (p) => {
    setError("");
    setSuccess("");
    setConfirmDel({ _id: p._id, name: p.name });
  };

  // ✅ confirm delete
  const confirmDelete = async () => {
    if (!confirmDel?._id) return;

    try {
      setDeleting(true);
      setDeletingId(confirmDel._id);
      setError("");
      setSuccess("");

      await deleteProduct(confirmDel._id);

      // ✅ instant UI update
      setProducts((prev) => prev.filter((x) => x._id !== confirmDel._id));
      setConfirmDel(null);
      flashSuccess("Product deleted successfully ✅");
    } catch (err) {
      console.log("❌ delete failed:", err.response?.data || err);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        setConfirmDel(null);
        return navigate("/login");
      }

      setError(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
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

      {/* ✅ Messages */}
      {error && <div className="sp-error">{error}</div>}
      {success && <div className="sp-success">{success}</div>}

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
                  <span className="cat-badge">{getCategoryName(p)}</span>
                </div>

                <p className="price">
                  ₹ {Number(p.price || 0).toLocaleString("en-IN")}
                </p>

                <p
                  className={`stock ${
                    Number(p.stock || 0) <= 0
                      ? "out"
                      : Number(p.stock || 0) <= 5
                      ? "low"
                      : "in"
                  }`}
                >
                  Stock: {p.stock}
                </p>
              </div>

              <div className="actions">
                <button className="edit" onClick={() => navigate(`/seller/edit/${p._id}`)}>
                  Edit
                </button>

                <button
                  className="delete"
                  onClick={() => askDelete(p)}
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

      {/* ✅ Delete Confirm Modal (NO browser popup) */}
      {confirmDel && (
        <div
          className="sp-modalOverlay"
          onClick={() => !deleting && setConfirmDel(null)}
        >
          <div className="sp-confirm" onClick={(e) => e.stopPropagation()}>
            <h3 className="sp-confirm-title">Delete Product?</h3>
            <p className="sp-confirm-text">
              Are you sure you want to delete <b>{confirmDel.name}</b>?
            </p>

            <div className="sp-confirmBtns">
              <button
                className="sp-confirm-no"
                onClick={() => setConfirmDel(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="sp-confirm-yes"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerProducts;
