import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../api/authApi";
import Loader from "../components/common/Loader";

const Profile = () => {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectNotice = searchParams.get("notice");

  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressError, setAddressError] = useState("");
  const [addressSuccess, setAddressSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const initialFormState = {
    fullName: user?.name || "",
    phone: "",
    country: "India",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    isDefault: false,
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await authApi.getAddresses();
      if (res.success) {
        setAddresses(res.addresses || []);
      }
    } catch (err) {
      console.error("Failed to load addresses", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingAddressId(null);
    setShowAddressForm(false);
    setAddressError("");
  };

  const handleOpenAddForm = () => {
    setFormData(initialFormState);
    setEditingAddressId(null);
    setShowAddressForm(true);
    setAddressError("");
    setAddressSuccess("");
  };

  const handleOpenEditForm = (addr) => {
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      country: addr.country || "India",
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault || false,
    });
    setEditingAddressId(addr._id);
    setShowAddressForm(true);
    setAddressError("");
    setAddressSuccess("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setAddressError("");
    setAddressSuccess("");

    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.addressLine1.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.postalCode.trim()
    ) {
      setAddressError("Please fill in all required address fields.");
      return;
    }

    try {
      setSubmitting(true);
      let res;
      if (editingAddressId) {
        res = await authApi.updateAddress(editingAddressId, formData);
      } else {
        res = await authApi.addAddress(formData);
      }

      if (res.success) {
        setAddresses(res.addresses || []);
        setAddressSuccess(
          editingAddressId
            ? "Shipping address updated successfully!"
            : "New shipping address added successfully!"
        );
        resetForm();
      } else {
        setAddressError(res.message || "Failed to save address.");
      }
    } catch (err) {
      setAddressError(
        err.response?.data?.message || err.message || "An error occurred while saving address."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this shipping address?")) return;
    try {
      const res = await authApi.deleteAddress(addressId);
      if (res.success) {
        setAddresses(res.addresses || []);
        setAddressSuccess("Address deleted successfully.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete address.");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const res = await authApi.setDefaultAddress(addressId);
      if (res.success) {
        setAddresses(res.addresses || []);
        setAddressSuccess("Default shipping address updated.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to set default address.");
    }
  };

  return (
    <div className="auth-container" style={{ padding: "40px 20px" }}>
      <div className="auth-card" style={{ maxWidth: "720px", width: "100%" }}>
        {/* Header */}
        <div className="auth-header">
          <h2>🔒 Customer Profile</h2>
          <p>Manage your account settings and saved shipping addresses.</p>
        </div>

        {/* Redirect Notice Banner (if redirected from checkout) */}
        {redirectNotice && (
          <div
            className="alert"
            style={{
              background: "rgba(245, 158, 11, 0.15)",
              color: "#fbbf24",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              marginBottom: "24px",
            }}
          >
            ⚠️ Please add a shipping address below before proceeding to checkout.
          </div>
        )}

        {addressSuccess && (
          <div
            className="alert"
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              marginBottom: "20px",
            }}
          >
            {addressSuccess}
          </div>
        )}

        {/* User Account Info Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "rgba(10, 14, 23, 0.6)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Full Name</span>
            <strong style={{ fontSize: "1.05rem", color: "var(--text-primary)" }}>{user?.name}</strong>
          </div>

          <div style={{ background: "rgba(10, 14, 23, 0.6)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Email Address</span>
            <strong style={{ fontSize: "1.05rem", color: "var(--text-primary)" }}>{user?.email}</strong>
          </div>

          <div style={{ background: "rgba(10, 14, 23, 0.6)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Account Role</span>
            <strong style={{ fontSize: "1.05rem", color: "#a5b4fc", textTransform: "uppercase" }}>{user?.role}</strong>
          </div>

          <div style={{ background: "rgba(10, 14, 23, 0.6)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>User ID</span>
            <code style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{user?.id || user?._id}</code>
          </div>
        </div>

        {/* =================================================== */}
        {/* Shipping Address Section */}
        {/* =================================================== */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "8px" }}>
              📍 Saved Shipping Addresses ({addresses.length})
            </h3>

            {!showAddressForm && (
              <button onClick={handleOpenAddForm} className="btn btn-primary btn-sm">
                + Add New Address
              </button>
            )}
          </div>

          {/* Add / Edit Address Form */}
          {showAddressForm && (
            <div
              style={{
                background: "rgba(10, 14, 23, 0.75)",
                border: "1px solid var(--primary)",
                borderRadius: "var(--radius-md)",
                padding: "24px",
                marginBottom: "24px",
                boxShadow: "0 0 20px rgba(99, 102, 241, 0.15)",
              }}
            >
              <h4 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--primary)" }}>
                {editingAddressId ? "✏️ Edit Shipping Address" : "➕ Add New Shipping Address"}
              </h4>

              {addressError && (
                <div className="alert alert-error" style={{ marginBottom: "16px" }}>
                  {addressError}
                </div>
              )}

              <form onSubmit={handleFormSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Country *</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="India"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Address Line 1 *</label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      placeholder="Street address, flat, or apartment"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      placeholder="Landmark, suite, floor, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Bengaluru"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Karnataka"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Postal Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="560001"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1", marginTop: "4px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={formData.isDefault}
                        onChange={handleInputChange}
                        style={{ width: "auto", accentColor: "var(--primary)" }}
                      />
                      <span>Set as Default Shipping Address</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
                    {submitting ? <Loader text="Saving..." /> : editingAddressId ? "Update Address" : "Save Address"}
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Saved Address Cards */}
          {loadingAddresses ? (
            <Loader text="Loading addresses..." />
          ) : addresses.length === 0 ? (
            <div
              style={{
                background: "rgba(10, 14, 23, 0.4)",
                border: "1px dashed var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "32px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📍</div>
              <h4 style={{ marginBottom: "6px" }}>No Saved Shipping Address</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "16px" }}>
                Add your delivery address once so you can quickly check out orders in the future.
              </p>
              <button onClick={handleOpenAddForm} className="btn btn-primary btn-sm">
                + Add Address Now
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  style={{
                    background: "rgba(10, 14, 23, 0.6)",
                    border: `1px solid ${addr.isDefault ? "var(--primary)" : "var(--border-color)"}`,
                    borderRadius: "var(--radius-md)",
                    padding: "20px",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
                    <div>
                      <strong style={{ fontSize: "1.05rem", color: "var(--text-primary)" }}>
                        {addr.fullName}
                      </strong>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "10px" }}>
                        📞 {addr.phone}
                      </span>
                    </div>

                    {addr.isDefault && (
                      <span
                        style={{
                          background: "rgba(99, 102, 241, 0.2)",
                          color: "#c7d2fe",
                          border: "1px solid rgba(99, 102, 241, 0.4)",
                          padding: "4px 12px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          letterSpacing: "0.5px",
                        }}
                      >
                        DEFAULT ADDRESS
                      </span>
                    )}
                  </div>

                  <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.6" }}>
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}<br />
                    {addr.city}, {addr.state} - {addr.postalCode}<br />
                    {addr.country}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "14px" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleOpenEditForm(addr)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="btn btn-sm"
                        style={{
                          padding: "6px 14px",
                          fontSize: "0.82rem",
                          background: "rgba(239, 68, 68, 0.12)",
                          color: "#fca5a5",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>

                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(addr._id)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          padding: "6px 14px",
                          fontSize: "0.8rem",
                          background: "rgba(99, 102, 241, 0.12)",
                          color: "#c7d2fe",
                          borderColor: "rgba(99, 102, 241, 0.3)",
                        }}
                      >
                        ⭐ Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order History Banner */}
        <div
          style={{
            background: "rgba(99, 102, 241, 0.1)",
            padding: "20px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div>
            <strong style={{ fontSize: "1.05rem", color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              📦 Order History
            </strong>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              View your past purchases, receipts, and order tracking
            </span>
          </div>
          <Link to="/orders" className="btn btn-primary btn-sm" style={{ whiteSpace: "nowrap" }}>
            View Orders →
          </Link>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: "flex", gap: "12px" }}>
          <Link to="/" className="btn btn-secondary" style={{ flex: 1 }}>
            ← Home
          </Link>
          <Link to="/orders" className="btn btn-primary" style={{ flex: 1 }}>
            📦 My Orders
          </Link>
          <button onClick={logout} className="btn btn-secondary" style={{ flex: 1 }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
