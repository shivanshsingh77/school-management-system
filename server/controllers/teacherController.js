const asyncHandler = require("../utils/asyncHandler");
const Teacher = require("../models/Teacher");

const getTeachers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let filter = {};
  if (search) {
    const regex = new RegExp(search, "i");
    filter = { $or: [{ name: regex }, { subject: regex }, { email: regex }] };
  }
  const teachers = await Teacher.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: teachers.length, teachers });
});

const getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error("Teacher not found");
  }
  res.json({ success: true, teacher });
});

const createTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.create(req.body);
  res.status(201).json({ success: true, teacher });
});

const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!teacher) {
    res.status(404);
    throw new Error("Teacher not found");
  }
  res.json({ success: true, teacher });
});

const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByIdAndDelete(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error("Teacher not found");
  }
  res.json({ success: true, message: "Teacher deleted successfully" });
});

module.exports = { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher };
