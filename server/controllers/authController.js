const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const resolveUserProfile = require("../utils/resolveProfile");

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

  const profile = await resolveUserProfile(user);

  res.json({
    success: true,
    token: generateToken(user._id, user.role),
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      teacher: user.teacher || null,
      student: user.student || null,
      isProfileLinked: Boolean(profile),
      profileDetails: profile || null,
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  const profile = await resolveUserProfile(req.user);

  res.json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      teacher: req.user.teacher || null,
      student: req.user.student || null,
      isProfileLinked: Boolean(profile),
      profileDetails: profile || null,
    },
  });
});

module.exports = { login, getMe };
