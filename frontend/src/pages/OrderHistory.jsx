import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders, updateOrderToPaid } from "../api/orderApi";
import Loader from "../components/common/Loader";

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' fill='%2364748b' font-size='30' dominant-baseline='middle' text-anchor='middle'%3E🛍️%3C/text%3E%3C/svg%3E";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingOrderId, setPayingOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyOrders();
      if (res.success && res.orders) {
        setOrders(res.orders);
      } else {
        setError(res.message || "Failed to load order history");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error retrieving order history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePayNow = async (orderId) => {
    try {
      setPayingOrderId(orderId);
      const res = await updateOrderToPaid(orderId, { status: "COMPLETED" });
      if (res.success) {
        await fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to process payment update");
    } finally {
      setPayingOrderId(null);
    }
  };

  const getOrderStatusBadge = (status) => {
    const s = (status || "processing").toLowerCase();
    switch (s) {
      case "delivered":
        return { bg: "rgba(16, 185, 129, 0.12)", color: "#34d399", border: "rgba(16, 185, 129, 0.3)", label: "Delivered ✅" };
      case "shipped":
        return { bg: "rgba(99, 102, 241, 0.12)", color: "#818cf8", border: "rgba(99, 102, 241, 0.3)", label: "Shipped 🚚" };
      case "confirmed":
        return { bg: "rgba(59, 130, 246, 0.12)", color: "#60a5fa", border: "rgba(59, 130, 246, 0.3)", label: "Confirmed 👍" };
      case "cancelled":
        return { bg: "rgba(239, 68, 68, 0.12)", color: "#fca5a5", border: "rgba(239, 68, 68, 0.3)", label: "Cancelled ❌" };
      default:
        return { bg: "rgba(245, 158, 11, 0.12)", color: "#fbbf24", border: "rgba(245, 158, 11, 0.3)", label: "Processing ⏳" };
    }
  };

  const getPaymentBadge = (status) => {
    const p = (status || "pending").toLowerCase();
    if (p === "paid") {
      return { bg: "rgba(16, 185, 129, 0.12)", color: "#34d399", border: "rgba(16, 185, 129, 0.3)", label: "PAID ✅" };
    }
    return { bg: "rgba(245, 158, 11, 0.12)", color: "#fbbf24", border: "rgba(245, 158, 11, 0.3)", label: "PENDING ⏳" };
  };

  if (loading) {
    return (
      <div className="page-container" style={{ minHeight: "65vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader text="Loading your order history..." />
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: "1020px", margin: "0 auto" }}>
        {/* Header Section */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "36px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.2px", color: "var(--accent)" }}>
              Account Activity
            </span>
            <h1 className="page-title" style={{ fontSize: "2.3rem", marginTop: "4px" }}>
              📦 Order History
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
              Track shipments, review past receipts, and manage order details.
            </p>
          </div>
          <Link to="/products" className="btn btn-secondary btn-sm" style={{ padding: "10px 20px" }}>
            ← Continue Shopping
          </Link>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "24px" }}>
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div
            className="auth-card"
            style={{ maxWidth: "560px", margin: "40px auto", textAlign: "center", padding: "52px 36px" }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>📦</div>
            <h2 style={{ fontSize: "1.6rem", marginBottom: "8px" }}>No Orders Placed Yet</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px", lineHeight: "1.6" }}>
              When you purchase products, your complete order history, status updates, and receipts will appear right here.
            </p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Explore Products Now →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {orders.map((order) => {
              const orderBadge = getOrderStatusBadge(order.orderStatus);
              const payBadge = getPaymentBadge(order.paymentStatus);
              const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={order._id}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-lg)",
                    padding: "28px",
                    backdropFilter: "blur(16px)",
                    boxShadow: "var(--shadow-card)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "22px",
                    transition: "border-color 0.2s ease, transform 0.2s ease",
                  }}
                >
                  {/* Top Bar Header */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      paddingBottom: "18px",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>Order ID:</span>
                        <code style={{ fontFamily: "monospace", color: "var(--primary)", fontSize: "1.05rem", fontWeight: "700" }}>
                          #{order._id}
                        </code>
                      </div>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                        📅 Placed on {orderDate}
                      </span>
                    </div>

                    {/* Right Side Dual Status Box */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        background: "rgba(10, 14, 23, 0.5)",
                        padding: "10px 18px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      {/* Order Status */}
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: "700", marginBottom: "4px" }}>
                          Order Status
                        </div>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            background: orderBadge.bg,
                            color: orderBadge.color,
                            border: `1px solid ${orderBadge.border}`,
                          }}
                        >
                          {orderBadge.label}
                        </span>
                      </div>

                      {/* Divider line */}
                      <div style={{ width: "1px", height: "30px", background: "var(--border-color)" }} />

                      {/* Payment Status */}
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: "700", marginBottom: "4px" }}>
                          Payment Status
                        </div>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.78rem",
                            fontWeight: "700",
                            background: payBadge.bg,
                            color: payBadge.color,
                            border: `1px solid ${payBadge.border}`,
                          }}
                        >
                          {payBadge.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "18px",
                          background: "rgba(10, 14, 23, 0.45)",
                          padding: "14px 18px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-color)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <img
                          src={item.image || PLACEHOLDER_IMAGE}
                          alt={item.name}
                          style={{
                            width: "56px",
                            height: "56px",
                            objectFit: "cover",
                            borderRadius: "10px",
                            border: "1px solid var(--border-color)",
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4
                            style={{
                              fontSize: "1rem",
                              color: "var(--text-primary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              marginBottom: "4px",
                            }}
                          >
                            {item.name}
                          </h4>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            <span style={{ background: "rgba(255, 255, 255, 0.06)", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                              Qty: {item.quantity}
                            </span>
                            <span>× ${item.price?.toFixed(2)}</span>
                          </div>
                        </div>
                        <strong style={{ fontSize: "1.1rem", color: "#ffffff", fontFamily: "var(--font-heading)" }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </strong>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Footer Row: Address & Totals */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "20px",
                      paddingTop: "18px",
                      borderTop: "1px solid var(--border-color)",
                    }}
                  >
                    {/* Delivery Address Card */}
                    <div
                      style={{
                        background: "rgba(10, 14, 23, 0.4)",
                        padding: "12px 18px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-color)",
                        flex: 1,
                        minWidth: "280px",
                      }}
                    >
                      <div style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--accent)", marginBottom: "4px" }}>
                        📍 Delivery Address
                      </div>
                      <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                        <strong style={{ color: "var(--text-primary)" }}>{order.shippingAddress?.fullName}</strong> ({order.shippingAddress?.phone})<br />
                        {order.shippingAddress?.addressLine1}
                        {order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                      </div>
                    </div>

                    {/* Right Side: Total & Primary Actions */}
                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
                      <div style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                        Payment Method: <strong style={{ color: "var(--text-primary)", background: "rgba(255, 255, 255, 0.08)", padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>{order.paymentMethod}</strong>
                      </div>

                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                        <span style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>Grand Total:</span>
                        <span style={{ fontSize: "1.5rem", fontWeight: "700", color: "#ffffff", fontFamily: "var(--font-heading)" }}>
                          ${order.total?.toFixed(2)}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                        <Link to={`/orders/${order._id}`} className="btn btn-primary btn-sm" style={{ padding: "10px 20px" }}>
                          View Details →
                        </Link>

                        {order.paymentStatus === "pending" && order.paymentMethod !== "COD" && (
                          <button
                            onClick={() => handlePayNow(order._id)}
                            disabled={payingOrderId === order._id}
                            className="btn btn-secondary btn-sm"
                            style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", borderColor: "rgba(16, 185, 129, 0.4)" }}
                          >
                            {payingOrderId === order._id ? "Processing..." : "Pay Now 💳"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
