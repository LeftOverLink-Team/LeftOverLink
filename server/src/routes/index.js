const authRoutes = require("../modules/auth/auth.routes");
const foodRoutes = require("../modules/food/food.routes");
const locationRoutes = require("../modules/location/location.routes");
const analyticsRoutes = require("../modules/analytics/analytics.routes");
const chatRoutes = require("../modules/chat/chat.routes");
const orderRoutes = require("../modules/order/order.routes");
const walletRoutes = require("../modules/wallet/wallet.routes");
const notificationsRoutes = require("../modules/notifications/notifications.routes");
const organisationRoutes = require("../modules/organisation/organisation.routes");

const { authRateLimiter } = require("../middleware/rateLimiter");

const registerRoutes = (app) => {
  app.use("/api/auth", authRateLimiter, authRoutes);
  app.use("/api/food", foodRoutes);
  app.use("/api/location", locationRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/wallet", walletRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/organisations", organisationRoutes);

  // Placeholder modules for future expansion:
  // app.use("/api/pickups", pickupRoutes);
  // app.use("/api/wallet", walletRoutes);
  // app.use("/api/admin", adminRoutes);
};

module.exports = {
  registerRoutes,
};

