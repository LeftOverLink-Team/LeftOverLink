const express = require("express");
const jwt = require("jsonwebtoken");
const { authenticate } = require("../../middleware/auth");
const { register, login, refresh, me, logout } = require("./auth.controller");
const { config } = require("../../config/env");
const User = require("../../../models/User");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/me", authenticate, me);
router.post("/logout", authenticate, logout);

// Role switch — updates MongoDB and issues a new JWT so the stale token is replaced immediately
router.put("/role", authenticate, async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !["provider", "receiver"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: { message: "Role must be 'provider' or 'receiver'" },
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { role } },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, error: { message: "User not found" } });
    }

    // Sign a fresh access token containing the new role
    const accessToken = jwt.sign(
      { sub: user._id.toString(), role: user.role, email: user.email },
      config.jwt.accessTokenSecret,
      { expiresIn: config.jwt.accessTokenTtl }
    );

    // Rotate the refresh token cookie as well
    const refreshToken = jwt.sign(
      { sub: user._id.toString() },
      config.jwt.refreshTokenSecret,
      { expiresIn: config.jwt.refreshTokenTtl }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      token: accessToken,
      user: {
        _id: user._id.toString(),
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
});

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

