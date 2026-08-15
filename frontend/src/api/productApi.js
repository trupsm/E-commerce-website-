import axiosInstance from "./axiosInstance";

// Get Products
export const getProducts = async (params = {}) => {
    const response = await axiosInstance.get(
        "/products",
        {
            params
        }
    );

    return response.data;
};

// Get Single Product
export const getProductById = async (productId) => {
    const response = await axiosInstance.get(
        `/products/${productId}`
    );

    return response.data;
};

// Get Categories
export const getCategories = async () => {
    const response = await axiosInstance.get(
        "/categories"
    );

    return response.data;
};