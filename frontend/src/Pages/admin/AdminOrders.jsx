import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/AdminOrders.css";
import { getAdminOrders, updateAdminOrderStatus } from "../../api/adminApi";

const formatDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const money = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;

const badgeClass = (s) => {
  const st = String(s || "pending").toLowerCase();
  if (st === "delivered") return "ao-badge delivered";
  if (st === "shipped") return "ao-badge shipped";
  if (st === "cancelled") return "ao-badge cancelled";
  return "ao-badge pending";
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await getAdminOrders();
      setOrders(res.data?.orders || []);
    } catch (err) {
      console.log("❌ admin orders error:", err.response?.data || err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return (orders || [])
      .filter((o) =>
        status === "all"
          ? true
          : String(o?.status || "").toLowerCase() === status
      )
      .filter((o) => {
        if (!query) return true;
        const id = String(o?._id || "").toLowerCase();
        const name = String(o?.user?.name || "").toLowerCase();
        const email = String(o?.user?.email || "").toLowerCase();
        return id.includes(query) || name.includes(query) || email.includes(query);
      });
  }, [orders, q, status]);

  const changeStatus = async (orderId, next) => {
    if (!orderId || !next) return;

    try {
      setSavingId(orderId);
      await updateAdminOrderStatus(orderId, next);

      // instant UI update
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: next } : o))
      );
    } catch (err) {
      console.log("❌ update order status error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="ao-page">
      {/* Header */}
      <div className="ao-head">
        <div>
          <h2 className="ao-title">Orders</h2>
          <p className="ao-sub">Search, filter and update order status</p>
        </div>

        <button className="ao-btn" onClick={loadOrders} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Controls */}
      <div className="ao-controls">
        <div className="ao-search">
          <span className="ao-ico">⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by Order ID / User / Email"
          />
        </div>

        <div className="ao-filter">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="ao-empty">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="ao-empty">No orders found.</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="ao-tableWrap">
            <table className="ao-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((o) => (
                  <tr key={o._id}>
                    <td className="ao-mono">
                      <div className="ao-id">{o._id}</div>
                      <div className="ao-muted">{(o.items?.length || 0)} item(s)</div>
                      <Link className="ao-link" to={`/admin/order/${o._id}`}>
                        View details →
                      </Link>
                    </td>

                    <td>
                      <div className="ao-user">{o.user?.name || "—"}</div>
                      <div className="ao-muted">{o.user?.email || "—"}</div>
                    </td>

                    <td>{formatDate(o.createdAt)}</td>

                    <td className="ao-strong">{money(o.total)}</td>

                    <td>
                      <span className={badgeClass(o.status)}>{o.status || "pending"}</span>
                    </td>

                    <td>
                      <div className="ao-updateWrap">
                        <select
                          className="ao-select"
                          value={String(o.status || "pending").toLowerCase()}
                          disabled={savingId === o._id}
                          onChange={(e) => changeStatus(o._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        {savingId === o._id && <span className="ao-saving">Saving…</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="ao-cards">
            {filtered.map((o) => (
              <div className="ao-card" key={o._id}>
                <div className="ao-cardTop">
                  <div className="ao-mono ao-id" title={o._id}>
                    {o._id}
                  </div>
                  <span className={badgeClass(o.status)}>{o.status || "pending"}</span>
                </div>

                <div className="ao-cardRow">
                  <div>
                    <div className="ao-user">{o.user?.name || "—"}</div>
                    <div className="ao-muted">{o.user?.email || "—"}</div>
                  </div>

                  <div className="ao-right">
                    <div className="ao-strong">{money(o.total)}</div>
                    <div className="ao-muted">{formatDate(o.createdAt)}</div>
                  </div>
                </div>

                <div className="ao-cardRow">
                  <div className="ao-muted">{(o.items?.length || 0)} item(s)</div>

                  <select
                    className="ao-select"
                    value={String(o.status || "pending").toLowerCase()}
                    disabled={savingId === o._id}
                    onChange={(e) => changeStatus(o._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <Link className="ao-link" to={`/admin/order/${o._id}`}>
                  View details →
                </Link>

                {savingId === o._id && <div className="ao-saving">Saving…</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
