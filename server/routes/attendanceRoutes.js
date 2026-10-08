const express = require("express");
const router = express.Router();
const { getAttendanceSheet, saveAttendance, getAttendanceHistory } = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/sheet", authorize("admin", "teacher"), getAttendanceSheet);
router.post("/", authorize("admin", "teacher"), saveAttendance);
router.get("/history", authorize("admin", "teacher"), getAttendanceHistory);

module.exports = router;
