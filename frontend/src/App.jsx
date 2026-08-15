import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
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
        <Routes>
          {/* ================================= */}
          {/* Public Routes */}
          {/* ================================= */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ================================= */}
          {/* Protected Customer Routes */}
          {/* ================================= */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* ================================= */}
          {/* Admin Routes */}
          {/* ================================= */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* ================================= */}
          {/* 404 */}
          {/* ================================= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;