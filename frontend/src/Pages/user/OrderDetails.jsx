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

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await getOrderById(id);

      // ✅ supports: {order}, {data}, order directly
      const o = res.data?.order || res.data?.data || res.data;
      setOrder(o || null);
    } catch (err) {
      console.log("❌ Order details error:", err.response?.status, err.response?.data);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("Please login again");
        navigate("/login", { replace: true });
        return;
      }

      if (err.response?.status === 403) {
        alert("Access denied for this order");
        navigate("/my-orders", { replace: true });
        return;
      }

      alert(err.response?.data?.message || "Failed to load order details");
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
    if (imgPath.startsWith("http")) return imgPath;
    return `http://localhost:5000${imgPath}`;
  };

  const canCancel = String(order?.status || "").toLowerCase() === "pending";

  const handleCancel = async () => {
    if (!order?._id || !canCancel) return;
    const ok = window.confirm("Cancel this order?");
    if (!ok) return;

    try {
      setCancelling(true);
      const res = await cancelOrder(order._id);
      const updated = res.data?.order || res.data?.data || res.data;
      setOrder(updated);
      alert("Order cancelled ✅");
    } catch (err) {
      console.log("❌ cancel error:", err.response?.data || err);
      alert(err.response?.data?.message || "Cancel failed");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="od-page container-fluid my-4 px-3 px-md-4">
      <div className="od-head">
        <div>
          <h3 className="mb-1">Order Details</h3>
          <p className="text-muted mb-0">
            Order ID: <b>{id}</b>
          </p>
        </div>

        <Link to="/my-orders" className="od-back">
          ← Back to My Orders
        </Link>
      </div>

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
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel Order"}
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

                  <div className="od-lineprice">₹ {Number(it.price || 0) * Number(it.qty || 0)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="od-card">
            <h5 className="od-title">Shipping Address</h5>
            <div className="od-address">
              <p><b>{order.address?.fullName}</b></p>
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
