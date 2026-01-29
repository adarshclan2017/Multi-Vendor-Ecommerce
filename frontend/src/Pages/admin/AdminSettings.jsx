import React from "react";
import "../../styles/AdminSettings.css";

function AdminSettings() {
  return (
    <div className="admin-settings">

      <h2 className="settings-title">Admin Settings</h2>

      {/* ===== STORE CONTROL ===== */}
      <div className="settings-section">
        <h3>Store Control</h3>

        <div className="setting-row">
          <span>Store Status</span>
          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-row">
          <span>Maintenance Mode</span>
          <label className="switch">
            <input type="checkbox" />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* ===== BUSINESS SETTINGS ===== */}
      <div className="settings-section">
        <h3>Business Settings</h3>

        <div className="form-group">
          <label>Tax Percentage (%)</label>
          <input type="number" placeholder="18" />
        </div>

        <div className="form-group">
          <label>Default Currency</label>
          <select>
            <option>INR (₹)</option>
            <option>USD ($)</option>
            <option>EUR (€)</option>
          </select>
        </div>
      </div>

      {/* ===== LOGO UPLOAD ===== */}
      <div className="settings-section">
        <h3>Branding</h3>

        <div className="upload-box">
          <p>Upload Store Logo</p>
          <input type="file" />
        </div>
      </div>

      {/* ===== SECURITY ===== */}
      <div className="settings-section danger">
        <h3>Security</h3>

        <button className="danger-btn">Change Admin Password</button>
        <button className="danger-outline">Logout From All Devices</button>
      </div>

      {/* ACTIONS */}
      <div className="settings-actions">
        <button className="save-btn">Save Settings</button>
      </div>

    </div>
  );
}

export default AdminSettings;
