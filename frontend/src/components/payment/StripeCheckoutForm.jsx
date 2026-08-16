import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const StripeCheckoutForm = ({
  orderId,
  amount,
  currency = "INR",
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId || ""}`,
        },
        redirect: "if_required",
      });

      if (error) {
        if (
          error.type === "card_error" ||
          error.type === "validation_error"
        ) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("An unexpected error occurred. Please try again.");
        }
        if (onError) onError(error);
      } else if (
        paymentIntent &&
        paymentIntent.status === "succeeded"
      ) {
        setIsCompleted(true);
        if (onSuccess) {
          onSuccess(paymentIntent);
        }
      }
    } catch (err) {
      setErrorMessage(
        err?.message || "Failed to process payment. Please try again."
      );
      if (onError) onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: "var(--radius-md)",
          color: "var(--text-primary)",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>✅</div>
        <h3 style={{ color: "var(--success)", marginBottom: "8px" }}>
          Payment Successful!
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Your payment has been processed and your order is confirmed.
        </p>
      </div>
    );
  }

  return (
    <form
      id="payment-form"
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "rgba(18, 24, 38, 0.7)",
          padding: "20px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-color)",
        }}
      >
        <PaymentElement
          id="payment-element"
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {errorMessage && (
        <div
          id="payment-message"
          style={{
            padding: "12px 16px",
            background: "var(--error-bg)",
            border: "1px solid var(--error)",
            borderRadius: "var(--radius-sm)",
            color: "var(--error)",
            fontSize: "0.9rem",
          }}
        >
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="btn btn-primary"
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "1rem",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          cursor:
            isLoading || !stripe || !elements ? "not-allowed" : "pointer",
          opacity: isLoading || !stripe || !elements ? 0.7 : 1,
        }}
      >
        {isLoading ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: "16px",
                height: "16px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Processing Payment...
          </>
        ) : (
          <>
            <span>🔒</span>
            {amount
              ? `Pay ${currency.toUpperCase()} ${amount}`
              : "Pay Now"}
          </>
        )}
      </button>

      <div
        style={{
          textAlign: "center",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        <span>🛡️</span>
        <span>Guaranteed safe & secure checkout powered by Stripe</span>
      </div>
    </form>
  );
};

export default StripeCheckoutForm;
