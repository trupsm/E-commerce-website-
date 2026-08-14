import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: "520px" }}>
        <div className="auth-header">
          <h2>🔒 Protected Profile</h2>
          <p>This page is only accessible when you are logged in.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
          <div style={{ background: "rgba(10, 14, 23, 0.6)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Full Name</span>
            <strong style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>{user?.name}</strong>
          </div>

          <div style={{ background: "rgba(10, 14, 23, 0.6)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Email Address</span>
            <strong style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>{user?.email}</strong>
          </div>

          <div style={{ background: "rgba(10, 14, 23, 0.6)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Account Role</span>
            <strong style={{ fontSize: "1.1rem", color: "#a5b4fc", textTransform: "uppercase" }}>{user?.role}</strong>
          </div>

          <div style={{ background: "rgba(10, 14, 23, 0.6)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>User ID</span>
            <code style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{user?.id || user?._id}</code>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link to="/" className="btn btn-secondary" style={{ flex: 1 }}>
            ← Home
          </Link>
          <button onClick={logout} className="btn btn-primary" style={{ flex: 1 }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
