const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../../models/User");
const { config } = require("../../config/env");

const SALT_ROUNDS = 10;

const signAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    config.jwt.accessTokenSecret,
    { expiresIn: config.jwt.accessTokenTtl },
  );
};

const signRefreshToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
    },
    config.jwt.refreshTokenSecret,
    { expiresIn: config.jwt.refreshTokenTtl },
  );
};

const registerUser = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email already in use");
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  const safeUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return { user: safeUser, accessToken, refreshToken };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const safeUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return { user: safeUser, accessToken, refreshToken };
};

const refreshTokens = async (token) => {
  try {
    const payload = jwt.verify(token, config.jwt.refreshTokenSecret);
    const user = await User.findById(payload.sub);
    if (!user) {
      const err = new Error("User not found");
      err.status = 401;
      throw err;
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (err) {
    const error = new Error("Invalid or expired refresh token");
    error.status = 401;
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshTokens,
};

