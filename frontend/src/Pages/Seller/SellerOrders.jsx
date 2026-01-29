import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/SellerOrders.css";
import { getSellerOrders } from "../../api/sellerOrderApi";

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getSellerOrders();
      const list = res.data?.orders || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.log("❌ seller orders error:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to load seller orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const statusClass = (s) => `so-status so-${String(s || "").toLowerCase()}`;

  return (
    <div className="so-page">
      <div className="so-head">
        <h2>Seller Orders</h2>
        <button className="so-refresh" onClick={loadOrders}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center so-error">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-center">No orders found</p>
      ) : (
        <div className="so-card">
          <table className="so-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Order ID</th>
                <th>Status</th>
                <th>Seller Total</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order, idx) => {
                // ✅ IMPORTANT: this must exist
                const orderId = order?._id;

                return (
                  <tr key={orderId || idx}>
                    <td>{idx + 1}</td>

                    <td className="so-mono">
                      {orderId ? orderId : "—"}
                    </td>

                    <td>
                      <span className={statusClass(order.status)}>
                        {order.status || "unknown"}
                      </span>
                    </td>

                    <td>₹ {Math.round(Number(order.sellerTotal || 0))}</td>

                    <td>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "—"}
                    </td>

                    <td>
                      {/* ✅ THIS FIXES /undefined */}
                      {orderId ? (
                        <Link
                          to={`/seller/order/${orderId}`}
                          className="so-view"
                        >
                          View
                        </Link>
                      ) : (
                        <span className="so-disabled">Invalid ID</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SellerOrders;
