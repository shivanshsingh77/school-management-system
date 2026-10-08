const express = require("express");
const router = express.Router();
const { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher } = require("../controllers/teacherController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", authorize("admin"), getTeachers);
router.get("/:id", authorize("admin"), getTeacherById);
router.post("/", authorize("admin"), createTeacher);
router.put("/:id", authorize("admin"), updateTeacher);
router.delete("/:id", authorize("admin"), deleteTeacher);

module.exports = router;
