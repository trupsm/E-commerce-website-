import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔒 Protected Routes (Logged-in users only) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 👑 Admin Routes Example */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            {/* Future admin-only routes like /admin/dashboard */}
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
