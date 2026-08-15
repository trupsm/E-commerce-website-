import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

const Dashboard = () => {
  return (
    <div className="page-container">
      <div className="auth-card" style={{ maxWidth: "600px", margin: "40px auto" }}>
        <h2>Customer Dashboard</h2>
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>
          Welcome to your customer dashboard.
        </p>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <div className="page-container">
      <div className="auth-card" style={{ maxWidth: "600px", margin: "40px auto" }}>
        <h2>👑 Admin Dashboard</h2>
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>
          Welcome to the admin control panel.
        </p>
      </div>
    </div>
  );
};

const NotFound = () => {
  return (
    <div className="center-loader" style={{ textAlign: "center", gap: "12px" }}>
      <h1 style={{ fontSize: "3rem", color: "var(--primary)" }}>404</h1>
      <h2>Page Not Found</h2>
      <Link to="/" className="btn btn-primary btn-sm" style={{ marginTop: "12px" }}>
        Return Home
      </Link>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* ================================= */}
            {/* Public Routes */}
            {/* ================================= */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ================================= */}
            {/* Protected Customer Routes */}
            {/* ================================= */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />

            {/* ================================= */}
            {/* Admin Routes */}
            {/* ================================= */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            {/* ================================= */}
            {/* 404 */}
            {/* ================================= */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;