import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="ft">
      <div className="ft-inner">
        <div className="ft-grid">
          {/* Brand */}
          <div className="ft-col">
            <div className="ft-brand">
              <i className="fa-solid fa-store ft-brandIcon" />
              <span>ShopEase</span>
            </div>

            <p className="ft-text">
              Your one-stop shop for quality products at the best prices.
              Fast delivery, secure payments, and great support.
            </p>

            <div className="ft-badges">
              <span className="ft-badge">
                <i className="fa-solid fa-truck-fast" /> Fast Delivery
              </span>
              <span className="ft-badge">
                <i className="fa-solid fa-shield-heart" /> Secure Checkout
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="ft-col">
            <h6 className="ft-title">Quick Links</h6>
            <ul className="ft-links">
              <li>
                <Link to="/">
                  <i className="fa-solid fa-house" /> Home
                </Link>
              </li>
              <li>
                <Link to="/products">
                  <i className="fa-solid fa-bag-shopping" /> Products
                </Link>
              </li>
              <li>
                <Link to="/cart">
                  <i className="fa-solid fa-cart-shopping" /> Cart
                </Link>
              </li>
              <li>
                <Link to="/order">
                  <i className="fa-solid fa-box" /> Orders
                </Link>
              </li>
              <li>
                <Link to="/login">
                  <i className="fa-solid fa-right-to-bracket" /> Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="ft-col">
            <h6 className="ft-title">Contact</h6>

            <div className="ft-contact">
              <a className="ft-contactRow" href="mailto:support@shopease.com">
                <i className="fa-solid fa-envelope" />
                <span>support@shopease.com</span>
              </a>

              <a className="ft-contactRow" href="tel:+919876543210">
                <i className="fa-solid fa-phone" />
                <span>+91 98765 43210</span>
              </a>

              <div className="ft-contactRow muted">
                <i className="fa-solid fa-location-dot" />
                <span>India • Kochi</span>
              </div>
            </div>

            <div className="ft-social">
              <a
                className="ft-socialBtn"
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                title="Facebook"
              >
                <i className="fa-brands fa-facebook-f" />
              </a>

              <a
                className="ft-socialBtn"
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                title="Instagram"
              >
                <i className="fa-brands fa-instagram" />
              </a>

              <a
                className="ft-socialBtn"
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                title="Twitter"
              >
                <i className="fa-brands fa-x-twitter" />
              </a>

              <a
                className="ft-socialBtn"
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                title="GitHub"
              >
                <i className="fa-brands fa-github" />
              </a>
            </div>
          </div>
        </div>

        <div className="ft-divider" />

        <div className="ft-bottom">
          <div className="ft-copy">
            © {new Date().getFullYear()} ShopEase. All rights reserved.
          </div>

          <div className="ft-bottomLinks">
            <Link to="/privacy">Privacy</Link>
            <span className="dot">•</span>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}