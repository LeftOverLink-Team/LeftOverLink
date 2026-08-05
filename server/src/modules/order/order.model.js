const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    foodPostId: { type: String, required: true },
    providerId: { type: String, required: true },
    providerName: { type: String, default: "" },
    receiverId: { type: String, required: true },
    receiverName: { type: String, default: "" },
    numberOfMeals: { type: Number, required: true, default: 1 },
    totalPrice: { type: Number, required: true, default: 0 },
    foodType: { type: String, default: "Food" },
    distance: { type: Number, default: 0 },
    expectedTime: { type: String, default: "" },
    paymentMethod: {
      type: String,
      enum: ["pending", "upi", "debit-card", "credit-card", "net-banking", "cod"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    requestStatus: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    requestExpiry: { type: Date },
    pickupTime: { type: Date },
    estimatedDeliveryTime: { type: String, default: "" },
    confirmed: { type: Boolean, default: false },
    receiverLocation: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

orderSchema.index({ receiverId: 1 });
orderSchema.index({ providerId: 1 });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
