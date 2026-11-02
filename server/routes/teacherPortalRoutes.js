const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getTeacherStats,
  getTeacherProfile,
  getAssignedClasses,
  getAssignedStudents,
  getTeacherAttendanceSheet,
  saveTeacherAttendance,
  getTeacherAttendanceHistory,
  getTeacherExams,
  getTeacherMarks,
  saveTeacherMark,
} = require("../controllers/teacherPortalController");

// Protect and authorize teacher for all portal routes
router.use(protect, authorize("teacher"));

router.get("/stats", getTeacherStats);
router.get("/profile", getTeacherProfile);
router.get("/classes", getAssignedClasses);
router.get("/students", getAssignedStudents);
router.get("/attendance/sheet", getTeacherAttendanceSheet);
router.post("/attendance", saveTeacherAttendance);
router.get("/attendance/history", getTeacherAttendanceHistory);
router.get("/exams", getTeacherExams);
router.get("/marks", getTeacherMarks);
router.post("/marks", saveTeacherMark);

module.exports = router;
