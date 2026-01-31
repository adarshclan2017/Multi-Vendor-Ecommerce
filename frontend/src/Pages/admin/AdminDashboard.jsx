import React, { useEffect, useMemo, useState } from "react";
import "../../styles/AdminDashboard.css";
import { Link } from "react-router-dom";
import { getAdminStats, getAdminOrders } from "../../api/adminApi";

const money = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;

const badgeClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "delivered") return "ad-badge delivered";
  if (s === "shipped") return "ad-badge shipped";
  if (s === "cancelled") return "ad-badge cancelled";
  return "ad-badge pending";
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [orders, setOrders] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const load = async () => {
    // stats
    try {
      setLoadingStats(true);
      const res = await getAdminStats();
      setStats(res.data || { totalOrders: 0, totalUsers: 0, totalRevenue: 0 });
    } catch (e) {
      console.log("❌ stats error:", e.response?.data || e);
      setStats({ totalOrders: 0, totalUsers: 0, totalRevenue: 0 });
    } finally {
      setLoadingStats(false);
    }

    // orders
    try {
      setLoadingOrders(true);
      const res = await getAdminOrders();
      setOrders(res.data?.orders || []);
    } catch (e) {
      console.log("❌ orders error:", e.response?.data || e);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const recent = useMemo(() => {
    return [...(orders || [])].slice(0, 6);
  }, [orders]);

  const refreshing = loadingStats || loadingOrders;

  return (
    <div className="ad-page">
      {/* Header */}
      <div className="ad-head">
        <div>
          <h2 className="ad-title">Admin Dashboard</h2>
          <p className="ad-sub">Overview of your store performance</p>
        </div>

        <button className="ad-btn" onClick={load} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stats cards */}
      <div className="ad-cards">
        <div className="ad-card">
          <div className="ad-cardTop">
            <span className="ad-label">Total Orders</span>
            <span className="ad-dot" />
          </div>
          <div className="ad-value">{loadingStats ? "…" : stats.totalOrders}</div>
          <div className="ad-mini">All time orders placed</div>
        </div>

        <div className="ad-card">
          <div className="ad-cardTop">
            <span className="ad-label">Total Users</span>
            <span className="ad-dot" />
          </div>
          <div className="ad-value">{loadingStats ? "…" : stats.totalUsers}</div>
          <div className="ad-mini">Customers + sellers</div>
        </div>

        <div className="ad-card">
          <div className="ad-cardTop">
            <span className="ad-label">Total Revenue</span>
            <span className="ad-dot" />
          </div>
          <div className="ad-value">
            {loadingStats ? "…" : money(stats.totalRevenue)}
          </div>
          <div className="ad-mini">Based on total order amount</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="ad-actions">
        <Link to="/admin/product" className="ad-linkCard">
          <div className="ad-linkTitle">Products</div>
          <div className="ad-linkSub">Manage products & stock</div>
          <div className="ad-linkArrow">→</div>
        </Link>

        <Link to="/admin/order" className="ad-linkCard">
          <div className="ad-linkTitle">Orders</div>
          <div className="ad-linkSub">Update status & view details</div>
          <div className="ad-linkArrow">→</div>
        </Link>

        <Link to="/admin/user" className="ad-linkCard">
          <div className="ad-linkTitle">Users</div>
          <div className="ad-linkSub">Roles, status, and control</div>
          <div className="ad-linkArrow">→</div>
        </Link>

        <Link to="/admin/categorie" className="ad-linkCard">
          <div className="ad-linkTitle">Categories</div>
          <div className="ad-linkSub">Enable/disable categories</div>
          <div className="ad-linkArrow">→</div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="ad-panel">
        <div className="ad-panelHead">
          <h3>Recent Orders</h3>
          <Link className="ad-viewAll" to="/admin/order">
            View all →
          </Link>
        </div>

        {loadingOrders ? (
          <div className="ad-empty">Loading orders...</div>
        ) : recent.length === 0 ? (
          <div className="ad-empty">No orders found.</div>
        ) : (
          <div className="ad-tableWrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="ad-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o._id}>
                    <td className="ad-mono" title={o._id}>
                      {o._id}
                    </td>
                    <td>{o?.user?.name || "—"}</td>
                    <td className="ad-strong">{money(o.total)}</td>
                    <td>
                      <span className={badgeClass(o.status)}>
                        {o.status || "pending"}
                      </span>
                    </td>
                    <td className="ad-right">
                      <Link className="ad-rowBtn" to={`/admin/order/${o._id}`}>
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
