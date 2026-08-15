import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="home-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="nav-brand">
          <Link to="/" style={{ textDecoration: "none" }}>
            <h1>Vyoma - A World Of Choices</h1>
          </Link>
        </div>
        <nav className="nav-links">
          {user ? (
            <div className="user-profile">
              <Link to="/profile" className="user-badge" style={{ textDecoration: "none" }}>
                👤 {user.name}
              </Link>
              <button onClick={logout} className="btn btn-secondary btn-sm">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
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

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <span className="tagline">Next Generation Shopping</span>
          <h2 className="hero-title">
            Discover Quality Products at Unbeatable Prices
          </h2>
          <p className="hero-description">
            Experience seamless e-commerce built with the modern MERN stack.
            Explore curated collections and fast checkout.
          </p>

          <div className="hero-cta">
            {user ? (
              <div className="welcome-banner">
                <h3>Welcome back, {user.name}! 👋</h3>
                <p style={{ marginBottom: "20px" }}>
                  You are authenticated with <strong>{user.email}</strong>
                </p>
                <Link to="/products" className="btn btn-primary btn-lg">
                  Start Shopping →
                </Link>
              </div>
            ) : (
              <Link to="/products" className="btn btn-primary btn-lg">
                Start Shopping →
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
