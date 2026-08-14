import axiosInstance from "./axiosInstance";
//This file handles all the requests made to the backend authentication routes (register, login, getMe, logout)

export const authApi = {
  register: async (userData) => { //receives name email and password from the user
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => { //receives email and password from the user
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
  },

  getMe: async () => { //gets the user info
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  },

  logout: async () => { //clears the cookie
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  },
};
