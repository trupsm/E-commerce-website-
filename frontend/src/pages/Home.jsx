import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";

const Home = () => {
  return (
    <div className="home-container">
      {/* Navbar */}
      <Navbar activePage="home" />

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <span className="tagline">Next Generation Shopping</span>
          <h2 className="hero-title">
            Discover Quality Products at Unbeatable Prices
          </h2>
          <p className="hero-description">
            Experience seamless e-commerce with real-time updates, secure payments, and lightning-fast delivery right to your doorstep.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg">
              Start Shopping Now →
            </Link>
            <Link to="/categories" className="btn btn-secondary btn-lg">
              Explore Categories
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
