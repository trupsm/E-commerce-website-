const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// =========================
// Public Routes
// =========================
router.get("/", getProducts);
router.get("/:id", getProductById);

// =========================
// Admin Routes (Protected + Role)
// =========================
// authMiddleware runs first (Authentication: "Who is the user?")
// roleMiddleware runs second (Authorization: "Is the user an admin?")
router.post("/", authMiddleware, roleMiddleware("admin"), createProduct);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateProduct);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteProduct);

module.exports = router;