const express = require("express");
const { authenticate } = require("../../middleware/auth");
const User = require("../../../models/User");

const router = express.Router();

/**
 * GET /api/wallet
 * Returns the authenticated user's current wallet state
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id || req.user._id).select(
      "walletPoints walletBalance"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({
      points: user.walletPoints,
      balanceINR: user.walletBalance,
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /api/wallet/award
 * Award points to the authenticated user after a successful payment
 */
router.post("/award", authenticate, async (req, res, next) => {
  try {
    const { points = 50 } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id || req.user._id,
      {
        $inc: {
          walletPoints: points,
          walletBalance: parseFloat((points * 0.01).toFixed(2)),
        },
      },
      { new: true }
    ).select("walletPoints walletBalance");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      points: user.walletPoints,
      balanceINR: user.walletBalance,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
