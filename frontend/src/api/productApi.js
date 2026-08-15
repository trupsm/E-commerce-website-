import axiosInstance from "./axiosInstance";

// Get Products (cleans empty/null params before making GET request)
export const getProducts = async (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
        const val = params[key];
        if (val !== "" && val !== null && val !== undefined) {
            cleanParams[key] = val;
        }
    });

    const response = await axiosInstance.get(
        "/products",
        {
            params: cleanParams
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