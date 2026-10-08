const asyncHandler = require("../utils/asyncHandler");
const Mark = require("../models/Mark");

const getMarks = asyncHandler(async (req, res) => {
  const { examId, studentId } = req.query;
  const filter = {};
  if (examId) filter.exam = examId;
  if (studentId) filter.student = studentId;

  const marks = await Mark.find(filter)
    .populate("student", "name rollNumber")
    .populate("subject", "name code")
    .populate({ path: "exam", select: "name examDate maxMarks class", populate: { path: "class", select: "name" } })
    .sort({ createdAt: -1 });

  res.json({ success: true, count: marks.length, marks });
});

const createMark = asyncHandler(async (req, res) => {
  const mark = await Mark.create(req.body);
  res.status(201).json({ success: true, mark });
});

const updateMark = asyncHandler(async (req, res) => {
  const mark = await Mark.findById(req.params.id);
  if (!mark) {
    res.status(404);
    throw new Error("Mark record not found");
  }
  mark.marksObtained = req.body.marksObtained;
  await mark.save();
  res.json({ success: true, mark });
});

const deleteMark = asyncHandler(async (req, res) => {
  const mark = await Mark.findByIdAndDelete(req.params.id);
  if (!mark) {
    res.status(404);
    throw new Error("Mark record not found");
  }
  res.json({ success: true, message: "Mark deleted successfully" });
});

module.exports = { getMarks, createMark, updateMark, deleteMark };
