import API from "./apiClient";

/**
 * GET all seller orders
 */
export const getSellerOrders = () => {
  return API.get("/seller/orders");
};

/**
 * GET single seller order by id
 * 🛑 Prevents calling API with undefined / empty id
 */
export const getSellerOrderById = (id) => {
  if (!id) {
    console.warn("⚠️ getSellerOrderById called without id");
    return Promise.reject({
      response: { data: { message: "Order ID is missing" } },
    });
  }

  return API.get(`/seller/orders/${id}`);
};

/**
 * UPDATE seller order status
 */
export const updateSellerOrderStatus = (orderId, status) => {
  if (!orderId) {
    console.warn("⚠️ updateSellerOrderStatus called without orderId");
    return Promise.reject({
      response: { data: { message: "Order ID is missing" } },
    });
  }

  return API.put(`/seller/orders/${orderId}/status`, { status });
};
