import API from "./apiClient";

export const getAdminCategories = () => API.get("/admin/categories");
export const createAdminCategory = (data) => API.post("/admin/categories", data);
export const updateAdminCategory = (id, data) =>
  API.put(`/admin/categories/${id}`, data);
export const deleteAdminCategory = (id) =>
  API.delete(`/admin/categories/${id}`);
