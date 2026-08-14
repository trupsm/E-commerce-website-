const express = require("express");
const {
    register,
    login,
    getMe,
    logout
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected route
router.get("/me", authMiddleware, getMe);

// Logout
router.post("/logout", logout);
module.exports = router;