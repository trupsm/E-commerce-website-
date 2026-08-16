import axiosInstance from "./axiosInstance";

// Create Order
export const createOrder = async (orderData) => {
  const response = await axiosInstance.post("/orders", orderData);
  return response.data;
};

// Get Logged-in User's Orders
export const getMyOrders = async () => {
  const response = await axiosInstance.get("/orders/myorders");
  return response.data;
};

// Get Single Order By ID
export const getOrderById = async (orderId) => {
  const response = await axiosInstance.get(`/orders/${orderId}`);
  return response.data;
};

// Update Order Payment Status To Paid
export const updateOrderToPaid = async (orderId, paymentResult = {}) => {
  const response = await axiosInstance.put(`/orders/${orderId}/pay`, paymentResult);
  return response.data;
};

// Admin: Get All Orders
export const getAllOrders = async () => {
  const response = await axiosInstance.get("/orders");
  return response.data;
};

// Admin: Update Order Status
export const updateOrderStatus = async (orderId, orderStatus) => {
  const response = await axiosInstance.put(`/orders/${orderId}/status`, { orderStatus });
  return response.data;
};

// Create Stripe Payment Intent
export const createPaymentIntent = async (shippingAddress) => {
  const response = await axiosInstance.post("/orders/payment-intent", {
    shippingAddress,
  });
  return response.data;
};

const orderApi = {
  createOrder,
  createPaymentIntent,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  getAllOrders,
  updateOrderStatus,
};

export default orderApi;