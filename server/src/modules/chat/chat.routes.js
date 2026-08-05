const express = require("express");
const chatController = require("./chat.controller");
const { authenticate } = require("../../middleware/auth");

const router = express.Router();

// Get Messages
router.get("/:orderId", authenticate, chatController.getMessagesHandler);

// Bulk Unread Check
router.post("/unread", authenticate, chatController.checkUnreadStatusHandler);

// Send Message
router.post("/:orderId", authenticate, chatController.sendMessageHandler);

// Mark Order as Read
router.put("/:orderId/read", authenticate, chatController.markReadHandler);

module.exports = router;
