const { registerSchema, loginSchema } = require("./auth.validation");
const { registerUser, loginUser, refreshTokens } = require("./auth.service");
const User = require("../../../models/User");

const register = async (req, res, next) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const result = await registerUser(parsed);

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // For signup the frontend only checks success, so keep it simple.
    return res.status(201).json({
      message: "User registered",
      user: result.user,
    });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: { message: "Validation failed", details: err.errors },
      });
    }
    if (err.status === 409) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const result = await loginUser(parsed);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Match existing API shape expected by the frontend:
    // { token, user }
    return res.json({
      token: result.accessToken,
      user: {
        _id: result.user.id,
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        // Wallet fields can be added later when modeled
      },
    });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: { message: "Validation failed", details: err.errors },
      });
    }
    return next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: { message: "Refresh token required" } });
    }

    const result = await refreshTokens(token);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      token: result.accessToken,
      user: {
        _id: result.user.id,
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
};

const me = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  return res.json(user);
};

const logout = async (req, res) => {
  res.clearCookie("refreshToken");
  return res.json({ success: true });
};

module.exports = {
  register,
  login,
  refresh,
  me,
  logout,
};


