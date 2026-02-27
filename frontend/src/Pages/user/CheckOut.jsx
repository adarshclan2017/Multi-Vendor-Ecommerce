import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/CheckOut.css";
import { getMyCart, clearCart } from "../../api/cartapi";
import { placeOrder } from "../../api/orderapi";

/* ✅ Local SVG fallback (NO DNS issues) */
const FALLBACK_IMG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>
      <rect width='100%' height='100%' fill='#f2f2f2'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
        font-family='Arial' font-size='14' fill='#666'>
        No Image
      </text>
    </svg>
  `);

function Checkout() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  /* ✅ Cloudinary-safe image resolver */
  const resolveImage = (imgRaw) => {
    if (!imgRaw) return FALLBACK_IMG;

    // Case 1: { url, publicId }
    if (typeof imgRaw === "object" && imgRaw.url) {
      return String(imgRaw.url);
    }

    // Case 2: direct URL
    if (typeof imgRaw === "string" && imgRaw.startsWith("http")) {
      return imgRaw;
    }

    return FALLBACK_IMG;
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await getMyCart();

      const items =
        res.data?.items ||
        res.data?.cart?.items ||
        (Array.isArray(res.data) ? res.data : []);

      setCartItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.log("❌ load cart error:", err.response?.status, err.response?.data);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("Session expired. Please login again.");
        navigate("/login", { replace: true });
        return;
      }

      setError(err.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
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
    const { name, value } = e.target;

    if (error) setError("");
    if (success) setSuccess("");

    setAddress((prev) => ({ ...prev, [name]: value }));
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
    if (errMsg) {
      setError(errMsg);
      return;
    }

    try {
      setPlacing(true);
      setError("");
      setSuccess("");

      const payload = {
        address,
        items: cartItems.map((i) => ({
          productId: i?.product?._id ?? i?._id,
          qty: i?.qty ?? i?.quantity ?? 1,
        })),
        total,
      };

      const res = await placeOrder(payload);

      const orderId = res.data?.order?._id || res.data?._id;

      if (!orderId) {
        setError("Order created but ID missing. Check My Orders.");
        return navigate("/my-orders", { replace: true });
      }

      try {
        await clearCart();
      } catch (e) {}

      setSuccess("Order placed successfully ✅");

      navigate(`/order/${orderId}`, { replace: true });
    } catch (err) {
      console.log("❌ place order:", err.response?.data || err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("Session expired. Please login again.");
        navigate("/login", { replace: true });
        return;
      }

      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="checkout-page container-fluid my-4 px-3 px-md-4">
      <div className="checkout-head">
        <div>
          <h3 className="mb-1">Checkout</h3>
          <p className="text-muted mb-0">
            Confirm address and place your order
          </p>
        </div>

        <Link to="/cart" className="back-cart">
          ← Back to Cart
        </Link>
      </div>

      {error && <div className="co-error">{error}</div>}
      {success && <div className="co-success">{success}</div>}

      {loading ? (
        <p className="text-center mt-4">Loading...</p>
      ) : (
        <div className="checkout-grid">
          {/* LEFT: Address */}
          <div className="checkout-card">
            <h5 className="card-title">Shipping Address</h5>

            <div className="form-grid">
              {["fullName", "phone", "street", "city", "state", "pincode"].map(
                (field) => (
                  <div className="form-group" key={field}>
                    <label>{field}</label>
                    <input
                      name={field}
                      value={address[field]}
                      onChange={handleChange}
                    />
                  </div>
                )
              )}
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
                        src={resolveImage(p?.image)}
                        alt={p?.name || "Item"}
                        onError={(e) =>
                          (e.currentTarget.src = FALLBACK_IMG)
                        }
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