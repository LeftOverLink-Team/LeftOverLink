const express = require("express");
const { authenticate } = require("../../middleware/auth");
const { getNotifications } = require("./notifications.controller");

const router = express.Router();

// GET /api/notifications — real notifications derived from user's orders
router.get("/", authenticate, getNotifications);

module.exports = router;
