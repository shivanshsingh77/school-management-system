const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .populate("teacher", "name email subject")
    .populate("student", "name rollNumber")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

const createUser = asyncHandler(async (req, res) => {
  const { username, password, name, email, role, teacher, student } = req.body;
  if (!username || !password || !name || !role) {
    res.status(400);
    throw new Error("username, password, name, and role are required");
  }

  const payload = { username, password, name, email, role };

  if (role === "teacher" && teacher) {
    const teacherExists = await Teacher.findById(teacher);
    if (!teacherExists) {
      res.status(400);
      throw new Error("Selected teacher does not exist");
    }
    payload.teacher = teacher;
  }

  if (role === "student" && student) {
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      res.status(400);
      throw new Error("Selected student does not exist");
    }
    payload.student = student;
  }

  const user = await User.create(payload);
  res.status(201).json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      teacher: user.teacher,
      student: user.student,
      isActive: user.isActive,
    },
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
