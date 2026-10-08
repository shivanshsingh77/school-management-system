const asyncHandler = require("../utils/asyncHandler");
const Class = require("../models/Class");

const getClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find().populate("classTeacher", "name").sort({ name: 1 });
  res.json({ success: true, count: classes.length, classes });
});

const createClass = asyncHandler(async (req, res) => {
  const newClass = await Class.create(req.body);
  res.status(201).json({ success: true, class: newClass });
});

const updateClass = asyncHandler(async (req, res) => {
  const updated = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updated) {
    res.status(404);
    throw new Error("Class not found");
  }
  res.json({ success: true, class: updated });
});

const deleteClass = asyncHandler(async (req, res) => {
  const deleted = await Class.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error("Class not found");
  }
  res.json({ success: true, message: "Class deleted successfully" });
});

module.exports = { getClasses, createClass, updateClass, deleteClass };
