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
      if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1") || origin.startsWith("http://10.")) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });
};

module.exports = {
  buildCorsMiddleware,
};

