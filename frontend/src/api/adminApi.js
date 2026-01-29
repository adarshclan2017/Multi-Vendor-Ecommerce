import API from "./apiClient";

// dashboard
export const getAdminStats = () => API.get("/admin/stats");

// orders
export const getAdminOrders = () => API.get("/admin/orders");
export const getAdminOrderById = (id) => API.get(`/admin/orders/${id}`);
export const updateAdminOrderStatus = (id, status) =>
  API.put(`/admin/orders/${id}/status`, { status });

// users
export const getAdminUsers = () => API.get("/admin/users");
export const updateAdminUser = (id, data) => API.put(`/admin/users/${id}`, data);

// products
export const getAdminProducts = () => API.get("/admin/products");
export const getAdminProductById = (id) => API.get(`/admin/products/${id}`);

export const createAdminProduct = (formData) =>
  API.post("/admin/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateAdminProduct = (id, formData) =>
  API.put(`/admin/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteAdminProduct = (id) => API.delete(`/admin/products/${id}`);