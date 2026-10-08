const express = require("express");
const router = express.Router();
const { getMarks, createMark, updateMark, deleteMark } = require("../controllers/markController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", authorize("admin", "teacher"), getMarks);
router.post("/", authorize("admin", "teacher"), createMark);
router.put("/:id", authorize("admin", "teacher"), updateMark);
router.delete("/:id", authorize("admin", "teacher"), deleteMark);

module.exports = router;
