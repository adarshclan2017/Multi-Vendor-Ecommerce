import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/Productcard.css";
import { addToCart } from "../../api/cartapi";

function Productcard({ Product }) {
  const navigate = useNavigate();

  const imageUrl = Product?.image
    ? `http://localhost:5000${Product.image}`
    : "https://via.placeholder.com/600x600?text=No+Image";

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return navigate("/login");
    }

    if (!Product?._id) {
      alert("Product id missing");
      return;
    }

    try {
      await addToCart(Product._id, 1);
      alert("Added to cart ✅");
    } catch (err) {
      console.error("❌ Add to cart error:", err);
      alert(err.response?.data?.message || "Add to cart failed");
    }
  };

  const outOfStock = Number(Product?.stock) <= 0;

  return (
    <div className="col">
      <div className="pc-card">
        <Link to={`/product/${Product?._id}`} className="pc-media">
          <img className="pc-img" src={imageUrl} alt={Product?.name || "Product"} />

          <span className={`pc-badge ${outOfStock ? "pc-badge--danger" : "pc-badge--ok"}`}>
            {outOfStock ? "Out of stock" : `Stock: ${Product?.stock ?? 0}`}
          </span>
        </Link>

        <div className="pc-body">
          <div className="pc-top">
            <h5 className="pc-title" title={Product?.name}>{Product?.name}</h5>
            <p className="pc-price">₹ {Product?.price}</p>
          </div>

          <div className="pc-actions">
            <button
              className="pc-btn pc-btn--primary"
              onClick={handleAddToCart}
              disabled={outOfStock}
              title={outOfStock ? "Out of stock" : "Add to cart"}
            >
              {outOfStock ? "Unavailable" : "Add to cart"}
            </button>

            <Link className="pc-btn pc-btn--ghost" to={`/product/${Product?._id}`}>
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Productcard;
