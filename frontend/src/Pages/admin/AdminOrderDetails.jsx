import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../../styles/AdminOrderDetails.css";
import { getAdminOrderById, updateAdminOrderStatus } from "../../api/adminApi";

const money = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;

const badgeClass = (s) => {
  const st = String(s || "pending").toLowerCase();
  if (st === "delivered") return "aod-badge delivered";
  if (st === "shipped") return "aod-badge shipped";
  if (st === "cancelled") return "aod-badge cancelled";
  return "aod-badge pending";
};

const formatDateTime = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminOrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAdminOrderById(id);
      setOrder(res.data?.order || null);
    } catch (err) {
      console.log("❌ admin order details error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const items = order?.items || [];

  const total = useMemo(() => {
    return order?.total ?? items.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 0), 0);
  }, [order, items]);

  const getImg = (imgPath) => {
    if (!imgPath) return "/no-image.png";
    if (String(imgPath).startsWith("http")) return imgPath;
    return `http://localhost:5000${imgPath}`;
  };

  const updateStatus = async (status) => {
    try {
      setSaving(true);
      const res = await updateAdminOrderStatus(order._id, status);
      setOrder(res.data?.order || order);
      alert("Status updated ✅");
    } catch (err) {
      console.log("❌ update status error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="aod-page">
      <div className="aod-head">
        <div>
          <h2 className="aod-title">Order Details</h2>
          <div className="aod-sub">
            <span className="aod-mono">Order ID: {id}</span>
            {order?.createdAt && <span className="aod-dot">•</span>}
            {order?.createdAt && <span>{formatDateTime(order.createdAt)}</span>}
          </div>
        </div>

        <Link className="aod-back" to="/admin/order">
          ← Back to Orders
        </Link>
      </div>

      {loading ? (
        <div className="aod-empty">Loading...</div>
      ) : !order ? (
        <div className="aod-empty">Order not found</div>
      ) : (
        <div className="aod-grid">
          {/* LEFT */}
          <div className="aod-card">
            <div className="aod-toprow">
              <span className={badgeClass(order.status)}>{order.status}</span>

              <div className="aod-total">
                Total: <b>{money(total)}</b>
              </div>

              <div className="aod-actions">
                <select
                  className="aod-select"
                  value={String(order.status || "pending").toLowerCase()}
                  disabled={saving}
                  onChange={(e) => updateStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {saving && <span className="aod-saving">Saving…</span>}
              </div>
            </div>

            <div className="aod-sectionTitle">Items</div>

            <div className="aod-items">
              {items.map((it, idx) => (
                <div className="aod-item" key={idx}>
                  <img
                    className="aod-img"
                    src={getImg(it.image)}
                    alt={it.name}
                    onError={(e) => (e.currentTarget.src = "/no-image.png")}
                  />

                  <div className="aod-info">
                    <div className="aod-name">{it.name || "Product"}</div>
                    <div className="aod-muted">
                      Qty: <b>{it.qty}</b> • Price: {money(it.price)}
                    </div>
                  </div>

                  <div className="aod-line">{money(Number(it.price || 0) * Number(it.qty || 0))}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="aod-card">
            <div className="aod-sectionTitle">Customer</div>

            <div className="aod-block">
              <div className="aod-row">
                <span className="aod-muted">Name</span>
                <span className="aod-strong">{order.user?.name || "—"}</span>
              </div>

              <div className="aod-row">
                <span className="aod-muted">Email</span>
                <span className="aod-strong">{order.user?.email || "—"}</span>
              </div>
            </div>

            <div className="aod-sectionTitle">Shipping Address</div>

            <div className="aod-block">
              <div className="aod-strong">{order.address?.fullName || "—"}</div>
              <div className="aod-muted">{order.address?.street || ""}</div>
              <div className="aod-muted">
                {order.address?.city || ""} {order.address?.state ? `, ${order.address.state}` : ""}{" "}
                {order.address?.pincode ? `- ${order.address.pincode}` : ""}
              </div>
              <div className="aod-muted">{order.address?.phone ? `📞 ${order.address.phone}` : ""}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
