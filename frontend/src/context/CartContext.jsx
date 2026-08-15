import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeGuestCart,
} from "../api/cartApi";
import { useAuth } from "../hooks/useAuth";

export const CartContext = createContext(null);

const GUEST_CART_KEY = "vyoma_guest_cart";

const loadGuestCart = () => {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + (i.product?.price || 0) * i.quantity,
    0
  );

  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError("");
      const data = await getCart();
      if (data.success && data.cart) {
        setItems(data.cart.items || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const guestItems = loadGuestCart();
      if (guestItems.length > 0) {
        mergeGuestCart(guestItems)
          .catch(() => {})
          .finally(() => {
            localStorage.removeItem(GUEST_CART_KEY);
            fetchCart();
          });
      } else {
        fetchCart();
      }
    } else {
      setItems(loadGuestCart());
    }
  }, [user, fetchCart]);

  const handleAddToCart = async (product, quantity = 1) => {
    if (user) {
      try {
        setLoading(true);
        await addToCart(product._id, quantity);
        await fetchCart();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to add to cart");
      } finally {
        setLoading(false);
      }
    } else {
      const guestCart = loadGuestCart();
      const existing = guestCart.find((i) => i.productId === product._id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        guestCart.push({ productId: product._id, product, quantity });
      }
      saveGuestCart(guestCart);
      setItems([...guestCart]);
    }
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    if (user) {
      try {
        setLoading(true);
        await updateCartItem(productId, quantity);
        await fetchCart();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to update cart");
      } finally {
        setLoading(false);
      }
    } else {
      const guestCart = loadGuestCart().map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      );
      saveGuestCart(guestCart);
      setItems(guestCart);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (user) {
      try {
        setLoading(true);
        await removeFromCart(productId);
        await fetchCart();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to remove item");
      } finally {
        setLoading(false);
      }
    } else {
      const guestCart = loadGuestCart().filter((i) => i.productId !== productId);
      saveGuestCart(guestCart);
      setItems(guestCart);
    }
  };

  const handleClearCart = async () => {
    if (user) {
      try {
        setLoading(true);
        await clearCart();
        setItems([]);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to clear cart");
      } finally {
        setLoading(false);
      }
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
      setItems([]);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        loading,
        error,
        addToCart: handleAddToCart,
        updateQuantity: handleUpdateQuantity,
        removeItem: handleRemoveItem,
        clearCart: handleClearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;