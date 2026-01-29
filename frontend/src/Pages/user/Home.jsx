import { useEffect, useMemo, useState } from "react";
import Productcard from "../user/Productcard";
import "../../styles/Productcard.css";
import Footer from "../../Components/Footer";
import Slideshow from "../../components/SlideShow";
import { getAllProducts } from "../../api/productapi";

const getCategoryLabel = (p) => {
  const c = p?.category;

  // populated object
  if (c && typeof c === "object") return String(c.name || "").trim();

  // string/id
  return String(c || "").trim();
};

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ category filter
  const [cat, setCat] = useState("all");

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await getAllProducts();
      setProducts(res.data || []);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ✅ build dropdown options safely
  const categories = useMemo(() => {
    const set = new Set();

    (products || []).forEach((p) => {
      const label = getCategoryLabel(p);
      if (label) set.add(label);
    });

    return ["all", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    if (cat === "all") return products;
    return (products || []).filter((p) => getCategoryLabel(p) === cat);
  }, [products, cat]);

  return (
    <>
      <Slideshow />

      <main>
        <div className="text-center mt-5 mb-3">
          <h2>All PRODUCT'S</h2>
        </div>

        {/* ✅ Modern category dropdown only */}
        <div className="container-fluid mb-4 d-flex ">
          <div style={{ maxWidth: 420}} className="d-flex  align-items-center gap-4 ">
            <div style={{ fontWeight: 800, marginBottom: 8, display: "block" }}>
              Category
            </div>

            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                fontWeight: 800,
                outline: "none",
              }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="container-fluid">
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center">No products found.</p>
          ) : (
            <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
              {filtered.map((product) => (
                <Productcard key={product._id} Product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Home;
