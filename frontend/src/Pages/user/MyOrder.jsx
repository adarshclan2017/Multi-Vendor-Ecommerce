import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/MyOrder.css";
import { getMyOrders } from "../../api/orderapi";

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await getMyOrders();

      console.log("✅ MY ORDERS RESPONSE:", res.data);

      const list =
        res.data?.orders ||
        res.data?.myOrders ||
        res.data?.data ||
        res.data?.orders?.data ||
        (Array.isArray(res.data) ? res.data : []);

      setOrders(Array.isArray(list) ? list.slice().reverse() : []);
    } catch (err) {
      console.log("❌ MyOrders error:", err.response?.status, err.response?.data);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        console.log("Session expired. Please login again.");
        navigate("/login", { replace: true });
        return;
      }

      alert(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    // ✅ ONLY token check
    if (!token) {
     
      navigate("/login", { replace: true });
      return;
    }

    loadOrders();
    // eslint-disable-next-line
  }, []);

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusClass = (s) => {
    const st = String(s || "").toLowerCase();
    if (st.includes("deliver")) return "st st-delivered";
    if (st.includes("cancel")) return "st st-cancel";
    if (st.includes("ship")) return "st st-shipped";
    return "st st-pending";
  };

  return (
    <div className="myorders-page container-fluid my-4 px-3 px-md-4">
      <div className="myorders-head">
        <div>
          <h3 className="mb-1">My Orders</h3>
          <p className="text-muted mb-0">Track your recent purchases</p>
        </div>
        <Link to="/" className="myorders-home">
          ← Continue Shopping
        </Link>
      </div>

      {loading ? (
        <p className="text-center mt-4">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">🧾</div>
          <h5>No orders yet</h5>
          <p className="text-muted">Place your first order to see it here.</p>
          <Link to="/" className="empty-btn">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((o, idx) => {
            const orderId = o?._id || o?.id || "";
            const status = o?.status || o?.orderStatus || "pending";
            const items = o?.items || o?.orderItems || o?.products || [];
            const total = o?.total || o?.totalAmount || o?.amount || 0;

            return (
              <div className="order-card" key={orderId || idx}>
                <div className="order-top">
                  <div>
                    <div className="order-id">
                      Order ID: <b>{orderId || "—"}</b>
                    </div>
                    <div className="order-date">
                      Placed on: {formatDate(o?.createdAt || o?.date)}
                    </div>
                  </div>

                  <span className={statusClass(status)}>{status}</span>
                </div>

                <div className="order-items">
                  {items.slice(0, 3).map((it, i) => {
                    const name = it?.name || it?.product?.name || "Product";
                    const qty = it?.qty ?? it?.quantity ?? 1;

                    const imgRaw = it?.image || it?.product?.image;
                    const img = imgRaw
                      ? imgRaw.startsWith("http")
                        ? imgRaw
                        : `http://localhost:5000${imgRaw}`
                      : "/no-image.png";

                    return (
                      <div className="order-item" key={it?.product?._id || i}>
                        <img
                          src={img}
                          alt="Product"
                          onError={(e) => (e.currentTarget.src = "/no-image.png")}
                        />
                        <div className="order-item-info">
                          <div className="order-item-name">{name}</div>
                          <div className="order-item-meta">Qty: {qty}</div>
                        </div>
                      </div>
                    );
                  })}

                  {items.length > 3 && (
                    <div className="more-items">+{items.length - 3} more</div>
                  )}
                </div>

                <div className="order-bottom">
                  <div className="order-total">
                    Total: <b>₹ {total}</b>
                  </div>

                  {/* ✅ Make sure this route exists in your router */}
                  <Link className="order-view" to={`/order/${orderId}`}>
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
