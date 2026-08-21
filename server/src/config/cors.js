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

      const isLeftOverLinkVercelPreview =
        /^https:\/\/left-over-link-[a-z0-9-]+-bhavyas-projects-f14007b7\.vercel\.app$/i.test(
          normalizedOrigin,
        );

      const isAllowed =
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin === "https://left-over-link-three.vercel.app" ||
        isLeftOverLinkVercelPreview ||
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