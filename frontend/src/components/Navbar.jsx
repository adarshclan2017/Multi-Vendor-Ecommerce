import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Logout from "../Pages/auth/LogOut";
import "./Navbar.css";

function Navbar() {
  const token = localStorage.getItem("token");
  const location = useLocation();

  const [cartCount, setCartCount] = useState(
    Number(localStorage.getItem("cartCount") || 0)
  );

  const [open, setOpen] = useState(false);

  useEffect(() => {
    // close menu on route change (better mobile UX)
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!token) {
      setCartCount(0);
      localStorage.setItem("cartCount", "0");
      return;
    }

    const sync = () => {
      setCartCount(Number(localStorage.getItem("cartCount") || 0));
    };

    sync();

    window.addEventListener("cartCountUpdated", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("cartCountUpdated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [token]);

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/" className="logo">
          <i className="fa-solid fa-store" />
          <span>MyShop</span>
        </Link>
      </div>

      {/* Desktop links */}
      <ul className="nav-links desktop">
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
            <i className="fa-solid fa-house" /> Home
          </NavLink>
        </li>

        {token && (
          <>
            <li>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `nav-cart-link ${isActive ? "active" : ""}`
                }
              >
                <i className="fa-solid fa-cart-shopping" /> Cart
                {cartCount > 0 && (
                  <span className="cart-count-badge">{cartCount}</span>
                )}
              </NavLink>
            </li>

            <li>
              <NavLink to="/order" className={({ isActive }) => (isActive ? "active" : "")}>
                <i className="fa-solid fa-box" /> Orders
              </NavLink>
            </li>
          </>
        )}

        {!token ? (
          <>
            <li>
              <NavLink to="/reg" className={({ isActive }) => (isActive ? "active" : "")}>
                <i className="fa-solid fa-user-plus" /> Register
              </NavLink>
            </li>
            <li>
              <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                <i className="fa-solid fa-right-to-bracket" /> Login
              </NavLink>
            </li>
          </>
        ) : (
          <li className="nav-logout">
            <Logout />
          </li>
        )}
      </ul>

      {/* Mobile button */}
      <button
        className="nav-burger"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`bar ${open ? "x1" : ""}`} />
        <span className={`bar ${open ? "x2" : ""}`} />
        <span className={`bar ${open ? "x3" : ""}`} />
      </button>

      {/* Mobile drawer */}
      <div className={`nav-drawer ${open ? "open" : ""}`} onClick={() => setOpen(false)}>
        <div className="nav-drawer-card" onClick={(e) => e.stopPropagation()}>
          <div className="nav-drawer-head">
            <div className="logo mini">
              <i className="fa-solid fa-store" />
              <span>MyShop</span>
            </div>

            <button className="nav-close" aria-label="Close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <ul className="nav-links mobile">
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
                <i className="fa-solid fa-house" /> Home
              </NavLink>
            </li>

            {token && (
              <>
                <li>
                  <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                      `nav-cart-link ${isActive ? "active" : ""}`
                    }
                  >
                    <i className="fa-solid fa-cart-shopping" /> Cart
                    {cartCount > 0 && (
                      <span className="cart-count-badge">{cartCount}</span>
                    )}
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/order"
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <i className="fa-solid fa-box" /> Orders
                  </NavLink>
                </li>
              </>
            )}

            {!token ? (
              <>
                <li>
                  <NavLink
                    to="/reg"
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <i className="fa-solid fa-user-plus" /> Register
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/login"
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <i className="fa-solid fa-right-to-bracket" /> Login
                  </NavLink>
                </li>
              </>
            ) : (
              <li className="nav-logout">
                <Logout />
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;