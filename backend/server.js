const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const env = require("./config/env");
const connectDB = require("./config/db");
const errorMiddleware = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const app = express();

// Connect DB 
connectDB();

// Global Middleware
app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(cookieParser());

app.use(
    cors({
        origin: env.frontendUrl,
        credentials: true
    })
);


// Health Check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "E-Commerce API is running"
    });
});

// Routes
app.use("/api/auth", authRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Error Middleware
app.use(errorMiddleware);

// Start Server
app.listen(env.port, () => {
    console.log(
        `Server running on http://localhost:${env.port}`
    );
});