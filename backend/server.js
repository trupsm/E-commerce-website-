const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const env = require("./config/env");
const connectDB = require("./config/db");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// Connect to MongoDB
connectDB();

// --------------------
// Global Middleware
// --------------------

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Allow requests from frontend
app.use(
    cors({
        origin: env.frontendUrl,
        credentials: true
    })
);

// --------------------
// Health Check
// --------------------

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "E-Commerce API is running"
    });
});

// --------------------
// 404 Handler
// --------------------

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// --------------------
// Global Error Handler
// --------------------

app.use(errorMiddleware);

// --------------------
// Start Server
// --------------------

app.listen(env.port, () => {
    console.log(
        `Server running on http://localhost:${env.port}`
    );
});