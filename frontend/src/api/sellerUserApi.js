import API from "./apiClient";

export const getMe = () => API.get("/users/me");
