import API from "./apiClient";

export const getAdminSettings = () => API.get("/admin/settings");
export const updateAdminSettings = (data) => API.put("/admin/settings", data);
