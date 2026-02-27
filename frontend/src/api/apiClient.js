import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
});

// ✅ Attach token automatically for every request
API.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("userToken");

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;