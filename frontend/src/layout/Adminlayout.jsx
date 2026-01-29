import React, { useEffect, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import "./AdminLayout.css";

function AdminLayout() {
  const navigate = useNavigate();

  const auth = useMemo(() => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      return { token, user };
    } catch {
      return { token: null, user: null };
    }
  }, []);

  useEffect(() => {
    // ❌ not logged in
    if (!auth.token || !auth.user) {
      alert("Please login as admin");
      navigate("/login", { replace: true });
      return;
    }

    // ❌ not admin
    if (auth.user.role !== "admin") {
      alert("Admin access only");
      navigate("/", { replace: true });
      return;
    }
  }, [auth, navigate]);

  return (
    <div className="admin-layout">
      <AdminNavbar />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
