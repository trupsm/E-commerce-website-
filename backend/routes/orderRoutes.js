const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrderToPaid,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Require authentication for all order endpoints
router.use(authMiddleware);

// Customer endpoints
router.post("/", createOrder);
router.get("/myorders", getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/pay", updateOrderToPaid);

// Admin-only endpoints
router.get("/", roleMiddleware("admin"), getAllOrders);
router.put("/:id/status", roleMiddleware("admin"), updateOrderStatus);

module.exports = router;
