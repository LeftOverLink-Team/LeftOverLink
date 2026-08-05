const jwt = require("jsonwebtoken");
const { config } = require("../config/env");
const User = require("../../models/User");

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, error: { message: "Authentication required" } });
    }

    const payload = jwt.verify(token, config.jwt.accessTokenSecret);
    const user = await User.findById(payload.sub || payload.id).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, error: { message: "User not found" } });
    }

    req.user = {
      id: user._id.toString(),
      role: payload.role || user.role,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ success: false, error: { message: "Invalid or expired token" } });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Authentication required" } });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Forbidden for role ${req.user.role || "unknown"}`,
          currentRole: req.user.role || null,
          requiredRoles: roles,
        },
      });
    }
    return next();
  };
};

module.exports = {
  authenticate,
  requireRole,
};

