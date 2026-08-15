import axiosInstance from "./axiosInstance";

export const authApi = {
  register: async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  },

  // Address API endpoints
  getAddresses: async () => {
    const response = await axiosInstance.get("/auth/addresses");
    return response.data;
  },

  addAddress: async (addressData) => {
    const response = await axiosInstance.post("/auth/addresses", addressData);
    return response.data;
  },

  updateAddress: async (addressId, addressData) => {
    const response = await axiosInstance.put(`/auth/addresses/${addressId}`, addressData);
    return response.data;
  },

  deleteAddress: async (addressId) => {
    const response = await axiosInstance.delete(`/auth/addresses/${addressId}`);
    return response.data;
  },

  setDefaultAddress: async (addressId) => {
    const response = await axiosInstance.put(`/auth/addresses/${addressId}/default`);
    return response.data;
  },
};
