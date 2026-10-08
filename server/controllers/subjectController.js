const asyncHandler = require("../utils/asyncHandler");
const Subject = require("../models/Subject");

const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find().populate("class", "name").populate("teacher", "name").sort({ createdAt: -1 });
  res.json({ success: true, count: subjects.length, subjects });
});

const createSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.create(req.body);
  res.status(201).json({ success: true, subject });
});

const updateSubject = asyncHandler(async (req, res) => {
  const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updated) {
    res.status(404);
    throw new Error("Subject not found");
  }
  res.json({ success: true, subject: updated });
});

const deleteSubject = asyncHandler(async (req, res) => {
  const deleted = await Subject.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error("Subject not found");
  }
  res.json({ success: true, message: "Subject deleted successfully" });
});

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };
