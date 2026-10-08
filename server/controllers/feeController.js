const asyncHandler = require("../utils/asyncHandler");
const Fee = require("../models/Fee");

const getFees = asyncHandler(async (req, res) => {
  const { studentId, search } = req.query;
  const filter = {};
  if (studentId) filter.student = studentId;

  let fees = await Fee.find(filter).populate("student", "name rollNumber class").sort({ createdAt: -1 });
  if (search) {
    const regex = new RegExp(search, "i");
    fees = fees.filter((f) => regex.test(f.student?.name || "") || regex.test(f.student?.rollNumber || ""));
  }
  res.json({ success: true, count: fees.length, fees });
});

const createFee = asyncHandler(async (req, res) => {
  const { student, totalFees } = req.body;
  if (!student || totalFees === undefined) {
    res.status(400);
    throw new Error("student and totalFees are required");
  }
  const fee = await Fee.create({ student, totalFees, payments: [] });
  res.status(201).json({ success: true, fee });
});

const recordPayment = asyncHandler(async (req, res) => {
  const { amount, note } = req.body;
  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error("A valid payment amount greater than 0 is required");
  }

  const fee = await Fee.findById(req.params.id);
  if (!fee) {
    res.status(404);
    throw new Error("Fee record not found");
  }

  const alreadyPaid = fee.payments.reduce((sum, p) => sum + p.amount, 0);
  if (alreadyPaid + amount > fee.totalFees) {
    res.status(400);
    throw new Error("Payment amount would exceed the total fees due");
  }

  fee.payments.push({ amount, note });
  await fee.save();
  res.json({ success: true, fee });
});

const deleteFee = asyncHandler(async (req, res) => {
  const deleted = await Fee.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error("Fee record not found");
  }
  res.json({ success: true, message: "Fee record deleted successfully" });
});

module.exports = { getFees, createFee, recordPayment, deleteFee };
