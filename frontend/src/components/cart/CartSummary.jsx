import { useNavigate } from "react-router-dom";
import useCart from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";

const CartSummary = () => {
  const { subtotal, itemCount, clearCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const TAX_RATE = 0.18; // 18% GST
  const SHIPPING_THRESHOLD = 999;
  const shipping = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 79;

  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total = subtotal + tax + shipping;

  const handleCheckout = () => {
    if (!user) {
      navigate("/login?redirect=/checkout");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="cart-summary">
      <h3 className="cart-summary-title">Order Summary</h3>

      <div className="summary-row">
        <span>Subtotal ({itemCount} items)</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="summary-row">
        <span>GST (18%)</span>
        <span>${tax.toFixed(2)}</span>
      </div>
      <div className="summary-row">
        <span>Shipping</span>
        <span>
          {shipping === 0 ? (
            <span className="free-shipping">FREE</span>
          ) : (
            `$${shipping.toFixed(2)}`
          )}
        </span>
      </div>

      {shipping > 0 && (
        <p className="shipping-notice">
          Add ${(SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping
        </p>
      )}

      <div className="summary-divider" />

      <div className="summary-row summary-total">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <button
        className="btn-checkout"
        onClick={handleCheckout}
        disabled={loading || itemCount === 0}
      >
        {user ? "Proceed to Checkout →" : "Login to Checkout →"}
      </button>

      <button
        className="btn-clear-cart"
        onClick={clearCart}
        disabled={loading || itemCount === 0}
      >
        Clear Cart
      </button>
    </div>
  );
};

export default CartSummary;
