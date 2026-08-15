import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useCart from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { createOrder } from "../api/orderApi";
import { authApi } from "../api/authApi";
import Loader from "../components/common/Loader";

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' fill='%2364748b' font-size='30' dominant-baseline='middle' text-anchor='middle'%3E🛍️%3C/text%3E%3C/svg%3E";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const TAX_RATE = 0.18;
  const SHIPPING_THRESHOLD = 999;
  const shippingCost = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 79;
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total = subtotal + tax + shippingCost;

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("new");
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Check saved shipping addresses on load
  useEffect(() => {
    const fetchUserAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const res = await authApi.getAddresses();
        if (res.success) {
          const list = res.addresses || [];
          setSavedAddresses(list);

          if (list.length === 0) {
            // Requirement: "if the user is checking out the order and if there is no shipping address they should be redirected to add the shipping address"
            navigate("/profile?redirect=/checkout&notice=no_address", { replace: true });
            return;
          }

          // Pre-select default address or first address
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
            setFormData({
              fullName: defaultAddr.fullName,
              phone: defaultAddr.phone,
              addressLine1: defaultAddr.addressLine1,
              addressLine2: defaultAddr.addressLine2 || "",
              city: defaultAddr.city,
              state: defaultAddr.state,
              postalCode: defaultAddr.postalCode,
              country: defaultAddr.country || "India",
            });
          }
        }
      } catch (err) {
        console.error("Error loading addresses", err);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchUserAddresses();
  }, [navigate]);

  const handleAddressSelect = (addrId) => {
    setSelectedAddressId(addrId);
    if (addrId === "new") {
      setFormData({
        fullName: user?.name || "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
      });
    } else {
      const selected = savedAddresses.find((a) => a._id === addrId);
      if (selected) {
        setFormData({
          fullName: selected.fullName,
          phone: selected.phone,
          addressLine1: selected.addressLine1,
          addressLine2: selected.addressLine2 || "",
          city: selected.city,
          state: selected.state,
          postalCode: selected.postalCode,
          country: selected.country || "India",
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.addressLine1.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.postalCode.trim()
    ) {
      setError("Please fill in all required shipping address fields.");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty. Please add items before checking out.");
      return;
    }

    try {
      setSubmitting(true);
      const formattedItems = items.map((item) => ({
        product: item.product?._id || item.productId,
        name: item.product?.name || item.name,
        image:
          item.product?.images?.[0] ||
          item.product?.image ||
          item.image ||
          "",
        price: item.product?.price || item.price,
        quantity: item.quantity,
      }));

      const payload = {
        items: formattedItems,
        shippingAddress: formData,
        paymentMethod,
      };

      const res = await createOrder(payload);

      if (res.success && res.order) {
        setOrderSuccess(res.order);
        await clearCart();
      } else {
        setError(res.message || "Failed to place order. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while placing your order."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAddresses) {
    return (
      <div className="page-container" style={{ minHeight: "65vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader text="Verifying shipping details..." />
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="page-container" style={{ padding: "60px 20px" }}>
        <div
          className="auth-card"
          style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}
        >
          <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🎉</div>
          <h2 style={{ fontSize: "2rem", marginBottom: "10px" }}>
            Order Placed Successfully!
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
            Thank you for your purchase. Your order ID is:
          </p>

          <div
            style={{
              background: "rgba(10, 14, 23, 0.7)",
              padding: "12px 20px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              fontFamily: "monospace",
              fontSize: "1.1rem",
              color: "var(--primary)",
              marginBottom: "24px",
              display: "inline-block",
            }}
          >
            #{orderSuccess._id}
          </div>

          <div
            style={{
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              borderRadius: "var(--radius-md)",
              padding: "20px",
              marginBottom: "28px",
              textAlign: "left",
            }}
          >
            <h4 style={{ marginBottom: "12px", color: "var(--text-primary)" }}>
              Order Summary
            </h4>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.95rem" }}>
              <span>Total Amount Paid:</span>
              <strong style={{ color: "var(--success)" }}>${orderSuccess.total?.toFixed(2)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.95rem" }}>
              <span>Payment Method:</span>
              <span>{orderSuccess.paymentMethod}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
              <span>Deliver To:</span>
              <span>{orderSuccess.shippingAddress?.city}, {orderSuccess.shippingAddress?.state}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "14px" }}>
            <Link to="/orders" className="btn btn-primary" style={{ flex: 1 }}>
              View Order History →
            </Link>
            <Link to="/products" className="btn btn-secondary" style={{ flex: 1 }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page-container" style={{ padding: "80px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🛍️</div>
        <h2>Your Cart is Empty</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px", marginBottom: "24px" }}>
          You need at least one item in your cart to proceed to checkout.
        </p>
        <Link to="/products" className="btn btn-primary btn-lg">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 className="page-title" style={{ fontSize: "2.2rem", marginBottom: "8px" }}>
            💳 Checkout
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Select your delivery address and preferred payment method.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "24px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 380px",
              gap: "32px",
              alignItems: "start",
            }}
          >
            {/* Left Column: Address & Payment */}
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {/* Shipping Address Selector & Form */}
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "28px",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    📍 Delivery Shipping Address
                  </h3>
                  <Link to="/profile" className="btn-link" style={{ fontSize: "0.85rem", color: "var(--primary)" }}>
                    + Manage Addresses in Profile
                  </Link>
                </div>

                {/* Saved Address Chooser Cards */}
                {savedAddresses.length > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "12px", display: "block" }}>
                      Select from your saved addresses:
                    </label>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {savedAddresses.map((addr) => (
                        <label
                          key={addr._id}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "14px",
                            padding: "16px",
                            borderRadius: "var(--radius-sm)",
                            border: `1px solid ${selectedAddressId === addr._id ? "var(--primary)" : "var(--border-color)"}`,
                            background: selectedAddressId === addr._id ? "rgba(99, 102, 241, 0.12)" : "rgba(10, 14, 23, 0.4)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <input
                            type="radio"
                            name="addressSelection"
                            value={addr._id}
                            checked={selectedAddressId === addr._id}
                            onChange={() => handleAddressSelect(addr._id)}
                            style={{ marginTop: "4px", accentColor: "var(--primary)", width: "auto" }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                              <strong style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>
                                {addr.fullName} ({addr.phone})
                              </strong>
                              {addr.isDefault && (
                                <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: "99px", background: "rgba(99, 102, 241, 0.25)", color: "#c7d2fe", fontWeight: "700" }}>
                                  DEFAULT
                                </span>
                              )}
                            </div>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: "1.4" }}>
                              {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city}, {addr.state} - {addr.postalCode}, {addr.country}
                            </p>
                          </div>
                        </label>
                      ))}

                      {/* Radio option for adding a new custom address */}
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          padding: "14px 16px",
                          borderRadius: "var(--radius-sm)",
                          border: `1px dashed ${selectedAddressId === "new" ? "var(--primary)" : "var(--border-color)"}`,
                          background: selectedAddressId === "new" ? "rgba(99, 102, 241, 0.08)" : "rgba(10, 14, 23, 0.2)",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="addressSelection"
                          value="new"
                          checked={selectedAddressId === "new"}
                          onChange={() => handleAddressSelect("new")}
                          style={{ accentColor: "var(--primary)", width: "auto" }}
                        />
                        <strong style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>
                          + Use a Different / New Address
                        </strong>
                      </label>
                    </div>
                  </div>
                )}

                {/* Address Form Inputs */}
                {(savedAddresses.length === 0 || selectedAddressId === "new") && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
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
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <label>Address Line 1 *</label>
                      <input
                        type="text"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleChange}
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
                        onChange={handleChange}
                        placeholder="Landmark, suite, floor, etc."
                      />
                    </div>

                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
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
                        onChange={handleChange}
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
                        onChange={handleChange}
                        placeholder="560001"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "28px",
                  backdropFilter: "blur(12px)",
                }}
              >
                <h3 style={{ fontSize: "1.25rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  💵 Payment Method
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { id: "COD", title: "Cash on Delivery (COD)", desc: "Pay with cash when your package arrives." },
                    { id: "STRIPE", title: "Credit / Debit Card (Stripe)", desc: "Fast & secure card checkout." },
                    { id: "PAYPAL", title: "PayPal Wallet", desc: "Pay safely via your PayPal account." },
                  ].map((method) => (
                    <label
                      key={method.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "14px",
                        padding: "16px",
                        borderRadius: "var(--radius-sm)",
                        border: `1px solid ${paymentMethod === method.id ? "var(--primary)" : "var(--border-color)"}`,
                        background: paymentMethod === method.id ? "rgba(99, 102, 241, 0.1)" : "rgba(10, 14, 23, 0.4)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        style={{ marginTop: "4px", accentColor: "var(--primary)", width: "auto" }}
                      />
                      <div>
                        <strong style={{ color: "var(--text-primary)", display: "block", fontSize: "0.95rem" }}>
                          {method.title}
                        </strong>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                          {method.desc}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Place Order */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "24px",
                position: "sticky",
                top: "100px",
                backdropFilter: "blur(12px)",
              }}
            >
              <h3 style={{ fontSize: "1.2rem", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid var(--border-color)" }}>
                Order Summary ({items.length} items)
              </h3>

              {/* Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "240px", overflowY: "auto", marginBottom: "20px", paddingRight: "4px" }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img
                      src={item.product?.images?.[0] || item.product?.image || PLACEHOLDER_IMAGE}
                      alt={item.product?.name || "Product"}
                      style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "6px" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h5 style={{ fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.product?.name || item.name}
                      </h5>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Qty: {item.quantity} × ${item.product?.price || item.price}
                      </span>
                    </div>
                    <strong style={{ fontSize: "0.9rem" }}>
                      ${((item.product?.price || item.price) * item.quantity).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "16px", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  <span>GST (18%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? <strong style={{ color: "var(--success)" }}>FREE</strong> : `$${shippingCost.toFixed(2)}`}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", color: "#fff", fontSize: "1.15rem", fontWeight: "700", borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "4px" }}>
                  <span>Total</span>
                  <span style={{ color: "var(--primary)" }}>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: "100%", padding: "14px", fontSize: "1.05rem" }}
              >
                {submitting ? <Loader text="Processing..." /> : "Place Order Now →"}
              </button>

              <Link
                to="/cart"
                className="btn btn-secondary"
                style={{ width: "100%", marginTop: "10px", padding: "10px" }}
              >
                ← Back to Cart
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
