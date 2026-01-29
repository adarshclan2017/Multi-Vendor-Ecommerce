import API from "./apiClient";

// Place order
export const placeOrder = (payload) => API.post("/orders/place", payload);

// My orders
export const getMyOrders = () => API.get("/orders/my");

// Order by id
export const getOrderById = (id) => API.get(`/orders/${id}`);

// Cancel my order
export const cancelOrder = (id) => API.put(`/orders/${id}/cancel`);
