import API from "./apiClient";

// ✅ CREATE (multipart FormData)
// Use this with AddProduct where you send FormData (image file).
export const createProduct = (formData) => {
  const token = localStorage.getItem("token");

  return API.post("/products", formData, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // ❌ don't set Content-Type manually for FormData
    },
  });
};

// ✅ UPDATE (JSON payload)
// Use this with SellerEditProduct where you send:
// { name, price, stock, category, description, image: { url, publicId } }
export const updateProduct = (id, payload) => {
  const token = localStorage.getItem("token");

  return API.put(`/products/${id}`, payload, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

// ✅ READ
export const getAllProducts = () => API.get("/products");
export const getMyProducts = () => API.get("/products/seller/me");
export const getProductById = (id) => API.get(`/products/${id}`);

// ✅ DELETE
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// ✅ REVIEW
export const addReview = (id, data) => API.post(`/products/${id}/reviews`, data);