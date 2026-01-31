import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/AdminProduct.css";
import { getAdminProducts, deleteAdminProduct } from "../../api/adminApi";

const money = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;

const stockClass = (stock) => {
  const s = Number(stock || 0);
  if (s <= 0) return "ap-badge out";
  if (s <= 5) return "ap-badge low";
  return "ap-badge in";
};

const imgUrl = (p) => {
  const img = p?.image || p?.images?.[0] || "";
  if (!img) return "/no-image.png";
  if (String(img).startsWith("http")) return img;
  return `http://localhost:5000${img}`;
};

export default function AdminProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAdminProducts();
      setProducts(res.data?.products || res.data || []);
    } catch (err) {
      console.log("❌ admin products error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    (products || []).forEach((p) => {
      const c = p?.category?.name || p?.category || "";
      if (c) set.add(String(c));
    });
    return ["all", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (products || [])
      .filter((p) => {
        if (cat === "all") return true;
        const c = p?.category?.name || p?.category || "";
        return String(c).toLowerCase() === String(cat).toLowerCase();
      })
      .filter((p) => {
        if (!query) return true;
        const name = String(p?.name || "").toLowerCase();
        const id = String(p?._id || "").toLowerCase();
        const c = String(p?.category?.name || p?.category || "").toLowerCase();
        return name.includes(query) || id.includes(query) || c.includes(query);
      });
  }, [products, q, cat]);

  const onDelete = async (id) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    try {
      setDeletingId(id);
      await deleteAdminProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      alert("Deleted ✅");
    } catch (err) {
      console.log("❌ delete product error:", err.response?.data || err);
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="ap-page">
      <div className="ap-head">
        <div>
          <h2 className="ap-title">Products</h2>
          <p className="ap-sub">Manage products, stock and pricing</p>
        </div>

        <div className="ap-headBtns">
          <button className="ap-btn" onClick={load} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <Link className="ap-btn primary" to="/admin/addproduct">
            + Add Product
          </Link>
        </div>
      </div>

      <div className="ap-controls">
        <div className="ap-search">
          <span className="ap-ico">⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search product name / id / category"
          />
        </div>

        <div className="ap-filter">
          <label>Category</label>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All" : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="ap-empty">Loading products...</div>
      ) : filtered.length === 0 ? (
        <div className="ap-empty">No products found.</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="ap-tableWrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p) => {
                  const category = p?.category?.name || p?.category || "—";
                  return (
                    <tr key={p._id}>
                      <td>
                        <div className="ap-prod">
                          <img
                            src={imgUrl(p)}
                            alt={p.name}
                            onError={(e) => (e.currentTarget.src = "/no-image.png")}
                          />
                          <div>
                            <div className="ap-name">{p.name}</div>
                            <div className="ap-muted ap-mono">{p._id}</div>
                          </div>
                        </div>
                      </td>

                      <td>{category}</td>
                      <td className="ap-strong">{money(p.price)}</td>

                      <td>
                        <span className={stockClass(p.stock)}>{p.stock ?? 0}</span>
                      </td>

                      <td>
                        <div className="ap-actions">
                          {/* ✅ FIXED: route param style */}
                          <Link className="ap-actionBtn" to={`/admin/editproduct/${p._id}`}>
                            Edit
                          </Link>

                          <button
                            className="ap-actionBtn danger"
                            onClick={() => onDelete(p._id)}
                            disabled={deletingId === p._id}
                          >
                            {deletingId === p._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="ap-cards">
            {filtered.map((p) => {
              const category = p?.category?.name || p?.category || "—";
              return (
                <div className="ap-card" key={p._id}>
                  <div className="ap-cardTop">
                    <div className="ap-prod">
                      <img
                        src={imgUrl(p)}
                        alt={p.name}
                        onError={(e) => (e.currentTarget.src = "/no-image.png")}
                      />
                      <div>
                        <div className="ap-name">{p.name}</div>
                        <div className="ap-muted">{category}</div>
                      </div>
                    </div>

                    <span className={stockClass(p.stock)}>{p.stock ?? 0}</span>
                  </div>

                  <div className="ap-cardRow">
                    <div className="ap-muted">Price</div>
                    <div className="ap-strong">{money(p.price)}</div>
                  </div>

                  <div className="ap-actions">
                    {/* ✅ FIXED: same link as desktop */}
                    <Link className="ap-actionBtn" to={`/admin/editproduct/${p._id}`}>
                      Edit
                    </Link>

                    <button
                      className="ap-actionBtn danger"
                      onClick={() => onDelete(p._id)}
                      disabled={deletingId === p._id}
                    >
                      {deletingId === p._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>

                  <div className="ap-muted ap-mono">{p._id}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
