const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const calculateOrderTotals = require("../utils/calculateOrderTotals");

// =============================================
// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
// =============================================
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

    // If items not provided, load from user's DB cart
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

    // Verify stock & fetch accurate prices from DB
    const verifiedItems = [];
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
          message: `Insufficient stock for product "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`,
        });
      }

      verifiedItems.push({
        product: product._id,
        name: product.name,
        image:
          item.image ||
          (product.images && product.images.length > 0
            ? product.images[0]
            : product.image || ""),
        price: product.price,
        quantity: item.quantity,
      });
    }

    // Calculate subtotal, tax, shippingCost, total using calculateOrderTotals
    const totals = calculateOrderTotals(verifiedItems);

    // Normalize payment method to allowed enum values: COD, STRIPE, PAYPAL
    let pMethod = (paymentMethod || "COD").toUpperCase();
    if (!["COD", "STRIPE", "PAYPAL"].includes(pMethod)) {
      pMethod = "COD";
    }

    // Create Order
    const order = new Order({
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

    const createdOrder = await order.save();

    // Deduct product stock in DB
    for (const item of verifiedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user's DB cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } }
    );

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: createdOrder,
    });
  } catch (err) {
    return res.status(500).json({
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

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = targetStatus;

    if (targetStatus === "delivered") {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    return res.json({
      success: true,
      message: `Order status updated to ${targetStatus}`,
      order: updatedOrder,
    });
  } catch (err) {
    return res.status(500).json({
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
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.paymentStatus = "paid";
    order.paidAt = Date.now();

    const updatedOrder = await order.save();

    return res.json({
      success: true,
      message: "Order payment marked as paid",
      order: updatedOrder,
    });
  } catch (err) {
    return res.status(500).json({
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