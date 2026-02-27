import API from "./apiClient";

export const loginuser = (data) => {
  return API.post("/auth/login", data);
};

export const registeruser = (data) => {
  return API.post("/auth/register", data);
};
