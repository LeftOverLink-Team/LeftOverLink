const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    expiry: { type: Date, required: true },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      address: { type: String, default: "Unknown Location" },
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      default: "available",
      enum: ["available", "claimed"],
    },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    views: { type: Number, default: 0 },
    interested: { type: Number, default: 0 },
    imageUrl: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Food", foodSchema);
