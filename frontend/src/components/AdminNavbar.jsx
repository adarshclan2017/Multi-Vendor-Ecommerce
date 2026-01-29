import React from "react";
import { Link } from "react-router-dom";
import Logout from "../Pages/auth/LogOut";
import "../components/AdminNavbar.css";

function AdminNavbar() {
  return (
    <>
      {/* Navbar */}
      <div className="admin-navbar">
        <div className="logo">Admin Panel</div>
        <div className="nav-right">
          <span>Admin</span>
          <Logout className="logout-btn" /> {/* ✅ ADMIN LOGOUT */}
        </div>
      </div>

      {/* Sidebar + Content wrapper */}
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <ul>
            <li><Link to="/admin/">Dashboard</Link></li>
            <li><Link to="/admin/product">Products</Link></li>
            <li><Link to="/admin/order">Orders</Link></li>
            <li><Link to="/admin/user">Users</Link></li>
            <li><Link to="/admin/categorie">Categories</Link></li>
            <li><Link to="/admin/settings">Settings</Link></li>
          </ul>
        </aside>

        <main className="admin-content">
          {/* Admin pages will render here */}
        </main>
      </div>
    </>
  );
}

export default AdminNavbar;
