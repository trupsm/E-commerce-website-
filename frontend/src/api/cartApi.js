import axiosInstance
    from "./axiosInstance";


// ==========================================
// Get Cart
// ==========================================

export const getCart = async () => {

    const response =
        await axiosInstance.get(
            "/cart"
        );

    return response.data;
};


// ==========================================
// Add To Cart
// ==========================================

export const addToCart = async (
    productId,
    quantity
) => {

    const response =
        await axiosInstance.post(
            "/cart",
            {
                productId,
                quantity
            }
        );

    return response.data;
};


// ==========================================
// Update Cart Item
// ==========================================

export const updateCartItem = async (
    productId,
    quantity
) => {

    const response =
        await axiosInstance.put(
            `/cart/${productId}`,
            {
                quantity
            }
        );

    return response.data;
};


// ==========================================
// Remove Cart Item
// ==========================================

export const removeFromCart = async (
    productId
) => {

    const response =
        await axiosInstance.delete(
            `/cart/${productId}`
        );

    return response.data;
};


// ==========================================
// Clear Cart
// ==========================================

export const clearCart = async () => {

    const response =
        await axiosInstance.delete(
            "/cart"
        );

    return response.data;
};


// ==========================================
// Merge Guest Cart
// ==========================================

export const mergeGuestCart =
    async (items) => {

        const response =
            await axiosInstance.post(
                "/cart/merge",
                {
                    items
                }
            );

        return response.data;
    };