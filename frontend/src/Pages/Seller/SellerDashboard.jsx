import React, { useEffect, useMemo, useState } from "react";
import "../../styles/SellerDashboard.css";

import {
  getSellerAnalytics,
  getSellerMonthlyRevenue,
} from "../../api/sellerAnalyticsApi";

import SellerRevenueChart from "./SellerRevenueChart";

const money = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;

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
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    const totalRevenue = Number(stats?.totalRevenue || 0);
    const deliveredRevenue = Number(stats?.deliveredRevenue || 0);
    const totalItemsSold = Number(stats?.totalItemsSold || 0);

    const orders = {
      total: Number(stats?.orders?.total || 0),
      pending: Number(stats?.orders?.pending || 0),
      shipped: Number(stats?.orders?.shipped || 0),
      delivered: Number(stats?.orders?.delivered || 0),
      cancelled: Number(stats?.orders?.cancelled || 0),
    };

    return { totalRevenue, deliveredRevenue, totalItemsSold, orders };
  }, [stats]);

  return (
    <div className="seller-dash">
      <div className="seller-dash-head">
        <h2>Seller Dashboard</h2>

        <button className="sd-refresh" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <p className="text-center">Loading analytics...</p>
      ) : !stats ? (
        <p className="text-center">No analytics data</p>
      ) : (
        <>
          <div className="sd-grid">
            <div className="sd-card">
              <div className="sd-label">Total Revenue</div>
              <div className="sd-value">{money(totals.totalRevenue)}</div>
            </div>

            <div className="sd-card">
              <div className="sd-label">Delivered Revenue</div>
              <div className="sd-value">{money(totals.deliveredRevenue)}</div>
            </div>

            <div className="sd-card">
              <div className="sd-label">Items Sold</div>
              <div className="sd-value">{totals.totalItemsSold}</div>
            </div>

            <div className="sd-card wide">
              <div className="sd-label">Orders Summary</div>

              <div className="sd-row">
                <span>Total</span>
                <b>{totals.orders.total}</b>
              </div>
              <div className="sd-row">
                <span>Pending</span>
                <b>{totals.orders.pending}</b>
              </div>
              <div className="sd-row">
                <span>Shipped</span>
                <b>{totals.orders.shipped}</b>
              </div>
              <div className="sd-row">
                <span>Delivered</span>
                <b>{totals.orders.delivered}</b>
              </div>
              <div className="sd-row">
                <span>Cancelled</span>
                <b>{totals.orders.cancelled}</b>
              </div>
            </div>
          </div>

          {/* Chart Card */}
          <SellerRevenueChart data={monthly} />
        </>
      )}
    </div>
  );
}

export default SellerDashboard;
