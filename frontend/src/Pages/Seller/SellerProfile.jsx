import React, { useEffect, useState } from "react";
import "../../styles/SellerProfile.css";
import { getMe } from "../../api/sellerUserApi";
import { useNavigate } from "react-router-dom";

function SellerProfile() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    try {
      setLoading(true);
      const res = await getMe();
      setMe(res.data?.user || null);
    } catch (err) {
      console.log("❌ profile error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out ✅");
    navigate("/login");
  };

  return (
    <div className="sp-page">
      <div className="sp-card">
        <div className="sp-top">
          <div className="sp-avatar">
            {me?.name?.slice(0, 1)?.toUpperCase() || "S"}
          </div>

          <div className="sp-title">
            <h2>Seller Profile</h2>
            <p>Manage your account</p>
          </div>
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : !me ? (
          <p className="text-center">Profile not found</p>
        ) : (
          <>
            <div className="sp-info">
              <div className="sp-row">
                <span>Name</span>
                <b>{me.name}</b>
              </div>

              <div className="sp-row">
                <span>Email</span>
                <b>{me.email}</b>
              </div>

              <div className="sp-row">
                <span>Role</span>
                <b className="sp-role">{me.role}</b>
              </div>

              <div className="sp-row">
                <span>User ID</span>
                <b className="sp-id">{me._id}</b>
              </div>
            </div>

            <div className="sp-actions">
              <button className="sp-btn outline" onClick={loadMe}>
                Refresh
              </button>
              <button className="sp-btn danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SellerProfile;
