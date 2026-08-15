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

// Customer endpoints
router.post("/", authMiddleware, createOrder);
router.get("/myorders", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/pay", authMiddleware, updateOrderToPaid);

// Admin-only endpoints
router.get("/", authMiddleware, roleMiddleware("admin"), getAllOrders);
router.put("/:id/status", authMiddleware, roleMiddleware("admin"), updateOrderStatus);

module.exports = router;
