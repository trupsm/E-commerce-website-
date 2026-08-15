import { Link } from "react-router-dom";
import useCart from "../hooks/useCart";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import Loader from "../components/common/Loader";

const Cart = () => {
  const { items, loading, error, itemCount } = useCart();

  if (loading && items.length === 0) {
    return (
      <div className="page-container" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader text="Loading your cart..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="cart-header">
        <h1 className="page-title">Shopping Cart</h1>
        {itemCount > 0 && (
          <span className="cart-count-badge">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
        )}
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet. Explore our products!</p>
          <Link to="/products" className="btn-primary">
            Start Shopping →
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Cart Items Column */}
          <div className="cart-items-col">
            <div className="cart-items-list">
              {items.map((item, index) => (
                <CartItem
                  key={item.productId || item.product?._id || index}
                  item={item}
                />
              ))}
            </div>

            <div className="cart-footer-actions">
              <Link to="/products" className="btn-continue">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Summary Column */}
          <aside className="cart-summary-col">
            <CartSummary />
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
