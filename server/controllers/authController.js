const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400);
    throw new Error("Username and password are both required");
  }

  const user = await User.findOne({ username: username.toLowerCase().trim() }).select("+password");
  if (!user) {
    res.status(401);
    throw new Error("Invalid username or password");
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error("This account has been deactivated. Contact an administrator.");
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid username or password");
  }

  res.json({
    success: true,
    token: generateToken(user._id, user.role),
    user: { id: user._id, username: user.username, name: user.name, email: user.email, role: user.role },
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: { id: req.user._id, username: req.user.username, name: req.user.name, email: req.user.email, role: req.user.role },
  });
});

module.exports = { login, getMe };
