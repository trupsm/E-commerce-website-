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
    <div className="page-container" style={{ padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Navigation & Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link to="/" className="btn btn-secondary btn-sm" style={{ padding: "8px 16px" }}>
              🏠 Home
            </Link>
            <h1 className="page-title" style={{ fontSize: "2.1rem", margin: 0 }}>
              Shopping Cart
            </h1>
            {itemCount > 0 && (
              <span className="cart-count-badge" style={{ fontSize: "0.85rem", padding: "4px 12px" }}>
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <Link to="/products" className="btn btn-secondary btn-sm" style={{ padding: "8px 16px" }}>
            🛍️ Browse Products
          </Link>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="empty-cart" style={{ padding: "60px 24px", textAlign: "center" }}>
            <div className="empty-cart-icon" style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🛒</div>
            <h2 style={{ fontSize: "1.7rem", marginBottom: "8px" }}>Your cart is empty</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
              Looks like you haven't added anything yet. Explore our products!
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center" }}>
              <Link to="/" className="btn btn-secondary" style={{ padding: "12px 24px" }}>
                🏠 Return Home
              </Link>
              <Link to="/products" className="btn btn-primary" style={{ padding: "12px 24px" }}>
                Start Shopping →
              </Link>
            </div>
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

              <div className="cart-footer-actions" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
                <Link to="/" className="btn btn-secondary">
                  🏠 Home
                </Link>
                <Link to="/products" className="btn btn-secondary">
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
    </div>
  );
};

export default Cart;
