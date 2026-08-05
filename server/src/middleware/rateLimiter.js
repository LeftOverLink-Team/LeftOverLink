const rateLimit = require("express-rate-limit");
const { config } = require("../config/env");

const isProduction = config.nodeEnv === "production";

// Generic rate limiter for public APIs
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth routes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 20 : 100,
  message: "Too many auth attempts from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiRateLimiter,
  authRateLimiter,
};

