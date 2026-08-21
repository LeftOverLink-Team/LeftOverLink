const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { httpLogger } = require("./config/logger");
const { buildCorsMiddleware } = require("./config/cors");
const { apiRateLimiter } = require("./middleware/rateLimiter");
const { errorHandler } = require("./middleware/errorHandler");
const { registerRoutes } = require("./routes");

const createApp = () => {
  const app = express();

  // Security & parsing
  app.use(helmet());
  app.use(buildCorsMiddleware());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

  // Logging & rate limiting
  app.use(httpLogger);
  app.use("/api", apiRateLimiter);

  // Routes
  registerRoutes(app);

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Central error handler
  app.use(errorHandler);

  return app;
};

module.exports = {
  createApp,
};

