const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("MONGO_URI is not set. Skipping DB connect (development).");
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message || error);
    // don't exit so server can run while we debug
  }
};

module.exports = connectDB;
