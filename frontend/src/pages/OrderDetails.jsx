import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById, updateOrderToPaid } from "../api/orderApi";
import Loader from "../components/common/Loader";

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' fill='%2364748b' font-size='30' dominant-baseline='middle' text-anchor='middle'%3E🛍️%3C/text%3E%3C/svg%3E";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getOrderById(id);
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        setError(res.message || "Order not found");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch order details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handlePayNow = async () => {
    try {
      setPaying(true);
      const res = await updateOrderToPaid(id, { status: "COMPLETED" });
      if (res.success) {
        await fetchOrder();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to process payment");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ minHeight: "65vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader text="Loading order details..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-container" style={{ padding: "60px 20px", textAlign: "center" }}>
        <div className="auth-card" style={{ maxWidth: "520px", margin: "0 auto" }}>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>⚠️</div>
          <h2>Order Not Found</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px", marginBottom: "24px" }}>
            {error || "We couldn't locate the order you're looking for."}
          </p>
          <Link to="/orders" className="btn btn-primary">
            ← Back to Order History
          </Link>
        </div>
      </div>
    );
  }

  const orderStatuses = ["processing", "confirmed", "shipped", "delivered"];
  const currentStatusIndex = orderStatuses.indexOf((order.orderStatus || "processing").toLowerCase());
  const isCancelled = order.orderStatus?.toLowerCase() === "cancelled";

  const getStatusBadge = (status) => {
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

  const badge = getStatusBadge(order.orderStatus);
  const payBadge = getPaymentBadge(order.paymentStatus);

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="page-container" style={{ padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: "1020px", margin: "0 auto" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "24px" }}>
          <Link to="/orders" className="btn btn-secondary btn-sm">
            ← Back to Order History
          </Link>
        </div>

        {/* Top Header Card */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "32px",
            marginBottom: "32px",
            backdropFilter: "blur(16px)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <div>
              <h1 style={{ fontSize: "2.1rem", marginBottom: "6px" }}>Order Details</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                Order ID: <code style={{ color: "var(--primary)", fontFamily: "monospace", fontSize: "1.05rem", fontWeight: "700" }}>#{order._id}</code> • Placed on {formattedDate}
              </p>
            </div>

            {/* Dual Status Box */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                background: "rgba(10, 14, 23, 0.5)",
                padding: "10px 20px",
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
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    background: badge.bg,
                    color: badge.color,
                    border: `1px solid ${badge.border}`,
                  }}
                >
                  {badge.label}
                </span>
              </div>

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

          {/* Action Button if Payment Pending */}
          {order.paymentStatus === "pending" && order.paymentMethod !== "COD" && !isCancelled && (
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={handlePayNow} disabled={paying} className="btn btn-primary" style={{ padding: "12px 24px" }}>
                {paying ? "Processing..." : "Complete Payment Now 💳"}
              </button>
            </div>
          )}

          {/* Progress / Timeline Steps */}
          {!isCancelled && (
            <div style={{ marginTop: "28px", paddingTop: "24px", borderTop: "1px solid var(--border-color)" }}>
              <h4 style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginBottom: "20px" }}>Fulfillment Progress</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", textAlign: "center" }}>
                {orderStatuses.map((step, idx) => {
                  const isCompleted = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;
                  return (
                    <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          background: isCompleted ? "var(--primary)" : "rgba(255, 255, 255, 0.05)",
                          color: isCompleted ? "#ffffff" : "var(--text-muted)",
                          border: `2px solid ${isCurrent ? "var(--primary)" : isCompleted ? "var(--primary)" : "var(--border-color)"}`,
                          boxShadow: isCurrent ? "0 0 16px var(--primary-glow)" : "none",
                        }}
                      >
                        {isCompleted ? "✓" : idx + 1}
                      </div>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: isCompleted ? "600" : "400",
                          color: isCompleted ? "var(--text-primary)" : "var(--text-muted)",
                          textTransform: "capitalize",
                        }}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Content Layout Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "28px", alignItems: "start" }}>
          {/* Left Column: Items & Shipping */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Items Card */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                padding: "28px",
                backdropFilter: "blur(16px)",
              }}
            >
              <h3 style={{ fontSize: "1.2rem", marginBottom: "20px", paddingBottom: "14px", borderBottom: "1px solid var(--border-color)" }}>
                🛍️ Ordered Items ({order.items.length})
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {order.items.map((item, idx) => {
                  const productId = item.product?._id || item.product;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "18px",
                        padding: "14px 18px",
                        borderRadius: "var(--radius-md)",
                        background: "rgba(10, 14, 23, 0.45)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <img
                        src={item.image || PLACEHOLDER_IMAGE}
                        alt={item.name}
                        style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "10px", border: "1px solid var(--border-color)" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: "1.05rem", marginBottom: "4px" }}>
                          {productId ? (
                            <Link to={`/products/${productId}`} style={{ color: "var(--text-primary)" }}>
                              {item.name}
                            </Link>
                          ) : (
                            item.name
                          )}
                        </h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          <span style={{ background: "rgba(255, 255, 255, 0.06)", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            Qty: {item.quantity}
                          </span>
                          <span>× ${item.price?.toFixed(2)}</span>
                        </div>
                      </div>
                      <strong style={{ fontSize: "1.15rem", color: "#ffffff", fontFamily: "var(--font-heading)" }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Address Card */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                padding: "28px",
                backdropFilter: "blur(16px)",
              }}
            >
              <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", paddingBottom: "14px", borderBottom: "1px solid var(--border-color)" }}>
                📍 Delivery Address
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                <strong style={{ color: "var(--text-primary)", fontSize: "1.1rem" }}>
                  {order.shippingAddress?.fullName}
                </strong>
                <span>📞 Phone: {order.shippingAddress?.phone}</span>
                <span>
                  🏢 {order.shippingAddress?.addressLine1}
                  {order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
                </span>
                <span>
                  🏙️ {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                </span>
                <span>🌐 {order.shippingAddress?.country}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Payment & Price Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Payment Info Card */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                padding: "24px",
                backdropFilter: "blur(16px)",
              }}
            >
              <h3 style={{ fontSize: "1.15rem", marginBottom: "16px", paddingBottom: "14px", borderBottom: "1px solid var(--border-color)" }}>
                💳 Payment Details
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.92rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Method:</span>
                  <strong style={{ color: "var(--text-primary)", background: "rgba(255, 255, 255, 0.08)", padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>{order.paymentMethod}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Status:</span>
                  <span
                    style={{
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

                {order.paidAt && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                    <span>Paid Date:</span>
                    <span>{new Date(order.paidAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Summary Card */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                padding: "24px",
                backdropFilter: "blur(16px)",
              }}
            >
              <h3 style={{ fontSize: "1.15rem", marginBottom: "16px", paddingBottom: "14px", borderBottom: "1px solid var(--border-color)" }}>
                💵 Order Total Summary
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.92rem", color: "var(--text-secondary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Items Subtotal</span>
                  <span>${order.subtotal?.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Tax (18% GST)</span>
                  <span>${order.tax?.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Shipping Cost</span>
                  <span>{order.shippingCost === 0 ? <strong style={{ color: "var(--success)" }}>FREE</strong> : `$${order.shippingCost?.toFixed(2)}`}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    color: "#ffffff",
                    fontSize: "1.25rem",
                    fontWeight: "700",
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: "14px",
                    marginTop: "6px",
                  }}
                >
                  <span>Grand Total</span>
                  <span style={{ color: "var(--primary)", fontSize: "1.4rem", fontFamily: "var(--font-heading)" }}>${order.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
