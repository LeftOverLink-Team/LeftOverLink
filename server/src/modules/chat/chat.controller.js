const { z } = require("zod");
const chatService = require("./chat.service");

const sendMessageSchema = z.object({
  senderId: z.string().min(1),
  senderRole: z.enum(["provider", "receiver"]),
  text: z.string().min(1),
  timestamp: z.number().int().optional(),
});

const unreadSchema = z.object({
  orderIds: z.array(z.string()),
});

const getMessagesHandler = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const messages = await chatService.getMessagesForOrder(orderId);
    return res.json(messages);
  } catch (err) {
    return next(err);
  }
};

const sendMessageHandler = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const parsed = sendMessageSchema.parse(req.body);

    const newMsg = await chatService.saveMessage({
      orderId,
      senderId: parsed.senderId,
      senderRole: parsed.senderRole,
      text: parsed.text,
      timestamp: parsed.timestamp ? new Date(parsed.timestamp) : new Date(),
    });

    return res.status(201).json(newMsg);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors,
      });
    }
    return next(err);
  }
};

const checkUnreadStatusHandler = async (req, res, next) => {
  try {
    const { orderIds } = unreadSchema.parse(req.body);
    const userId = req.user.id || req.user._id;
    const hasUnread = await chatService.checkUnreadForOrders(orderIds, userId);
    return res.json({ hasUnread });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: err.errors });
    }
    return next(err);
  }
};

const markReadHandler = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.id || req.user._id;
    await chatService.markMessagesAsRead(orderId, userId);
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getMessagesHandler,
  sendMessageHandler,
  checkUnreadStatusHandler,
  markReadHandler,
};
