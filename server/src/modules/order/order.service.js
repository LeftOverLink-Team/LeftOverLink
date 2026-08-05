const Order = require("./order.model");

/**
 * Create a new pickup request (receiver submits request for food)
 */
const createOrder = async (data) => {
  const order = await Order.create(data);
  return formatOrder(order);
};

/**
 * Get all orders for a receiver
 */
const getOrdersByReceiver = async (receiverId) => {
  const orders = await Order.find({ receiverId }).sort({ createdAt: -1 });
  return orders.map(formatOrder);
};

/**
 * Get all incoming orders for a provider (across all their food posts)
 */
const getOrdersByProvider = async (providerId) => {
  const orders = await Order.find({ providerId }).sort({ createdAt: -1 });
  return orders.map(formatOrder);
};

/**
 * Provider updates request status (accepted / declined)
 */
const updateOrderStatus = async (id, updates) => {
  const allowed = {};
  if (updates.requestStatus) allowed.requestStatus = updates.requestStatus;
  if (updates.estimatedDeliveryTime !== undefined) allowed.estimatedDeliveryTime = updates.estimatedDeliveryTime;

  const order = await Order.findByIdAndUpdate(
    id,
    { $set: allowed },
    { new: true }
  );
  if (!order) throw Object.assign(new Error("Order not found"), { status: 404 });
  return formatOrder(order);
};

/**
 * Receiver completes payment for an accepted order
 */
const updateOrderPayment = async (id, { paymentMethod, paymentStatus, pickupTime }) => {
  const order = await Order.findByIdAndUpdate(
    id,
    { paymentMethod, paymentStatus, pickupTime: pickupTime || new Date(), confirmed: true },
    { new: true }
  );
  if (!order) throw Object.assign(new Error("Order not found"), { status: 404 });
  return formatOrder(order);
};

/**
 * Format a Mongoose Order document as a plain object compatible with frontend pickupHistory shape
 */
const formatOrder = (order) => ({
  id: order._id.toString(),
  foodPostId: order.foodPostId,
  providerId: order.providerId,
  providerName: order.providerName,
  receiverId: order.receiverId,
  receiverName: order.receiverName,
  numberOfMeals: order.numberOfMeals,
  totalPrice: order.totalPrice,
  foodType: order.foodType,
  distance: order.distance,
  expectedTime: order.expectedTime,
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  requestStatus: order.requestStatus,
  requestExpiry: order.requestExpiry ? new Date(order.requestExpiry).getTime() : null,
  pickupTime: order.pickupTime ? new Date(order.pickupTime).toISOString() : null,
  confirmed: order.confirmed,
  receiverLocation: order.receiverLocation,
  createdAt: order.createdAt,
});

const findOrderById = async (id) => {
  return Order.findById(id);
};

const deleteOrder = async (id) => {
  return Order.findByIdAndDelete(id);
};

module.exports = {
  createOrder,
  getOrdersByReceiver,
  getOrdersByProvider,
  updateOrderStatus,
  updateOrderPayment,
  findOrderById,
  deleteOrder,
};
