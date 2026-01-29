import API from "./apiClient";

// ✅ CREATE (multipart)
export const createProduct = (formData) => {
  const token = localStorage.getItem("token");

  return API.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

// ✅ UPDATE (multipart + optional image)
export const updateProduct = (id, formData) => {
  const token = localStorage.getItem("token");

  return API.put(`/products/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
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

