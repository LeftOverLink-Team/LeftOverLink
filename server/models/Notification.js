const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "recipientModel",
        },
        recipientModel: {
            type: String,
            required: true,
            enum: ["User", "Organisation"],
        },
        type: {
            type: String,
            required: true,
            enum: ["food_alert", "pickup", "system", "nearby"],
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        foodRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Food",
        },
        read: {
            type: Boolean,
            default: false,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Index for performance
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
