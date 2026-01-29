import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/CheckOut.css";
import { getMyCart, clearCart } from "../../api/cartapi";
import { placeOrder } from "../../api/orderapi";

function Checkout() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const getImg = (imgPath) => {
    if (!imgPath) return "/no-image.png";
    if (String(imgPath).startsWith("http")) return imgPath;
    return `http://localhost:5000${imgPath}`;
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await getMyCart();

      const items =
        res.data?.items ||
        res.data?.cart?.items ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);

      setCartItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.log("❌ load cart error:", err.response?.status, err.response?.data);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("Please login again");
        navigate("/login", { replace: true });
        return;
      }
      alert(err.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      navigate("/login", { replace: true });
      return;
    }
    loadCart();
    // eslint-disable-next-line
  }, []);

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const p = item?.product || item;
      const price = Number(p?.price ?? 0);
      const qty = Number(item?.qty ?? item?.quantity ?? 1);
      return sum + price * qty;
    }, 0);
  }, [cartItems]);

  const handleChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!address.fullName.trim()) return "Full name required";
    if (!/^\d{10}$/.test(address.phone)) return "Phone must be 10 digits";
    if (!address.street.trim()) return "Street address required";
    if (!address.city.trim()) return "City required";
    if (!address.state.trim()) return "State required";
    if (!/^\d{6}$/.test(address.pincode)) return "Pincode must be 6 digits";
    if (!cartItems.length) return "Your cart is empty";
    return null;
  };

  const handlePlaceOrder = async () => {
    const errMsg = validate();
    if (errMsg) return alert(errMsg);

    try {
      setPlacing(true);

      const payload = {
        address,
        items: cartItems.map((i) => ({
          productId: i?.product?._id ?? i?.productId ?? i?._id,
          qty: i?.qty ?? i?.quantity ?? 1,
        })),
        total,
      };

      const res = await placeOrder(payload);

      // ✅ supports {order:{_id}} or {_id}
      const orderId = res.data?.order?._id || res.data?._id;

      if (!orderId) {
        console.log("❌ OrderId missing:", res.data);
        alert("Order placed, but order id missing");
        return navigate("/my-orders", { replace: true });
      }

      // ✅ optional: clear cart
      try {
        await clearCart();
      } catch (e) {
        // ignore cart clear errors
      }

      alert("Order placed ✅");

      // ✅ go to order details page
      navigate(`/order/${orderId}`, { replace: true });
    } catch (err) {
      console.log("❌ place order status:", err.response?.status);
      console.log("❌ place order data:", err.response?.data);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("Please login again");
        navigate("/login", { replace: true });
        return;
      }
      alert(err.response?.data?.message || "Place order failed");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="checkout-page container-fluid my-4 px-3 px-md-4">
      <div className="checkout-head">
        <div>
          <h3 className="mb-1">Checkout</h3>
          <p className="text-muted mb-0">Confirm address and place your order</p>
        </div>

        <Link to="/cart" className="back-cart">
          ← Back to Cart
        </Link>
      </div>

      {loading ? (
        <p className="text-center mt-4">Loading...</p>
      ) : (
        <div className="checkout-grid">
          {/* LEFT: Address */}
          <div className="checkout-card">
            <h5 className="card-title">Shipping Address</h5>

            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  name="fullName"
                  value={address.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  name="phone"
                  value={address.phone}
                  onChange={handleChange}
                  placeholder="10 digit mobile number"
                  inputMode="numeric"
                />
              </div>

              <div className="form-group form-wide">
                <label>Street Address</label>
                <input
                  name="street"
                  value={address.street}
                  onChange={handleChange}
                  placeholder="House, street, area"
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  name="state"
                  value={address.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </div>

              <div className="form-group">
                <label>Pincode</label>
                <input
                  name="pincode"
                  value={address.pincode}
                  onChange={handleChange}
                  placeholder="6 digit pincode"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div className="checkout-card">
            <h5 className="card-title">Order Summary</h5>

            <div className="summary-list">
              {cartItems.length === 0 ? (
                <p className="text-muted mb-0">No items in cart</p>
              ) : (
                cartItems.map((item, idx) => {
                  const p = item?.product || item;
                  const qty = item?.qty ?? item?.quantity ?? 1;

                  return (
                    <div className="summary-item" key={p?._id || idx}>
                      <img
                        src={getImg(p?.image)}
                        alt={p?.name || "Item"}
                        onError={(e) => (e.currentTarget.src = "/no-image.png")}
                      />

                      <div className="summary-info">
                        <div className="summary-name">{p?.name}</div>
                        <div className="summary-meta">
                          Qty: <b>{qty}</b> • ₹ {p?.price}
                        </div>
                      </div>

                      <div className="summary-price">
                        ₹ {Number(p?.price ?? 0) * Number(qty)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="summary-total">
              <span>Total</span>
              <b>₹ {total}</b>
            </div>

            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={!cartItems.length || placing}
            >
              {placing ? "Placing..." : "Place Order"}
            </button>

            <p className="secure-note">🔒 Secure checkout</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
