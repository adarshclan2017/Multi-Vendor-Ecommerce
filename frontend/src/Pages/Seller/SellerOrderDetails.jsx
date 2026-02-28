import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../../styles/SellerOrderDetails.css";
import {
  getSellerOrderById,
  updateSellerOrderStatus,
} from "../../api/sellerOrderApi";

/* ✅ Local SVG fallback (NO DNS issues) */
const FALLBACK_IMG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'>
      <rect width='100%' height='100%' fill='#f2f2f2'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
        font-family='Arial' font-size='14' fill='#666'>
        No Image
      </text>
    </svg>
  `);

function SellerOrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const res = await getSellerOrderById(id);
      setOrder(res.data?.order || null);
    } catch (err) {
      console.log("❌ seller order details:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to load order");
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

  /* ✅ Cloudinary-safe image resolver
     supports:
     - it.image = "https://..."
     - it.image = { url, publicId }
  */
  const getImg = (it) => {
    const imgValue =
      it?.image ??
      it?.productImage ??
      it?.product?.image ??
      it?.productId?.image ??
      it?.product?.images?.[0] ??
      it?.images?.[0];

    if (!imgValue) return FALLBACK_IMG;

    // {url, publicId}
    if (typeof imgValue === "object") {
      if (imgValue.url) return String(imgValue.url);
      if (imgValue.secure_url) return String(imgValue.secure_url);
    }

    const s = String(imgValue);
    if (s.startsWith("http")) return s;

    return FALLBACK_IMG;
  };

  const items = order?.items || [];

  const sellerTotal = useMemo(() => {
    return items.reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0),
      0
    );
  }, [items]);

  const changeStatus = async (status) => {
    if (!order?._id) return;

    try {
      setError("");
      setSuccess("");

      await updateSellerOrderStatus(order._id, status);

      setSuccess("Status updated successfully ✅");

      // ✅ instant UI update
      setOrder((prev) => (prev ? { ...prev, status } : prev));

      // ✅ reload from server for sync
      await load();
    } catch (err) {
      console.log("❌ update status:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  if (!id) return <p className="text-center">Invalid order link</p>;
  if (loading) return <p className="text-center">Loading...</p>;
  if (error && !order) return <p className="text-center error">{error}</p>;
  if (!order) return <p className="text-center">Order not found</p>;

  return (
    <div className="sod-page">
      <div className="sod-head">
        <div>
          <h2>Order Details</h2>
          <p className="sod-sub">
            Order ID: <b>{id}</b>
          </p>
        </div>

        <Link className="sod-back" to="/seller/order">
          ← Back
        </Link>
      </div>

      {success && <div className="sod-success">{success}</div>}
      {error && <div className="sod-error">{error}</div>}

      <div className="sod-grid">
        <div className="sod-card">
          <div className="sod-toprow">
            <div
              className={`sod-status sod-${String(order.status || "").toLowerCase()}`}
            >
              {order.status}
            </div>

            <div className="sod-total">
              Seller Total: <b>₹ {Math.round(sellerTotal)}</b>
            </div>
          </div>

          <div className="sod-items">
            {items.map((it, idx) => (
              <div className="sod-item" key={idx}>
                <img
                  className="sod-img"
                  src={getImg(it)}
                  alt={it.name || "Item"}
                  onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                />

                <div className="sod-info">
                  <div className="sod-name">{it.name}</div>
                  <div className="sod-meta">
                    Qty: <b>{it.qty}</b> • ₹ {it.price}
                  </div>
                </div>

                <div className="sod-line">
                  ₹ {Number(it.price || 0) * Number(it.qty || 0)}
                </div>
              </div>
            ))}
          </div>

          <div className="sod-actions">
            {String(order.status).toLowerCase() === "pending" && (
              <button
                className="sod-btn ship"
                onClick={() => changeStatus("shipped")}
              >
                Mark Shipped
              </button>
            )}

            {String(order.status).toLowerCase() === "shipped" && (
              <button
                className="sod-btn deliver"
                onClick={() => changeStatus("delivered")}
              >
                Mark Delivered
              </button>
            )}
          </div>
        </div>

        <div className="sod-card">
          <h3 className="sod-title">Shipping Address</h3>

          <div className="sod-addr">
            <p>
              <b>{order.address?.fullName}</b>
            </p>
            <p>{order.address?.street}</p>
            <p>
              {order.address?.city}, {order.address?.state} -{" "}
              {order.address?.pincode}
            </p>
            <p>📞 {order.address?.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerOrderDetails;