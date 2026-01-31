import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../../styles/OrderDetails.css";
import { getOrderById, cancelOrder } from "../../api/orderapi";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // ✅ UI messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ custom confirm state (no window.confirm)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getOrderById(id);
      const o = res.data?.order || res.data?.data || res.data;
      setOrder(o || null);
    } catch (err) {
      console.log("❌ Order details error:", err.response?.status, err.response?.data);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("Session expired. Please login again.");
        navigate("/login", { replace: true });
        return;
      }

      if (err.response?.status === 403) {
        setError("Access denied for this order");
        navigate("/my-orders", { replace: true });
        return;
      }

      setError(err.response?.data?.message || "Failed to load order");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    loadOrder();
    // eslint-disable-next-line
  }, [id]);

  const items = order?.items || [];

  const total = useMemo(() => {
    const t = order?.total;
    if (typeof t === "number") return t;
    return items.reduce(
      (s, it) => s + Number(it.price || 0) * Number(it.qty || 0),
      0
    );
  }, [order, items]);

  const getImg = (imgPath) => {
    if (!imgPath) return "/no-image.png";
    if (String(imgPath).startsWith("http")) return imgPath;
    return `http://localhost:5000${imgPath}`;
  };

  const canCancel = String(order?.status || "").toLowerCase() === "pending";

  // ✅ step 1: open confirm UI
  const handleCancelClick = () => {
    if (!order?._id || !canCancel) return;
    setError("");
    setSuccess("");
    setShowCancelConfirm(true);
  };

  // ✅ step 2: user confirms -> cancel
  const confirmCancel = async () => {
    if (!order?._id || !canCancel) return;

    try {
      setCancelling(true);
      setError("");
      setSuccess("");

      const res = await cancelOrder(order._id);
      const updated = res.data?.order || res.data?.data || res.data;

      setOrder(updated);
      setSuccess("Order cancelled successfully ✅");
      setShowCancelConfirm(false);
    } catch (err) {
      console.log("❌ cancel error:", err.response?.data || err);
      setError(err.response?.data?.message || "Cancel failed");
    } finally {
      setCancelling(false);
    }
  };

  const closeConfirm = () => setShowCancelConfirm(false);

  return (
    <div className="od-page container-fluid my-4 px-3 px-md-4">
      <div className="od-head">
        <div>
          <h3 className="mb-1">Order Details</h3>
          <p className="text-muted mb-0">
            Order ID: <b>{id}</b>
          </p>
        </div>

        <Link to="/order" className="od-back">
          ← Back to My Orders
        </Link>
      </div>

      {/* ✅ Messages */}
      {error && <div className="od-error">{error}</div>}
      {success && <div className="od-success">{success}</div>}

      {/* ✅ Custom confirm box (NO browser popup) */}
      {showCancelConfirm && (
        <div className="od-confirm">
          <div className="od-confirm-title">Cancel this order?</div>
          <div className="od-confirm-sub">
            This action cannot be undone.
          </div>

          <div className="od-confirm-actions">
            <button className="od-confirm-no" onClick={closeConfirm} disabled={cancelling}>
              No
            </button>
            <button className="od-confirm-yes" onClick={confirmCancel} disabled={cancelling}>
              {cancelling ? "Cancelling..." : "Yes, Cancel"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center mt-4">Loading...</p>
      ) : !order ? (
        <p className="text-center mt-4">Order not found</p>
      ) : (
        <div className="od-grid">
          <div className="od-card">
            <div className="od-toprow">
              <div className="od-meta">
                Status:{" "}
                <span className={`od-st od-${String(order.status || "pending").toLowerCase()}`}>
                  {order.status || "pending"}
                </span>
              </div>

              <div className="od-total">
                Total: <b>₹ {total}</b>
              </div>

              {canCancel && (
                <button
                  className="od-cancel-btn"
                  onClick={handleCancelClick}
                  disabled={cancelling}
                >
                  Cancel Order
                </button>
              )}
            </div>

            <div className="od-items">
              {items.map((it, idx) => (
                <div className="od-item" key={idx}>
                  <img
                    src={getImg(it.image)}
                    alt={it.name || "Item"}
                    onError={(e) => (e.currentTarget.src = "/no-image.png")}
                  />

                  <div className="od-info">
                    <div className="od-name">{it.name || "Product"}</div>
                    <div className="od-sub">
                      Qty: <b>{it.qty}</b> • ₹ {it.price}
                    </div>
                  </div>

                  <div className="od-lineprice">
                    ₹ {Number(it.price || 0) * Number(it.qty || 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="od-card">
            <h5 className="od-title">Shipping Address</h5>
            <div className="od-address">
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
      )}
    </div>
  );
}

export default OrderDetails;
