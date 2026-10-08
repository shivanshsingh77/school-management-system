const express = require("express");
const router = express.Router();
const { getUsers, createUser, setUserStatus, deleteUser } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));
router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id/status", setUserStatus);
router.delete("/:id", deleteUser);

module.exports = router;
