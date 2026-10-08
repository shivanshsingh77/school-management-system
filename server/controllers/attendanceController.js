const asyncHandler = require("../utils/asyncHandler");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

const getAttendanceSheet = asyncHandler(async (req, res) => {
  const { classId, date } = req.query;
  if (!classId || !date) {
    res.status(400);
    throw new Error("classId and date are required");
  }

  const students = await Student.find({ class: classId }).sort({ rollNumber: 1 });
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const records = await Attendance.find({ date: { $gte: dayStart, $lte: dayEnd }, student: { $in: students.map((s) => s._id) } });

  const recordMap = {};
  records.forEach((r) => { recordMap[r.student.toString()] = r.status; });

  const sheet = students.map((s) => ({ student: s, status: recordMap[s._id.toString()] || null }));
  res.json({ success: true, sheet });
});

const saveAttendance = asyncHandler(async (req, res) => {
  const { classId, date, records } = req.body;
  if (!classId || !date || !Array.isArray(records) || records.length === 0) {
    res.status(400);
    throw new Error("classId, date, and at least one attendance record are required");
  }

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const results = [];
  for (const record of records) {
    const saved = await Attendance.findOneAndUpdate(
      { student: record.studentId, date: dayStart },
      { student: record.studentId, class: classId, date: dayStart, status: record.status, markedBy: req.user._id },
      { upsert: true, new: true, runValidators: true }
    );
    results.push(saved);
  }

  res.json({ success: true, message: "Attendance saved successfully", count: results.length });
});

const getAttendanceHistory = asyncHandler(async (req, res) => {
  const { studentId, classId, date } = req.query;
  const filter = {};
  if (studentId) filter.student = studentId;
  if (classId) filter.class = classId;
  if (date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    filter.date = { $gte: dayStart, $lte: dayEnd };
  }

  const history = await Attendance.find(filter).populate("student", "name rollNumber").populate("class", "name").sort({ date: -1 });
  res.json({ success: true, count: history.length, history });
});

module.exports = { getAttendanceSheet, saveAttendance, getAttendanceHistory };
