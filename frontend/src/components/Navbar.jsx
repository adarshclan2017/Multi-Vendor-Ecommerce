import { Link } from "react-router-dom";
import Logout from "../Pages/auth/LogOut";
import "./Navbar.css";

function Navbar() {
  const token = localStorage.getItem("token");

  return (
    <nav>
      <div className="logo"><strong>...LOADING</strong></div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/cart">Cart</Link></li>
        <li><Link to="/order">Order</Link></li>

        {!token ? (
          <>
            <li><Link to="/reg">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
          </>
        ) : (
          <li><Logout /></li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
