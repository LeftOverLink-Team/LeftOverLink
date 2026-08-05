// Centralized error handler to ensure consistent error responses
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);

  const status = err.status || 500;
  const message =
    err.message || "Something went wrong. Please try again later.";

  res.status(status).json({
    success: false,
    error: {
      message,
    },
  });
};

module.exports = {
  errorHandler,
};

