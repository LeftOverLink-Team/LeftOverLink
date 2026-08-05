const Chat = require("./chat.model");

/**
 * Retrieves all chat messages for a specific order
 * @param {String} orderId
 * @returns {Promise<Array>}
 */
const getMessagesForOrder = async (orderId) => {
  // Sort by timestamp ascending (oldest first) so they stack properly in the chat UI
  const messages = await Chat.find({ orderId }).sort({ timestamp: 1 });
  
  // Map back to the exact format expected by the React frontend (`id`, `orderId`, `senderRole`)
  return messages.map((m) => ({
    id: m._id.toString(),
    orderId: m.orderId,
    senderId: m.senderId,
    senderRole: m.senderRole,
    text: m.text,
    timestamp: m.timestamp.getTime(),
  }));
};

/**
 * Saves a new chat message to the DB
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
const saveMessage = async (data) => {
  const newMsg = new Chat(data);
  await newMsg.save();
  return {
    id: newMsg._id.toString(),
    orderId: newMsg.orderId,
    senderId: newMsg.senderId,
    senderRole: newMsg.senderRole,
    text: newMsg.text,
    isRead: newMsg.isRead,
    timestamp: newMsg.timestamp.getTime(),
  };
};

/**
 * Checks if any unread messages exist for a set of orders
 */
const checkUnreadForOrders = async (orderIds, userId) => {
  const count = await Chat.countDocuments({
    orderId: { $in: orderIds },
    senderId: { $ne: userId },
    isRead: false
  });
  return count > 0;
};

/**
 * Marks messages in an order as read by a user
 */
const markMessagesAsRead = async (orderId, userId) => {
  await Chat.updateMany(
    { orderId, senderId: { $ne: userId }, isRead: false },
    { $set: { isRead: true } }
  );
};

module.exports = {
  getMessagesForOrder,
  saveMessage,
  checkUnreadForOrders,
  markMessagesAsRead,
};
