import API from "./apiClient";

export const getPublicCategories = () => API.get("/categories");
