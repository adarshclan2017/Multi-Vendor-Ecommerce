import React, { useMemo } from "react";
import "../../styles/SellerRevenueChart.css";

const SellerRevenueChart = ({ data = [] }) => {
  // max once (faster + clean)
  const max = useMemo(() => {
    return Math.max(
      ...data.map((d) => Number(d.revenue ?? d.value ?? 0)),
      1
    );
  }, [data]);

  return (
    <div className="src-card">
      <div className="src-head">
        <h3 className="src-title">Monthly Revenue</h3>
        <p className="src-sub">Seller sales by month</p>
      </div>

      {data.length === 0 ? (
        <p className="src-empty">No monthly revenue data</p>
      ) : (
        <div className="src-bars">
          {data.map((item, idx) => {
            const label = item.month || item.label || `M${idx + 1}`;
            const value = Number(item.revenue ?? item.value ?? 0);
            const width = Math.round((value / max) * 100);

            return (
              <div className="src-row" key={`${label}-${idx}`}>
                <div className="src-left">
                  <span className="src-month">{label}</span>
                  <span className="src-amount">₹ {Math.round(value)}</span>
                </div>

                <div className="src-track">
                  <div className="src-bar" style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SellerRevenueChart;
