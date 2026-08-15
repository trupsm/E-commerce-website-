const express = require("express");

const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    mergeGuestCart
} = require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
// All Cart Routes Require Authentication
router.use(authMiddleware);

// Get cart
router.get("/", getCart);

// Add item
router.post("/", addToCart);

// Merge guest cart
router.post("/merge", mergeGuestCart);

// Clear cart
router.delete("/", clearCart);

// Update item
router.put("/:productId", updateCartItem);

// Remove item
router.delete("/:productId", removeFromCart);

module.exports = router;