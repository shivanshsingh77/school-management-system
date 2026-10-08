const asyncHandler = require("../utils/asyncHandler");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const Fee = require("../models/Fee");
const Attendance = require("../models/Attendance");

const getAdminStats = asyncHandler(async (req, res) => {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date();
  dayEnd.setHours(23, 59, 59, 999);

  const [totalStudents, totalTeachers, totalClasses, fees, todaysAttendanceCount] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    Class.countDocuments(),
    Fee.find(),
    Attendance.countDocuments({ date: { $gte: dayStart, $lte: dayEnd }, status: "Present" }),
  ]);

  const pendingFees = fees.reduce((sum, f) => {
    const paid = f.payments.reduce((s, p) => s + p.amount, 0);
    return sum + (f.totalFees - paid);
  }, 0);

  res.json({
    success: true,
    stats: { totalStudents, totalTeachers, totalClasses, pendingFees, todaysAttendance: todaysAttendanceCount },
  });
});

module.exports = { getAdminStats };
