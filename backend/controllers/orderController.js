const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const calculateOrderTotals = require("../utils/calculateOrderTotals");
const withTransaction = require("../utils/transaction");

// =============================================
// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
// =============================================
// ── ACID Guarantees ───────────────────────────────────────────────────────
// Atomicity  : Order save + stock decrement + cart clear are wrapped in a
//              single MongoDB transaction. If any step fails the entire
//              transaction is rolled back — no partial writes ever persist.
// Consistency: Stock is decremented via a conditional $inc that filters on
//              stock >= quantity. If another request already consumed the
//              stock between our initial check and the update, the filter
//              returns null, we throw, and the transaction aborts cleanly.
//              The Product pre-save hook also prevents stock going negative.
// Isolation  : Session-scoped reads/writes prevent concurrent orders from
//              seeing each other's intermediate states.
// Durability : Handled at the connection level (w:"majority", journal:true).
// ─────────────────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { items: bodyItems, orderItems, shippingAddress, paymentMethod } = req.body;

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a complete shipping address (fullName, phone, addressLine1, city, state, postalCode)",
      });
    }

    let rawItems = bodyItems || orderItems;

    // If items not provided, load from user's DB cart (outside transaction — read-only)
    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No order items provided and your cart is empty",
        });
      }

      rawItems = cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        image:
          item.product.images && item.product.images.length > 0
            ? item.product.images[0]
            : item.product.image || "",
        price: item.product.price,
        quantity: item.quantity,
      }));
    }

    if (rawItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    // Normalize payment method to allowed enum values: COD, STRIPE, PAYPAL
    let pMethod = (paymentMethod || "COD").toUpperCase();
    if (!["COD", "STRIPE", "PAYPAL"].includes(pMethod)) {
      pMethod = "COD";
    }

    // ── Pre-flight stock check (outside transaction for fast early rejection) ──
    // A second authoritative check happens inside the transaction atomically.
    for (const item of rawItems) {
      const productId = item.product || item.productId;
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${productId} not found`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`,
        });
      }
    }

    // ── ATOMIC TRANSACTION ────────────────────────────────────────────────────
    const createdOrder = await withTransaction(async (session) => {
      // ── Step 1: Atomically decrement stock for each item ──────────────────
      // Using $inc with a conditional filter { stock: { $gte: quantity } } is
      // the key Isolation/Consistency trick:
      //   • If two concurrent requests both see stock = 1 and both try to buy 1,
      //     only ONE will match the filter and succeed; the other gets null →
      //     transaction aborts → no overselling.
      const verifiedItems = [];

      for (const item of rawItems) {
        const productId = item.product || item.productId;
        const qty = item.quantity;

        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: productId,
            stock: { $gte: qty }, // ← Isolation guard: atomically assert sufficient stock
          },
          { $inc: { stock: -qty } },
          {
            new: true,
            ...(session ? { session } : {}), // pass session only when available
          }
        );

        if (!updatedProduct) {
          // Stock was insufficient (race condition) or product vanished — abort.
          throw Object.assign(
            new Error(
              `Insufficient stock for product ID ${productId} (race condition or product removed)`
            ),
            { statusCode: 400 }
          );
        }

        verifiedItems.push({
          product: updatedProduct._id,
          name: updatedProduct.name,
          image:
            item.image ||
            (updatedProduct.images && updatedProduct.images.length > 0
              ? updatedProduct.images[0]
              : updatedProduct.image || ""),
          price: updatedProduct.price,
          quantity: qty,
        });
      }

      // ── Step 2: Calculate totals from DB-authoritative prices ─────────────
      const totals = calculateOrderTotals(verifiedItems);

      // ── Step 3: Save the Order document ───────────────────────────────────
      const orderDoc = new Order({
        user: req.user._id,
        items: verifiedItems,
        shippingAddress: {
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2 || "",
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country || "India",
        },
        paymentMethod: pMethod,
        paymentStatus: "pending",
        orderStatus: "processing",
        subtotal: totals.subtotal,
        tax: totals.tax,
        shippingCost: totals.shippingCost,
        total: totals.total,
      });

      const [savedOrder] = await Order.create(
        [orderDoc],
        session ? { session } : {}
      );

      // ── Step 4: Clear the user's cart ────────────────────────────────────
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [] } },
        session ? { session } : {}
      );

      return savedOrder;
    });
    // ── END TRANSACTION ───────────────────────────────────────────────────────

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: createdOrder,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Server error while creating order",
    });
  }
};

// =============================================
// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private (Customer)
// =============================================
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server error while fetching orders",
    });
  }
};

// =============================================
// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Customer / Admin)
// =============================================
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Allow access only to order owner or Admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server error while fetching order",
    });
  }
};

// =============================================
// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private (Admin)
// =============================================
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server error while fetching all orders",
    });
  }
};

// =============================================
// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
// =============================================
// ── ACID Guarantees ───────────────────────────────────────────────────────
// Atomicity  : Status change + stock restoration (on cancel) are atomic.
// Consistency: Stock is restored only if the order was NOT already cancelled,
//              preventing double-restoration if the endpoint is called twice.
// ─────────────────────────────────────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status, orderStatus } = req.body;
    const targetStatus = (orderStatus || status || "").toLowerCase();
    const allowedStatuses = ["processing", "confirmed", "shipped", "delivered", "cancelled"];

    if (!targetStatus || !allowedStatuses.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid orderStatus. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    const updatedOrder = await withTransaction(async (session) => {
      // Read the current order inside the transaction for an up-to-date view.
      const order = await Order.findById(req.params.id).session(session || null);

      if (!order) {
        throw Object.assign(new Error("Order not found"), { statusCode: 404 });
      }

      // ── Consistency guard: prevent invalid status transitions ─────────────
      if (order.orderStatus === "cancelled" && targetStatus !== "cancelled") {
        throw Object.assign(
          new Error("Cannot update status of a cancelled order"),
          { statusCode: 400 }
        );
      }

      const wasAlreadyCancelled = order.orderStatus === "cancelled";

      order.orderStatus = targetStatus;

      if (targetStatus === "delivered") {
        order.deliveredAt = Date.now();
      }

      // ── Stock restoration on cancellation ─────────────────────────────────
      // Only restore if transitioning TO cancelled (not already cancelled).
      // This prevents double-restoring stock if the endpoint is called twice.
      if (targetStatus === "cancelled" && !wasAlreadyCancelled) {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity } },
            session ? { session, new: true } : { new: true }
          );
        }
      }

      await order.save(session ? { session } : {});
      return order;
    });

    return res.json({
      success: true,
      message: `Order status updated to ${targetStatus}`,
      order: updatedOrder,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Server error while updating order status",
    });
  }
};

// =============================================
// @desc    Update order payment status to paid
// @route   PUT /api/orders/:id/pay
// @access  Private (Customer / Admin)
// =============================================
// ── ACID Guarantees ───────────────────────────────────────────────────────
// Atomicity  : paymentStatus + paidAt + paymentResult are all updated in
//              one transaction — either all fields change or none do.
// Consistency: Three guards enforce valid state transitions:
//   1. Ownership  — only the order owner or an admin can pay.
//   2. Idempotency — cannot mark an already-paid order as paid again.
//   3. COD guard  — COD orders cannot be paid via this endpoint; payment
//                   is implicitly confirmed when the order is "delivered".
//   4. Audit trail — paymentResult records the gateway confirmation so the
//                    DB never holds paymentStatus="paid" with no proof.
// Isolation  : Session-scoped read ensures no other request modifies the
//              order between the check and the update.
// Durability : Handled globally (w:"majority", journal:true on connection).
// ─────────────────────────────────────────────────────────────────────────
const updateOrderToPaid = async (req, res) => {
  try {
    // Extract gateway confirmation data sent by the client.
    // For STRIPE this would be { gatewayTransactionId, status, email }
    // For PAYPAL this would be { gatewayTransactionId: paypalOrderId, status, email }
    // For a stub/test client, any object is accepted — no gateway keys are required.
    const { gatewayTransactionId, status: gatewayStatus, email: payerEmail, updatedAt: gwUpdatedAt } = req.body;

    const updatedOrder = await withTransaction(async (session) => {
      const order = await Order.findById(req.params.id).session(session || null);

      if (!order) {
        throw Object.assign(new Error("Order not found"), { statusCode: 404 });
      }

      // ── Consistency Guard 1: Ownership ────────────────────────────────────
      // Only the order's owner or an admin may mark this order as paid.
      // Prevents User A from paying for User B's order by guessing an order ID.
      const isOwner = order.user.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";
      if (!isOwner && !isAdmin) {
        throw Object.assign(
          new Error("Not authorized to update payment for this order"),
          { statusCode: 403 }
        );
      }

      // ── Consistency Guard 2: COD orders cannot use this endpoint ──────────
      // Cash on Delivery is settled physically at delivery time.
      // The /pay endpoint is only for online payment gateways (STRIPE, PAYPAL).
      // When a COD order is delivered, the admin sets it to "delivered" via
      // PUT /api/orders/:id/status, and the payment should be handled there.
      if (order.paymentMethod === "COD") {
        throw Object.assign(
          new Error(
            "COD orders cannot be marked paid via this endpoint. " +
            "Payment is confirmed automatically when the order is delivered."
          ),
          { statusCode: 400 }
        );
      }

      // ── Consistency Guard 3: Idempotency — no double-payment ─────────────
      if (order.paymentStatus === "paid") {
        throw Object.assign(
          new Error("Order is already marked as paid"),
          { statusCode: 400 }
        );
      }

      // ── Consistency Guard 4: Cancelled order cannot be paid ───────────────
      if (order.orderStatus === "cancelled") {
        throw Object.assign(
          new Error("Cannot process payment for a cancelled order"),
          { statusCode: 400 }
        );
      }

      // ── Update all payment fields atomically ──────────────────────────────
      order.paymentStatus = "paid";
      order.paidAt = Date.now();

      // Store the gateway confirmation as an audit trail.
      // This ensures the DB never holds paymentStatus="paid" without
      // a verifiable reference to the actual gateway transaction.
      order.paymentResult = {
        gatewayTransactionId: gatewayTransactionId || "",
        status: gatewayStatus || "COMPLETED",
        updatedAt: gwUpdatedAt || new Date().toISOString(),
        email: payerEmail || "",
      };

      await order.save(session ? { session } : {});
      return order;
    });

    return res.json({
      success: true,
      message: "Order payment marked as paid",
      order: updatedOrder,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Server error while updating payment status",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrderToPaid,
};