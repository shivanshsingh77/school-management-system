const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

const createUser = asyncHandler(async (req, res) => {
  const { username, password, name, email, role } = req.body;
  if (!username || !password || !name || !role) {
    res.status(400);
    throw new Error("username, password, name, and role are required");
  }
  const user = await User.create({ username, password, name, email, role });
  res.status(201).json({
    success: true,
    user: { id: user._id, username: user.username, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
  });
});

const setUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, user: { id: user._id, isActive: user.isActive } });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, message: "User deleted successfully" });
});

module.exports = { getUsers, createUser, setUserStatus, deleteUser };
