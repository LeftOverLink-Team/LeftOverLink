const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const authHeader =
    req.headers.authorization ||
    req.headers.Authorization ||
    req.header("Authorization");

  console.log(
    "Auth middleware - Authorization header:",
    authHeader ? `✓ Present (${authHeader.substring(0, 30)}...)` : "✗ Missing",
  );

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("Auth middleware - No Bearer token found");
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    console.log("Auth middleware - Verifying token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Auth middleware - ✓ Token verified, user id:", decoded.id);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.warn("Auth middleware - User not found for id:", decoded.id);
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = { id: user._id };
    console.log("Auth middleware - ✓ Request user set:", req.user.id);
    next();
  } catch (err) {
    console.error("Auth middleware - Token verification failed:", err.message);
    res.status(401).json({ message: "Token invalid", error: err.message });
  }
};
