const mongoose = require("mongoose");

function computeGrade(percentage) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
}

const markSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    marksObtained: { type: Number, required: [true, "Marks obtained is required"], min: [0, "Marks cannot be negative"] },
    percentage: { type: Number },
    grade: { type: String },
  },
  { timestamps: true }
);

markSchema.index({ student: 1, exam: 1, subject: 1 }, { unique: true });

markSchema.pre("save", async function (next) {
  if (!this.isModified("marksObtained")) return next();
  const Exam = mongoose.model("Exam");
  const exam = await Exam.findById(this.exam);
  if (!exam) return next(new Error("Linked exam not found"));
  if (this.marksObtained > exam.maxMarks) {
    return next(new Error(`Marks obtained cannot exceed the maximum marks (${exam.maxMarks})`));
  }
  this.percentage = Math.round((this.marksObtained / exam.maxMarks) * 100 * 100) / 100;
  this.grade = computeGrade(this.percentage);
  next();
});

module.exports = mongoose.model("Mark", markSchema);
