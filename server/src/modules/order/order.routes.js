const express = require("express");
const { authenticate, requireRole } = require("../../middleware/auth");
const {
  createOrderHandler,
  getMyOrdersHandler,
  getProviderOrdersHandler,
  updateStatusHandler,
  updatePaymentHandler,
  deleteOrderHandler,
} = require("./order.controller");

const router = express.Router();

// Receiver: create a pickup request
router.post("/", authenticate, requireRole("receiver"), createOrderHandler);

// Receiver: get their orders
router.get("/mine", authenticate, requireRole("receiver"), getMyOrdersHandler);

// Provider: get incoming orders for their food posts
router.get("/provider", authenticate, requireRole("provider"), getProviderOrdersHandler);

// Provider: accept or decline a request
router.put("/:id/status", authenticate, requireRole("provider"), updateStatusHandler);

// Receiver: mark payment completed
router.put("/:id/payment", authenticate, requireRole("receiver"), updatePaymentHandler);

// Provider: remove an order from their history
router.delete("/:id", authenticate, requireRole("provider"), deleteOrderHandler);

module.exports = router;
