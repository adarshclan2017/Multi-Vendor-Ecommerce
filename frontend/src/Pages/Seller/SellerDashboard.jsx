import React, { useEffect, useState } from "react";
import "../../styles/SellerDashboard.css";

import {
  getSellerAnalytics,
  getSellerMonthlyRevenue,
} from "../../api/sellerAnalyticsApi";

import SellerRevenueChart from "./SellerRevenueChart";

function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      // ✅ summary analytics
      const res1 = await getSellerAnalytics();
      setStats(res1.data?.stats || null);

      // ✅ monthly series
      const res2 = await getSellerMonthlyRevenue();
      setMonthly(res2.data?.series || []);
    } catch (err) {
      console.log("❌ SellerDashboard error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to load seller dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="seller-dash">
      <div className="seller-dash-head">
        <h2>Seller Dashboard</h2>
        <button className="sd-refresh" onClick={load}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : !stats ? (
        <p className="text-center">No analytics data</p>
      ) : (
        <>
          <div className="sd-grid">
            <div className="sd-card">
              <div className="sd-label">Total Revenue</div>
              <div className="sd-value">₹ {Math.round(stats.totalRevenue || 0)}</div>
            </div>

            <div className="sd-card">
              <div className="sd-label">Delivered Revenue</div>
              <div className="sd-value">₹ {Math.round(stats.deliveredRevenue || 0)}</div>
            </div>

            <div className="sd-card">
              <div className="sd-label">Items Sold</div>
              <div className="sd-value">{stats.totalItemsSold || 0}</div>
            </div>

            <div className="sd-card wide">
              <div className="sd-label">Orders Summary</div>

              <div className="sd-row">
                <span>Total</span>
                <b>{stats.orders?.total || 0}</b>
              </div>
              <div className="sd-row">
                <span>Pending</span>
                <b>{stats.orders?.pending || 0}</b>
              </div>
              <div className="sd-row">
                <span>Shipped</span>
                <b>{stats.orders?.shipped || 0}</b>
              </div>
              <div className="sd-row">
                <span>Delivered</span>
                <b>{stats.orders?.delivered || 0}</b>
              </div>
              <div className="sd-row">
                <span>Cancelled</span>
                <b>{stats.orders?.cancelled || 0}</b>
              </div>
            </div>
          </div>

          <SellerRevenueChart data={monthly} />
        </>
      )}
    </div>
  );
}

export default SellerDashboard;
