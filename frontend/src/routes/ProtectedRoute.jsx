import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// This is the ProtectedRoute component used to protect routes in the frontend.
/*
It takes an allowedRoles prop, which is an array of roles that are allowed to access the route.

If the user is not logged in, it redirects to the login page.
If the user is logged in but does not have the required role, it redirects to the home page.
Otherwise, it renders the child components.
*/
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="center-loader">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
