import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logout from "../Pages/auth/LogOut";
import "./Navbar.css";

function Navbar() {
  const token = localStorage.getItem("token");

  const [cartCount, setCartCount] = useState(
    Number(localStorage.getItem("cartCount") || 0)
  );

  useEffect(() => {
    // when user logs out, reset count
    if (!token) {
      setCartCount(0);
      localStorage.setItem("cartCount", "0");
      return;
    }

    // load from localStorage
    const sync = () => {
      setCartCount(Number(localStorage.getItem("cartCount") || 0));
    };

    sync();

    // ✅ same tab instant update
    window.addEventListener("cartCountUpdated", sync);

    // ✅ other tabs update
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("cartCountUpdated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [token]);

  return (
    <nav className="nav">
      <div className="logo">
        <i className="fa-solid fa-store"></i>
        <span>MyShop</span>
      </div>

      <ul className="nav-links">
        <li>
          <Link to="/">
            <i className="fa-solid fa-house"></i> Home
          </Link>
        </li>

        {token && (
          <>
            <li>
              <Link to="/cart" className="nav-cart-link">
                <i className="fa-solid fa-cart-shopping"></i> Cart
                {cartCount > 0 && (
                  <span className="cart-count-badge">{cartCount}</span>
                )}
              </Link>
            </li>

            <li>
              <Link to="/order">
                <i className="fa-solid fa-box"></i> Orders
              </Link>
            </li>
          </>
        )}

        {!token ? (
          <>
            <li>
              <Link to="/reg">
                <i className="fa-solid fa-user-plus"></i> Register
              </Link>
            </li>
            <li>
              <Link to="/login">
                <i className="fa-solid fa-right-to-bracket"></i> Login
              </Link>
            </li>
          </>
        ) : (
          <li>
            <Logout />
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
