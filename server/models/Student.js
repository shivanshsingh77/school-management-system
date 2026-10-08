const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    rollNumber: { type: String, required: [true, "Roll number is required"], unique: true, trim: true },
    name: { type: String, required: [true, "Name is required"], trim: true },
    dateOfBirth: { type: Date, required: [true, "Date of birth is required"] },
    gender: { type: String, enum: { values: ["Male", "Female", "Other"], message: "Gender must be Male, Female, or Other" }, required: [true, "Gender is required"] },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: [true, "Class is required"] },
    phone: { type: String, trim: true, match: [/^[0-9]{10}$/, "Phone number must be exactly 10 digits"] },
    email: { type: String, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"] },
    address: { type: String, trim: true },
    parentName: { type: String, required: [true, "Parent/Guardian name is required"], trim: true },
    admissionDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
