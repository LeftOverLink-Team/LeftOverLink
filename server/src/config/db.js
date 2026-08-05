const mongoose = require("mongoose");
const { config } = require("./env");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return mongoose.connection;

  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(config.mongoUri, {
      dbName: process.env.MONGO_DB_NAME || undefined,
    });

    isConnected = true;
    console.log("✓ MongoDB connected");
    return mongoose.connection;
  } catch (error) {
    console.error("✗ MongoDB connection error:", error.message);
    // Fail fast in non-development environments
    if (config.nodeEnv !== "development") {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = {
  connectDB,
};

