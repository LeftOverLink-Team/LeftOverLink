const cors = require("cors");
const { config } = require("./env");

const buildCorsMiddleware = () => {
  const { allowedOrigins } = config.cors;

  return cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, "");

      const isAllowed =
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin === "https://left-over-link-three.vercel.app" ||
        normalizedOrigin.startsWith("http://localhost") ||
        normalizedOrigin.startsWith("http://127.0.0.1") ||
        normalizedOrigin.startsWith("http://10.");

      if (isAllowed) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    optionsSuccessStatus: 200,
  });
};

module.exports = {
  buildCorsMiddleware,
};
