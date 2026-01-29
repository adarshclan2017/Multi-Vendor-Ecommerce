import React, { useEffect, useMemo, useState } from "react";
import "../../styles/AdminSettings.css";

const LS_KEY = "admin_settings_v1";

const defaults = {
  storeName: "PowerHouse Ecommerce",
  supportEmail: "support@example.com",
  supportPhone: "+91 90000 00000",
  currency: "INR",
  maintenanceMode: false,
  hideInactiveCategoryProducts: true,
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(defaults);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setSettings((p) => ({ ...p, ...data }));
      }
    } catch (e) {
      console.log("❌ settings load error:", e);
    }
  }, []);

  const changed = useMemo(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return true;
      const saved = JSON.parse(raw);
      return JSON.stringify({ ...defaults, ...saved }) !== JSON.stringify(settings);
    } catch {
      return true;
    }
  }, [settings]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const save = async () => {
    try {
      setSaving(true);
      localStorage.setItem(LS_KEY, JSON.stringify(settings));
      setToast("Saved ✅");
      setTimeout(() => setToast(""), 1500);
    } catch (e) {
      console.log("❌ save error:", e);
      setToast("Save failed ❌");
      setTimeout(() => setToast(""), 2000);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    if (!window.confirm("Reset settings to default?")) return;
    localStorage.removeItem(LS_KEY);
    setSettings(defaults);
    setToast("Reset ✅");
    setTimeout(() => setToast(""), 1500);
  };

  return (
    <div className="as-page">
      <div className="as-head">
        <div>
          <h2 className="as-title">Admin Settings</h2>
          <p className="as-sub">Store preferences and system options</p>
        </div>

        <div className="as-headBtns">
          <button className="as-btn ghost" onClick={reset} disabled={saving}>
            Reset
          </button>
          <button
            className="as-btn primary"
            onClick={save}
            disabled={saving || !changed}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {toast ? <div className="as-toast">{toast}</div> : null}

      <div className="as-grid">
        {/* Store Profile */}
        <section className="as-card">
          <div className="as-cardHead">
            <h3>Store Profile</h3>
            <p>Basic store information</p>
          </div>

          <div className="as-form">
            <div className="as-field">
              <label>Store Name</label>
              <input
                name="storeName"
                value={settings.storeName}
                onChange={onChange}
                placeholder="Enter store name"
              />
            </div>

            <div className="as-row">
              <div className="as-field">
                <label>Support Email</label>
                <input
                  name="supportEmail"
                  value={settings.supportEmail}
                  onChange={onChange}
                  placeholder="support@yourstore.com"
                />
              </div>

              <div className="as-field">
                <label>Support Phone</label>
                <input
                  name="supportPhone"
                  value={settings.supportPhone}
                  onChange={onChange}
                  placeholder="+91 90000 00000"
                />
              </div>
            </div>

            <div className="as-field">
              <label>Currency</label>
              <select name="currency" value={settings.currency} onChange={onChange}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </section>

        {/* System Controls */}
        <section className="as-card">
          <div className="as-cardHead">
            <h3>System Controls</h3>
            <p>Enable/disable system-level options</p>
          </div>

          <div className="as-form">
            <label className="as-switch">
              <div className="as-switchText">
                <span>Maintenance Mode</span>
                <small>Temporarily disable store for users</small>
              </div>
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={onChange}
              />
              <span className="as-slider" />
            </label>

            <label className="as-switch">
              <div className="as-switchText">
                <span>Hide inactive category products</span>
                <small>If category is inactive, user won't see those products</small>
              </div>
              <input
                type="checkbox"
                name="hideInactiveCategoryProducts"
                checked={settings.hideInactiveCategoryProducts}
                onChange={onChange}
              />
              <span className="as-slider" />
            </label>

            <div className="as-note">
              <b>Note:</b> Settings are saved in{" "}
              <span className="as-mono">localStorage</span> for now.
              If you want, I can connect this to MongoDB using an API.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
