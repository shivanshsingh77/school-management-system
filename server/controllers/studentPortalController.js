const asyncHandler = require("../utils/asyncHandler");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Fee = require("../models/Fee");
const Mark = require("../models/Mark");
const Exam = require("../models/Exam");
const Subject = require("../models/Subject");

/**
 * @desc Get personal profile of the logged-in student
 * @route GET /api/students/portal/profile
 * @access Private (Student)
 */
const getStudentProfile = asyncHandler(async (req, res) => {
  const studentId = req.user.student;
  if (!studentId) {
    res.status(404);
    throw new Error("No student record linked to your account. Please contact the administrator.");
  }

  const student = await Student.findById(studentId).populate({
    path: "class",
    populate: { path: "classTeacher", select: "name email phone qualification" },
  });

  if (!student) {
    res.status(404);
    throw new Error("Student profile not found in database");
  }

  res.json({ success: true, student });
});

/**
 * @desc Get summary statistics for the logged-in student dashboard
 * @route GET /api/students/portal/stats
 * @access Private (Student)
 */
const getStudentStats = asyncHandler(async (req, res) => {
  const studentId = req.user.student;
  if (!studentId) {
    return res.json({
      success: true,
      stats: {
        attendancePercentage: 0,
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        totalFees: 0,
        paidFees: 0,
        pendingFees: 0,
        totalSubjects: 0,
        averageMarksPercentage: 0,
        overallGrade: "—",
      },
      message: "No student profile linked",
    });
  }

  const student = await Student.findById(studentId);
  if (!student) {
    res.status(404);
    throw new Error("Student profile not found");
  }

  // 1. Attendance stats
  const totalDays = await Attendance.countDocuments({ student: studentId });
  const presentDays = await Attendance.countDocuments({ student: studentId, status: "Present" });
  const absentDays = totalDays - presentDays;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  // 2. Fee stats
  const feeDoc = await Fee.findOne({ student: studentId });
  const totalFees = feeDoc ? feeDoc.totalFees : 0;
  const paidFees = feeDoc ? feeDoc.paidAmount : 0;
  const pendingFees = feeDoc ? feeDoc.pendingAmount : 0;

  // 3. Subjects count
  const totalSubjects = student.class ? await Subject.countDocuments({ class: student.class }) : 0;

  // 4. Marks stats
  const marks = await Mark.find({ student: studentId });
  let averageMarksPercentage = 0;
  let overallGrade = "—";
  if (marks.length > 0) {
    const totalPercentage = marks.reduce((sum, m) => sum + (m.percentage || 0), 0);
    averageMarksPercentage = Math.round((totalPercentage / marks.length) * 100) / 100;

    if (averageMarksPercentage >= 90) overallGrade = "A+";
    else if (averageMarksPercentage >= 80) overallGrade = "A";
    else if (averageMarksPercentage >= 70) overallGrade = "B";
    else if (averageMarksPercentage >= 60) overallGrade = "C";
    else if (averageMarksPercentage >= 50) overallGrade = "D";
    else overallGrade = "F";
  }

  res.json({
    success: true,
    stats: {
      attendancePercentage,
      totalDays,
      presentDays,
      absentDays,
      totalFees,
      paidFees,
      pendingFees,
      totalSubjects,
      averageMarksPercentage,
      overallGrade,
      gradedExamsCount: marks.length,
    },
  });
});

/**
 * @desc Get attendance history for the logged-in student
 * @route GET /api/students/portal/attendance
 * @access Private (Student)
 */
const getStudentAttendance = asyncHandler(async (req, res) => {
  const studentId = req.user.student;
  if (!studentId) {
    return res.json({ success: true, count: 0, history: [], summary: { total: 0, present: 0, absent: 0, percentage: 0 } });
  }

  const history = await Attendance.find({ student: studentId })
    .populate("class", "name")
    .sort({ date: -1 });

  const total = history.length;
  const present = history.filter((r) => r.status === "Present").length;
  const absent = total - present;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

  res.json({
    success: true,
    count: history.length,
    history,
    summary: { total, present, absent, percentage },
  });
});

/**
 * @desc Get fee and payment history for the logged-in student
 * @route GET /api/students/portal/fees
 * @access Private (Student)
 */
const getStudentFees = asyncHandler(async (req, res) => {
  const studentId = req.user.student;
  if (!studentId) {
    return res.json({ success: true, fee: null, payments: [] });
  }

  const fee = await Fee.findOne({ student: studentId }).populate("student", "name rollNumber class");

  if (!fee) {
    return res.json({
      success: true,
      fee: null,
      payments: [],
      totalFees: 0,
      paidAmount: 0,
      pendingAmount: 0,
      message: "No fee record assigned yet",
    });
  }

  // Payments sorted by latest date
  const sortedPayments = [...(fee.payments || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({
    success: true,
    fee,
    totalFees: fee.totalFees,
    paidAmount: fee.paidAmount,
    pendingAmount: fee.pendingAmount,
    payments: sortedPayments,
  });
});

/**
 * @desc Get subject-wise marks and exam results for the logged-in student
 * @route GET /api/students/portal/marks
 * @access Private (Student)
 */
const getStudentMarks = asyncHandler(async (req, res) => {
  const studentId = req.user.student;
  if (!studentId) {
    return res.json({ success: true, count: 0, marks: [] });
  }

  const marks = await Mark.find({ student: studentId })
    .populate({
      path: "exam",
      select: "name examDate maxMarks class",
      populate: { path: "class", select: "name" },
    })
    .populate("subject", "name code")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: marks.length, marks });
});

/**
 * @desc Get upcoming and past exams scheduled for the logged-in student's class
 * @route GET /api/students/portal/exams
 * @access Private (Student)
 */
const getStudentExams = asyncHandler(async (req, res) => {
  const studentId = req.user.student;
  if (!studentId) {
    return res.json({ success: true, count: 0, exams: [] });
  }

  const student = await Student.findById(studentId);
  if (!student || !student.class) {
    return res.json({ success: true, count: 0, exams: [] });
  }

  const exams = await Exam.find({ class: student.class })
    .populate("subject", "name code")
    .populate("class", "name")
    .sort({ examDate: 1 });

  res.json({ success: true, count: exams.length, exams });
});

module.exports = {
  getStudentProfile,
  getStudentStats,
  getStudentAttendance,
  getStudentFees,
  getStudentMarks,
  getStudentExams,
};
