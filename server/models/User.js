const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["provider", "receiver"], required: true },
    // Wallet
    wallet: { type: Number, default: 0 },
    walletPoints: { type: Number, default: 100 },
    walletBalance: { type: Number, default: 2 },
    // Location/notification settings
    settings: {
      lat: { type: Number, default: 17.3850 },
      lng: { type: Number, default: 78.4867 },
      address: { type: String, default: "" },
      maxDistance: { type: Number, default: 10 },
      notificationsEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
