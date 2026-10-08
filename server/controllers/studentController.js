const asyncHandler = require("../utils/asyncHandler");
const Student = require("../models/Student");

const getStudents = asyncHandler(async (req, res) => {
  const { search, classId } = req.query;
  let filter = {};
  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [{ name: regex }, { rollNumber: regex }];
  }
  if (classId) filter.class = classId;

  const students = await Student.find(filter).populate("class", "name").sort({ createdAt: -1 });
  res.json({ success: true, count: students.length, students });
});

const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate("class", "name");
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  res.json({ success: true, student });
});

const createStudent = asyncHandler(async (req, res) => {
  const student = await Student.create(req.body);
  res.status(201).json({ success: true, student });
});

const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  res.json({ success: true, student });
});

const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  res.json({ success: true, message: "Student deleted successfully" });
});

module.exports = { getStudents, getStudentById, createStudent, updateStudent, deleteStudent };
