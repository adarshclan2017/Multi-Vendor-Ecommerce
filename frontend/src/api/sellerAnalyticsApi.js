import API from "./apiClient";

export const getSellerAnalytics = () => API.get("/seller/analytics");
export const getSellerMonthlyRevenue = () => API.get("/seller/analytics/monthly");
