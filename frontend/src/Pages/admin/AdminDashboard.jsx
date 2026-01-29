import React, { useEffect, useState } from "react";
import "../../styles/AdminDashboard.css";
import { getAdminStats } from "../../api/adminApi";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });

  const loadStats = async () => {
    try {
      const res = await getAdminStats();
      setStats(res.data);
    } catch (err) {
      console.log("❌ admin dashboard error:", err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <p>Total Orders</p>
          <h3>{stats.totalOrders}</h3>
        </div>

        <div className="stat-card">
          <p>Total Users</p>
          <h3>{stats.totalUsers}</h3>
        </div>

        <div className="stat-card">
          <p>Total Revenue</p>
          <h3>₹ {stats.totalRevenue}</h3>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
