const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: [true, "Username is required"], unique: true, trim: true, lowercase: true, minlength: [3, "Username must be at least 3 characters"] },
    password: { type: String, required: [true, "Password is required"], minlength: [6, "Password must be at least 6 characters"], select: false },
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: { type: String, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"] },
    role: { type: String, enum: { values: ["admin", "teacher", "student"], message: "Role must be admin, teacher, or student" }, required: [true, "Role is required"] },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
