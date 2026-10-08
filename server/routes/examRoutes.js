const express = require("express");
const router = express.Router();
const { getExams, createExam, updateExam, deleteExam } = require("../controllers/examController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", authorize("admin", "teacher"), getExams);
router.post("/", authorize("admin", "teacher"), createExam);
router.put("/:id", authorize("admin", "teacher"), updateExam);
router.delete("/:id", authorize("admin"), deleteExam);

module.exports = router;
