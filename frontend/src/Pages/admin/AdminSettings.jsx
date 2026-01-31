import React, { useEffect, useMemo, useState } from "react";
import "../../styles/AdminSettings.css";
import { getAdminSettings, updateAdminSettings } from "../../api/adminSettingsApi";

const defaults = {
  storeName: "PowerHouse Ecommerce",
  supportEmail: "support@example.com",
  supportPhone: "+91 90000 00000",
  currency: "INR",
  maintenanceMode: false,
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(defaults);
  const [initial, setInitial] = useState(defaults);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const changed = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(initial),
    [settings, initial]
  );

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAdminSettings();
      const s = res.data?.settings || defaults;

      const clean = {
        storeName: s.storeName ?? defaults.storeName,
        supportEmail: s.supportEmail ?? defaults.supportEmail,
        supportPhone: s.supportPhone ?? defaults.supportPhone,
        currency: s.currency ?? defaults.currency,
        maintenanceMode: Boolean(s.maintenanceMode ?? defaults.maintenanceMode),
      };

      setSettings(clean);
      setInitial(clean);
    } catch (err) {
      console.log("❌ settings load error:", err.response?.data || err);
      setToast(err.response?.data?.message || "Failed to load settings");
      setTimeout(() => setToast(""), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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

      const payload = {
        storeName: settings.storeName,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        currency: settings.currency,
        maintenanceMode: Boolean(settings.maintenanceMode),
      };

      const res = await updateAdminSettings(payload);
      const s = res.data?.settings || payload;

      const clean = {
        storeName: s.storeName ?? defaults.storeName,
        supportEmail: s.supportEmail ?? defaults.supportEmail,
        supportPhone: s.supportPhone ?? defaults.supportPhone,
        currency: s.currency ?? defaults.currency,
        maintenanceMode: Boolean(s.maintenanceMode ?? defaults.maintenanceMode),
      };

      setSettings(clean);
      setInitial(clean);

      setToast("Saved ✅");
      setTimeout(() => setToast(""), 1500);
    } catch (err) {
      console.log("❌ save settings error:", err.response?.data || err);
      setToast(err.response?.data?.message || "Save failed ❌");
      setTimeout(() => setToast(""), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="as-page">
      <div className="as-head">
        <div>
          <h2 className="as-title">Admin Settings</h2>
          <p className="as-sub">Control store rules & global preferences</p>
        </div>

        <button
          className="as-btn primary"
          disabled={!changed || saving || loading}
          onClick={save}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {toast ? <div className="as-toast">{toast}</div> : null}

      {loading ? (
        <div className="as-loading">Loading settings...</div>
      ) : (
        <div className="as-grid">
          {/* Store Info */}
          <section className="as-card">
            <div className="as-cardHead">
              <h3>Store Info</h3>
              <p>Shown in header / footer</p>
            </div>

            <div className="as-form">
              <div className="as-field">
                <label>Store Name</label>
                <input name="storeName" value={settings.storeName} onChange={onChange} />
              </div>

              <div className="as-row">
                <div className="as-field">
                  <label>Support Email</label>
                  <input name="supportEmail" value={settings.supportEmail} onChange={onChange} />
                </div>

                <div className="as-field">
                  <label>Support Phone</label>
                  <input name="supportPhone" value={settings.supportPhone} onChange={onChange} />
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

          {/* Maintenance Mode */}
          <section className="as-card">
            <div className="as-cardHead">
              <h3>System Controls</h3>
              <p>Enable/disable global behaviors</p>
            </div>

            <div className="as-form">
              <label className="as-switch">
                <div className="as-switchText">
                  <span>Maintenance Mode</span>
                  <small>Disable store browsing for users</small>
                </div>
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={onChange}
                />
                <span className="as-slider" />
              </label>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
