const express = require("express");
const { authenticate } = require("../../middleware/auth");
const { register, login, refresh, me, logout } = require("./auth.controller");
const User = require("../../../models/User");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/me", authenticate, me);
router.post("/logout", authenticate, logout);

// User settings (location, notifications)
router.get("/settings", authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id || req.user._id).select("settings");
    return res.json(user?.settings || {});
  } catch (err) { return next(err); }
});

router.put("/settings", authenticate, async (req, res, next) => {
  try {
    const { lat, lng, address, maxDistance, notificationsEnabled } = req.body;
    const update = {};
    if (lat !== undefined) update["settings.lat"] = lat;
    if (lng !== undefined) update["settings.lng"] = lng;
    if (address !== undefined) update["settings.address"] = address;
    if (maxDistance !== undefined) update["settings.maxDistance"] = maxDistance;
    if (notificationsEnabled !== undefined) update["settings.notificationsEnabled"] = notificationsEnabled;
    const user = await User.findByIdAndUpdate(
      req.user.id || req.user._id,
      { $set: update },
      { new: true }
    ).select("settings");
    return res.json(user?.settings || {});
  } catch (err) { return next(err); }
});

module.exports = router;

