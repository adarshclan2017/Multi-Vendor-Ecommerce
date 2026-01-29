import React from "react";
import { Link } from "react-router-dom";
import Logout from "../Pages/auth/LogOut";
import "../components/SellerNavebar.css";

function SellerNavbar() {
  return (
    <>
      {/* Navbar */}
      <div className="navbar">
        <div className="logo">Seller Panel</div>
        <div className="nav-right">
          <span>Seller</span>
          <Logout /> {/* ✅ WORKING LOGOUT */}
        </div>
      </div>

      {/* Sidebar */}
      <div className="layout">
        <aside className="sidebar">
          <ul>
            <li><Link to="/seller">Dashboard</Link></li>
            <li><Link to="/seller/product">Products</Link></li>
            <li><Link to="/seller/order">Orders</Link></li>
            <li><Link to="/seller/profile">Profile</Link></li>
          </ul>
        </aside>
      </div>
    </>
  );
}

export default SellerNavbar;
