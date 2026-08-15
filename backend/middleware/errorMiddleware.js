const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error stack for debugging
  console.error("❌ Error:", err.message);

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    const message = `Resource not found with invalid ID format: ${err.value}`;
    return res.status(400).json({
      success: false,
      message
    });
  }

  // 2. Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const message = `${field ? field.charAt(0).toUpperCase() + field.slice(1) : "Field"} already exists`;
    return res.status(409).json({
      success: false,
      message
    });
  }

  // 3. Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    return res.status(400).json({
      success: false,
      message
    });
  }

  // 4. Default Internal Server Error
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error"
  });
};

module.exports = errorMiddleware;