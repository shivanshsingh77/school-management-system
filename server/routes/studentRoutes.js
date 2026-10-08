const express = require("express");
const router = express.Router();
const { getStudents, getStudentById, createStudent, updateStudent, deleteStudent } = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", authorize("admin", "teacher"), getStudents);
router.get("/:id", authorize("admin", "teacher"), getStudentById);
router.post("/", authorize("admin"), createStudent);
router.put("/:id", authorize("admin"), updateStudent);
router.delete("/:id", authorize("admin"), deleteStudent);

module.exports = router;
