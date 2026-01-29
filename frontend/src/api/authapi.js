import API from "./apiClient";

export const loginuser = (data) => {
  return API.post("/auth/Login", data);
};

export const registeruser = (data) => {
  return API.post("/auth/Register", data);
};
