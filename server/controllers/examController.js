const asyncHandler = require("../utils/asyncHandler");
const Exam = require("../models/Exam");

const getExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find().populate("class", "name").populate("subject", "name code").sort({ examDate: -1 });
  res.json({ success: true, count: exams.length, exams });
});

const createExam = asyncHandler(async (req, res) => {
  const exam = await Exam.create(req.body);
  res.status(201).json({ success: true, exam });
});

const updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!exam) {
    res.status(404);
    throw new Error("Exam not found");
  }
  res.json({ success: true, exam });
});

const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndDelete(req.params.id);
  if (!exam) {
    res.status(404);
    throw new Error("Exam not found");
  }
  res.json({ success: true, message: "Exam deleted successfully" });
});

module.exports = { getExams, createExam, updateExam, deleteExam };
