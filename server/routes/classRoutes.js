const express = require("express");
const router = express.Router();
const { getClasses, createClass, updateClass, deleteClass } = require("../controllers/classController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", authorize("admin", "teacher"), getClasses);
router.post("/", authorize("admin"), createClass);
router.put("/:id", authorize("admin"), updateClass);
router.delete("/:id", authorize("admin"), deleteClass);

module.exports = router;
