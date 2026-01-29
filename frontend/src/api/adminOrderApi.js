import API from "./apiClient";

export const getAllOrders = () => API.get("/admin/orders");
export const updateOrderStatus = (orderId, status) =>
    API.put(`/admin/orders/${orderId}/status`, { status });
