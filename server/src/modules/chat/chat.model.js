const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    orderId: {
      type: String, // Keeping as string to match existing dummy IDs from the frontend history until fully converted to ObjectIds
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["provider", "receiver"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// We keep both explicit timestamp (for the existing sync model interface) and Mongoose true timestamps
const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
