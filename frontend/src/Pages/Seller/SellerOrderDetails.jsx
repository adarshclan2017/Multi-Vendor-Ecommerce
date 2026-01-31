import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../../styles/SellerOrderDetails.css";
import {
  getSellerOrderById,
  updateSellerOrderStatus,
} from "../../api/sellerOrderApi";

function SellerOrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ UI messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔹 Load order safely
  const load = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");
      // keep success if you want; or clear it:
      // setSuccess("");

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

  // 🔹 Image helper
  const getImg = (imgPath) => {
    if (!imgPath) return "/no-image.png";
    if (String(imgPath).startsWith("http")) return imgPath;
    return `http://localhost:5000${imgPath}`;
  };

  const items = order?.items || [];

  const sellerTotal = useMemo(() => {
    return items.reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0),
      0
    );
  }, [items]);

  // 🔹 Status update (no alert)
  const changeStatus = async (status) => {
    if (!order?._id) return;

    try {
      setError("");
      setSuccess("");

      await updateSellerOrderStatus(order._id, status);

      setSuccess("Status updated successfully ✅");

      // ✅ instant UI update (so you don't wait for reload)
      setOrder((prev) => (prev ? { ...prev, status } : prev));

      // optional: refresh from server (keeps everything synced)
      await load();
    } catch (err) {
      console.log("❌ update status:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  // 🧱 GUARDS
  if (!id) {
    return <p className="text-center">Invalid order link</p>;
  }

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (error) {
    return <p className="text-center error">{error}</p>;
  }

  if (!order) {
    return <p className="text-center">Order not found</p>;
  }

  return (
    <div className="sod-page">
      {/* HEADER */}
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

      {/* ✅ messages */}
      {success && <div className="sod-success">{success}</div>}
      {error && <div className="sod-error">{error}</div>}

      <div className="sod-grid">
        {/* LEFT CARD */}
        <div className="sod-card">
          <div className="sod-toprow">
            <div className={`sod-status sod-${String(order.status || "").toLowerCase()}`}>
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
                  src={getImg(it.image)}
                  alt={it.name}
                  onError={(e) => (e.currentTarget.src = "/no-image.png")}
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

          {/* ACTIONS */}
          <div className="sod-actions">
            {String(order.status).toLowerCase() === "pending" && (
              <button className="sod-btn ship" onClick={() => changeStatus("shipped")}>
                Mark Shipped
              </button>
            )}

            {String(order.status).toLowerCase() === "shipped" && (
              <button className="sod-btn deliver" onClick={() => changeStatus("delivered")}>
                Mark Delivered
              </button>
            )}
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="sod-card">
          <h3 className="sod-title">Shipping Address</h3>

          <div className="sod-addr">
            <p>
              <b>{order.address?.fullName}</b>
            </p>
            <p>{order.address?.street}</p>
            <p>
              {order.address?.city}, {order.address?.state} - {order.address?.pincode}
            </p>
            <p>📞 {order.address?.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerOrderDetails;
