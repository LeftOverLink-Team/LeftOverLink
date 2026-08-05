const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from the server directory by default
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const getEnv = (key, defaultValue, options = {}) => {
  const value = process.env[key];
  if (value === undefined || value === "") {
    if (options.required) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return defaultValue;
  }
  return value;
};

const config = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: Number(getEnv("PORT", "5001")),
  mongoUri: getEnv("MONGO_URI", "", { required: true }),
  jwt: {
    accessTokenSecret: getEnv("JWT_SECRET", "", { required: true }),
    accessTokenTtl: getEnv("JWT_ACCESS_TTL", "15m"),
    refreshTokenSecret: getEnv("JWT_REFRESH_SECRET", getEnv("JWT_SECRET", "", { required: true })),
    refreshTokenTtl: getEnv("JWT_REFRESH_TTL", "7d"),
  },
  cors: {
    allowedOrigins: (getEnv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173") || "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
  },
};

module.exports = {
  config,
};

