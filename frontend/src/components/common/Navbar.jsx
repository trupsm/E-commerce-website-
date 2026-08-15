import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";

const Navbar = ({ activePage = "" }) => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="navbar">
      <div className="nav-brand">
        <Link to="/" style={{ textDecoration: "none" }}>
          <h1>Vyoma - A World Of Choices</h1>
        </Link>
      </div>

      <nav className="nav-links">
        {/* Home Link */}
        <Link to="/" className={`nav-item-pill ${activePage === "home" ? "active" : ""}`}>
          🏠 Home
        </Link>

        {/* Shop Link */}
        <Link to="/products" className={`nav-item-pill ${activePage === "shop" ? "active" : ""}`}>
          🛍️ Shop
        </Link>

        {/* Cart Link */}
        <Link to="/cart" className={`nav-item-pill cart-pill ${activePage === "cart" ? "active" : ""}`} title="Shopping Cart">
          🛒 Cart
          {itemCount > 0 && (
            <span className="cart-badge-inline">{itemCount > 99 ? "99+" : itemCount}</span>
          )}
        </Link>

        {/* Orders Link (Available for logged-in users or direct link) */}
        <Link
          to="/orders"
          className={`nav-item-pill ${activePage === "orders" ? "active" : ""}`}
          title="Order History"
        >
          📦 Orders
        </Link>

        {/* User Profile & Auth Controls */}
        {user ? (
          <div className="user-profile" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              to="/profile"
              className={`user-badge ${activePage === "profile" ? "active" : ""}`}
              style={{ textDecoration: "none", color: "var(--primary)" }}
            >
              👤 {user.name}
            </Link>

            <button onClick={logout} className="btn btn-secondary btn-sm">
              Sign Out
            </button>
          </div>
        ) : (
          <div className="auth-buttons" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
