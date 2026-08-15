import { useContext } from "react";
import { CartContext } from "../context/CartContext";

const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    return {
      items: [],
      itemCount: 0,
      subtotal: 0,
      loading: false,
      error: "",
      addToCart: async () => {},
      updateQuantity: async () => {},
      removeItem: async () => {},
      clearCart: async () => {},
      refreshCart: async () => {},
    };
  }

  return context;
};

export default useCart;
