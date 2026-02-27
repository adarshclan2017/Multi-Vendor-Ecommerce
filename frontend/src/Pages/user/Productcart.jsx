import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../api/cartapi";
import "../../styles/Productcart.css";

// ✅ Local fallback (NO external domain)
const FALLBACK_IMG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
      <rect width='100%' height='100%' fill='#f2f2f2'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
        font-family='Arial' font-size='18' fill='#666'>
        No Image
      </text>
    </svg>
  `);

function Productcart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const [msg, setMsg] = useState({ type: "", text: "" });

  const showMsg = (type, text, ms = 3500) => {
    setMsg({ type, text });
    if (ms) setTimeout(() => setMsg({ type: "", text: "" }), ms);
  };

  const setNavCartCount = (items = []) => {
    const count = items.reduce((sum, it) => sum + Number(it.qty || 0), 0);
    localStorage.setItem("cartCount", String(count));
    window.dispatchEvent(new Event("cartCountUpdated"));
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await getMyCart();
      setCart(res.data);
      setNavCartCount(res.data?.items || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.setItem("cartCount", "0");
        window.dispatchEvent(new Event("cartCountUpdated"));
        navigate("/login", { replace: true });
      } else {
        showMsg("error", err.response?.data?.message || "Failed to load cart");
      }
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
  }, [navigate]);

  const total = useMemo(() => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((sum, it) => {
      const price = it.product?.price || 0;
      return sum + price * it.qty;
    }, 0);
  }, [cart]);

  const changeQty = async (productId, qty) => {
    if (qty < 1) return;
    setMsg({ type: "", text: "" });

    try {
      const res = await updateCartItem(productId, qty);
      setCart(res.data);
      setNavCartCount(res.data?.items || []);
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Update failed");
    }
  };

  const removeItem = async (productId) => {
    setMsg({ type: "", text: "" });

    try {
      const res = await removeCartItem(productId);
      setCart(res.data);
      setNavCartCount(res.data?.items || []);
      showMsg("success", "Item removed ✅", 2500);
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Remove failed");
    }
  };

  const handleClear = async () => {
    setMsg({ type: "", text: "" });

    try {
      await clearCart();
      setCart((prev) => (prev ? { ...prev, items: [] } : prev));
      setNavCartCount([]);
      showMsg("success", "Cart cleared ✅", 2500);
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Clear failed");
    }
  };

  if (loading) return <p className="cart-status">Loading cart...</p>;

  const hasItems = Boolean(cart?.items?.length);

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h2>My Cart</h2>

        {hasItems && (
          <button className="clear-btn" onClick={handleClear}>
            Clear Cart
          </button>
        )}
      </div>

      {msg.text && (
        <p
          className={`cart-msg ${
            msg.type === "error" ? "cart-msg--error" : "cart-msg--success"
          }`}
        >
          {msg.text}
        </p>
      )}

      {!hasItems ? (
        <p className="cart-status">Cart is empty.</p>
      ) : (
        <>
          <div className="cart-items">
            {cart.items.map((it) => {
              const p = it.product;

              // ✅ Cloudinary support
              const img =
                p?.image?.url ||
                (typeof p?.image === "string" && p.image.startsWith("http")
                  ? p.image
                  : null) ||
                FALLBACK_IMG;

              return (
                <div className="cart-item" key={p?._id}>
                  <div className="cart-img">
                    <img
                      src={img}
                      alt={p?.name || "Product"}
                      onError={(e) =>
                        (e.currentTarget.src = FALLBACK_IMG)
                      }
                    />
                  </div>

                  <div className="cart-info">
                    <h4>{p?.name}</h4>
                    <p className="price">₹ {p?.price}</p>

                    <div className="qty-row">
                      <button onClick={() => changeQty(p._id, it.qty - 1)}>
                        -
                      </button>
                      <span>{it.qty}</span>
                      <button onClick={() => changeQty(p._id, it.qty + 1)}>
                        +
                      </button>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeItem(p._id)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="line-total">
                    ₹ {Number(p?.price || 0) * it.qty}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h3>Total: ₹ {total}</h3>
            <button
              className="checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Productcart;