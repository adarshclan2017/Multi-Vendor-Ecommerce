import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../api/cartapi";
import "../../styles/Productcart.css";

function Productcart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({})

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await getMyCart();
      setCart(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
      } else {
        console.log(err.response?.data?.message || "Failed to load cart");
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
    try {
      const res = await updateCartItem(productId, qty);
      setCart(res.data);
    } catch (err) {
      setErrors({message:err.response?.data?.message || "Update failed"});
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await removeCartItem(productId);
      setCart(res.data);
    } catch (err) {
     setErrors({message:err.response?.data?.message || "Remove failed"});
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear cart?")) return;
    try {
      await clearCart();
      await loadCart();
    } catch (err) {
     setErrors({message:err.response?.data?.message || "clear failed"});
    }
  };

  if (loading) return <p className="cart-status">Loading cart...</p>;

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h2>My Cart</h2>
        <button className="clear-btn" onClick={handleClear}>
          Clear Cart
        </button>
      </div>

      {!cart?.items?.length ? (
        <p className="cart-status">Cart is empty.</p>
      ) : (
        <>
          <div className="cart-items">
            {cart.items.map((it) => {
              const p = it.product;
              const img = p?.image
                ? `http://localhost:5000${p.image}`
                : "https://via.placeholder.com/180";

              return (
                <div className="cart-item" key={p?._id}>
                  <div className="cart-img">
                    <img src={img} alt={p?.name || "Product"} />
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
              {errors.message && <p className="error text-danger">{errors.message}</p>}
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
