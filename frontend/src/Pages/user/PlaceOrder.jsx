import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../../styles/PlaceOrder.css";

function PlaceOrder() {
  const { id } = useParams(); // orderId from route
  const navigate = useNavigate();

  return (
    <div className="ordersuccess-page">
      <div className="ordersuccess-card">
        <div className="success-icon">✓</div>

        <h4>Order Placed Successfully!</h4>
        <p>
          Thank you for your purchase. Your order has been placed and will be
          processed soon.
        </p>

        <div className="order-info">
          <p>
            <strong>Order ID:</strong>{" "}
            <span className="order-id">{id || "N/A"}</span>
          </p>
          <p>
            <strong>Status:</strong> Pending
          </p>
        </div>

        {/* ✅ View Order Details (Correct path) */}
        {id ? (
          <button
            className="view-orders-btn"
            onClick={() => navigate(`/order/${id}`)}
          >
            View Order Details
          </button>
        ) : null}

        {/* ✅ My Orders */}
        <Link to="/order" className="view-orders-btn outline">
          View My Orders
        </Link>

        {/* ✅ Home */}
        <Link to="/" className="back-home-btn">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default PlaceOrder;
