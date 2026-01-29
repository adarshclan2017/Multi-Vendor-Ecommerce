import API from "./apiClient";

export const addToCart = (productId, qty = 1) =>
  API.post("/cart/add", { productId, qty });

export const getMyCart = () => API.get("/cart");

export const updateCartItem = (productId, qty) =>
  API.put("/cart/update", { productId, qty });

export const removeCartItem = (productId) =>
  API.delete(`/cart/remove/${productId}`);

export const clearCart = () => API.delete("/cart/clear");


