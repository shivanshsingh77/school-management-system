const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    phone: { type: String, trim: true, match: [/^[0-9]{10}$/, "Phone number must be exactly 10 digits"] },
    email: { type: String, trim: true, lowercase: true, required: [true, "Email is required"], unique: true, match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"] },
    address: { type: String, trim: true },
    qualification: { type: String, trim: true, required: [true, "Qualification is required"] },
    subject: { type: String, trim: true, required: [true, "Subject is required"] },
    joiningDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teacher", teacherSchema);
