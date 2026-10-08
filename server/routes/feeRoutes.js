const express = require("express");
const router = express.Router();
const { getFees, createFee, recordPayment, deleteFee } = require("../controllers/feeController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", authorize("admin"), getFees);
router.post("/", authorize("admin"), createFee);
router.post("/:id/payments", authorize("admin"), recordPayment);
router.delete("/:id", authorize("admin"), deleteFee);

module.exports = router;
