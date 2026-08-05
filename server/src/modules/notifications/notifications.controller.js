const Order = require("../order/order.model");
const Notification = require("../../../models/Notification");

/**
 * GET /api/notifications
 * Generates real notifications from the user's order history
 * and fetches persistent alerts (like nearby food posts).
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const notifications = [];

    // 1. Fetch persistent notifications from DB
    const dbNotifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(20);

    for (const dbNotif of dbNotifications) {
      notifications.push({
        id: dbNotif._id,
        type: dbNotif.type, // food_alert, pickup, system, nearby
        title: dbNotif.title,
        message: dbNotif.message,
        time: formatAgo(dbNotif.createdAt),
        read: dbNotif.read,
        actionable: !!dbNotif.foodRef,
        link: dbNotif.type === "food_alert" ? "/directory" : "/receiver", // Basic routing logic
      });
    }

    // 2. Fetch order-based dynamic notifications (legacy support)
    if (role === "receiver") {
      const orders = await Order.find({ receiverId: userId })
        .sort({ createdAt: -1 })
        .limit(20);

      for (const order of orders) {
        const ago = formatAgo(order.createdAt);

        if (order.requestStatus === "accepted") {
          notifications.push({
            id: `acc-${order._id}`,
            type: "pickup",
            title: "Pickup request accepted! 🎉",
            message: `${order.providerName || "A provider"} accepted your request for "${order.foodType || "food"}". Head over to pick it up.`,
            time: ago,
            read: isOlderThan(order.updatedAt || order.createdAt, 2),
            actionable: true,
            link: "/my-orders",
          });
        } else if (order.requestStatus === "declined") {
          notifications.push({
            id: `dec-${order._id}`,
            type: "system",
            title: "Request declined",
            message: `Your request for "${order.foodType || "food"}" from ${order.providerName || "a provider"} was declined. Check for other nearby listings.`,
            time: ago,
            read: isOlderThan(order.createdAt, 1),
            actionable: false,
          });
        } else if (order.requestStatus === "pending") {
          notifications.push({
            id: `pend-${order._id}`,
            type: "nearby",
            title: "Request pending",
            message: `Waiting for ${order.providerName || "the provider"} to respond to your request for "${order.foodType || "food"}".`,
            time: ago,
            read: false,
            actionable: false,
          });
        }

        if (order.paymentStatus === "completed") {
          notifications.push({
            id: `pay-${order._id}`,
            type: "pickup",
            title: "Payment confirmed ✅",
            message: `Your payment of ₹${order.totalPrice || 0} for "${order.foodType || "food"}" was marked complete.`,
            time: ago,
            read: true,
            actionable: false,
          });
        }
      }
    } else if (role === "provider") {
      const orders = await Order.find({ providerId: userId })
        .sort({ createdAt: -1 })
        .limit(20);

      for (const order of orders) {
        const ago = formatAgo(order.createdAt);

        if (order.requestStatus === "pending") {
          notifications.push({
            id: `req-${order._id}`,
            type: "nearby",
            title: "New pickup request! 🙋",
            message: `${order.receiverName || "Someone"} requested "${order.foodType || "your food"}". Act quickly before it expires.`,
            time: ago,
            read: isOlderThan(order.createdAt, 1),
            actionable: true,
            link: "/provider-requests",
          });
        } else if (order.requestStatus === "accepted") {
          notifications.push({
            id: `acc-${order._id}`,
            type: "pickup",
            title: "Request accepted",
            message: `You accepted ${order.receiverName || "a receiver"}'s request for "${order.foodType || "food"}".`,
            time: ago,
            read: isOlderThan(order.createdAt, 3),
            actionable: false,
          });
        }

        if (order.paymentStatus === "completed") {
          notifications.push({
            id: `pay-${order._id}`,
            type: "pickup",
            title: "Payment received 💰",
            message: `${order.receiverName || "A receiver"} paid ₹${order.totalPrice || 0} for "${order.foodType || "food"}". Wallet updated.`,
            time: ago,
            read: isOlderThan(order.updatedAt || order.createdAt, 2),
            actionable: false,
          });
        }
      }
    }

    // Sort: unread first, then newest
    notifications.sort((a, b) => {
      if (!a.read && b.read) return -1;
      if (a.read && !b.read) return 1;
      return 0;
    });

    return res.json({ success: true, data: notifications });
  } catch (err) {
    return next(err);
  }
};

function formatAgo(date) {
  if (!date) return "recently";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function isOlderThan(date, hours) {
  if (!date) return true;
  return Date.now() - new Date(date).getTime() > hours * 3600000;
}

module.exports = { getNotifications };
