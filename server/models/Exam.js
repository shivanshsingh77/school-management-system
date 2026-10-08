const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Exam name is required"], trim: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    examDate: { type: Date, required: [true, "Exam date is required"] },
    maxMarks: { type: Number, required: [true, "Maximum marks is required"], min: [1, "Maximum marks must be greater than 0"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);
