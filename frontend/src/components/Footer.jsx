import { Link } from "react-router-dom";
import '../components/Footer.css'

function Footer() {
  return (
    <footer >
      <div className=" footer-container">
        <div className="row">

          {/* Brand */}
          <div className="col-md-4 mb-3">
            <h5 className="footer-title">ShopEase</h5>
            <p className="footer-text">
              Your one-stop shop for quality products at the best prices.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4 mb-3">
            <h6 className="footer-title">Quick Links</h6>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/login">Login</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-md-4 mb-3">
            <h6 className="footer-title">Contact</h6>
            <p className="footer-text mb-1">📧 support@shopease.com</p>
            <p className="footer-text mb-1">📞 +91 98765 43210</p>

            <div className="social-icons mt-2">
              <i className="fa fa-facebook"></i>
              <i className="fa fa-instagram"></i>
              <i className="fa fa-twitter"></i>
            </div>
          </div>

        </div>

        <hr />

        <div className="text-center footer-bottom">
          © {new Date().getFullYear()} ShopEase. All rights reserved.
        </div>
      </div>
    </footer>


  );
}

export default Footer;
