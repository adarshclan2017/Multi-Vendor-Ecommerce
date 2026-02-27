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

// ✅ No external placeholder & no /public dependency
const FALLBACK_IMG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='320' height='220'>
      <rect width='100%' height='100%' fill='#f2f2f2'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
        font-family='Arial' font-size='16' fill='#666'>
        No Image
      </text>
    </svg>
  `);

// ✅ Cloudinary + old path support
const getImg = (imgValue) => {
  if (!imgValue) return FALLBACK_IMG;

  // Cloudinary object { url, publicId }
  if (typeof imgValue === "object" && imgValue.url) return String(imgValue.url);

  // string url
  if (typeof imgValue === "string" && imgValue.startsWith("http")) return imgValue;

  // old local path "/uploads/..."
  // If you still keep some old order items, you can map to backend URL here:
  if (typeof imgValue === "string" && imgValue.startsWith("/uploads/")) {
    // ⚠️ If your backend is Render, set it here:
    // return `https://YOUR-RENDER-URL${imgValue}`;
    return imgValue; // keep as-is if it already works
  }

  return FALLBACK_IMG;
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
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    load();
    // eslint-disable-next-line
  }, [id]);

  const items = order?.items || [];

  const total = useMemo(() => {
    return (
      order?.total ??
      items.reduce(
        (s, it) => s + Number(it.price || 0) * Number(it.qty || 0),
        0
      )
    );
  }, [order, items]);

  const updateStatus = async (status) => {
    if (!order?._id) return;

    try {
      setSaving(true);
      const res = await updateAdminOrderStatus(order._id, status);
      setOrder(res.data?.order || order);
    } catch (err) {
      console.log("❌ update status error:", err.response?.data || err);
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
                    alt={it.name || "Product"}
                    onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                  />

                  <div className="aod-info">
                    <div className="aod-name">{it.name || "Product"}</div>
                    <div className="aod-muted">
                      Qty: <b>{it.qty}</b> • Price: {money(it.price)}
                    </div>
                  </div>

                  <div className="aod-line">
                    {money(Number(it.price || 0) * Number(it.qty || 0))}
                  </div>
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
                {order.address?.city || ""}{order.address?.state ? `, ${order.address.state}` : ""}{" "}
                {order.address?.pincode ? `- ${order.address.pincode}` : ""}
              </div>
              <div className="aod-muted">
                {order.address?.phone ? `📞 ${order.address.phone}` : ""}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}