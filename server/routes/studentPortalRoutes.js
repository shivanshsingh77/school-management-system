const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getStudentProfile,
  getStudentStats,
  getStudentAttendance,
  getStudentFees,
  getStudentMarks,
  getStudentExams,
} = require("../controllers/studentPortalController");

// Protect and authorize student for all portal routes
router.use(protect, authorize("student"));

router.get("/profile", getStudentProfile);
router.get("/stats", getStudentStats);
router.get("/attendance", getStudentAttendance);
router.get("/fees", getStudentFees);
router.get("/marks", getStudentMarks);
router.get("/exams", getStudentExams);

module.exports = router;
