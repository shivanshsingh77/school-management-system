require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const Fee = require("../models/Fee");
const Exam = require("../models/Exam");
const Mark = require("../models/Mark");

const run = async () => {
  await connectDB();

  console.log("Clearing existing demo collections...");
  await Promise.all([
    User.deleteMany({}),
    Teacher.deleteMany({}),
    Student.deleteMany({}),
    Class.deleteMany({}),
    Subject.deleteMany({}),
    Attendance.deleteMany({}),
    Fee.deleteMany({}),
    Exam.deleteMany({}),
    Mark.deleteMany({}),
  ]);

  // ---- Admin user ----
  await User.create({ username: "admin", password: "Admin@123", name: "System Administrator", email: "admin@school.local", role: "admin" });

  // ---- Teachers ----
  const teachers = await Teacher.insertMany([
    { name: "Rahul Sharma", email: "rahul.sharma@school.local", phone: "9876543210", qualification: "M.Sc Computer Science", subject: "Computer Science", address: "Mumbai" },
    { name: "Priya Verma", email: "priya.verma@school.local", phone: "9876543211", qualification: "M.A English", subject: "English", address: "Pune" },
    { name: "Anil Kumar", email: "anil.kumar@school.local", phone: "9876543212", qualification: "M.Sc Mathematics", subject: "Mathematics", address: "Delhi" },
  ]);

  // Login accounts for teachers
  await User.create({ username: "rahul.sharma", password: "Teacher@123", name: "Rahul Sharma", email: "rahul.sharma@school.local", role: "teacher", teacher: teachers[0]._id });

  // ---- Classes ----
  const classes = await Class.insertMany([
    { name: "BCA 1A", classTeacher: teachers[0]._id },
    { name: "BCA 1B", classTeacher: teachers[1]._id },
    { name: "BCA 2A", classTeacher: teachers[2]._id },
  ]);

  // ---- Subjects ----
  const subjects = await Subject.insertMany([
    { name: "Programming Fundamentals", code: "CS101", class: classes[0]._id, teacher: teachers[0]._id },
    { name: "English Communication", code: "EN101", class: classes[0]._id, teacher: teachers[1]._id },
    { name: "Discrete Mathematics", code: "MA101", class: classes[1]._id, teacher: teachers[2]._id },
  ]);

  // ---- Students ----
  const studentsData = [
    { rollNumber: "BCA001", name: "Aarav Patel", dateOfBirth: "2005-04-12", gender: "Male", class: classes[0]._id, phone: "9000000001", email: "aarav.patel@student.local", parentName: "Suresh Patel", address: "Mumbai" },
    { rollNumber: "BCA002", name: "Ishita Shah", dateOfBirth: "2005-06-20", gender: "Female", class: classes[0]._id, phone: "9000000002", email: "ishita.shah@student.local", parentName: "Kiran Shah", address: "Mumbai" },
    { rollNumber: "BCA003", name: "Rohan Mehta", dateOfBirth: "2005-01-15", gender: "Male", class: classes[0]._id, phone: "9000000003", email: "rohan.mehta@student.local", parentName: "Anita Mehta", address: "Thane" },
    { rollNumber: "BCB001", name: "Sneha Joshi", dateOfBirth: "2005-09-05", gender: "Female", class: classes[1]._id, phone: "9000000004", email: "sneha.joshi@student.local", parentName: "Vijay Joshi", address: "Pune" },
    { rollNumber: "BCB002", name: "Karan Nair", dateOfBirth: "2005-11-30", gender: "Male", class: classes[1]._id, phone: "9000000005", email: "karan.nair@student.local", parentName: "Deepa Nair", address: "Pune" },
  ];
  const students = await Student.insertMany(studentsData);

  // Login account for one student (demo)
  await User.create({ username: "aarav.patel", password: "Student@123", name: "Aarav Patel", email: "aarav.patel@student.local", role: "student", student: students[0]._id });

  // ---- Attendance (today, for BCA 1A) ----
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bca1aStudents = students.filter((s) => s.class.toString() === classes[0]._id.toString());
  await Attendance.insertMany(
    bca1aStudents.map((s, i) => ({
      student: s._id,
      class: classes[0]._id,
      date: today,
      status: i === 1 ? "Absent" : "Present",
    }))
  );

  // ---- Fees ----
  await Fee.insertMany([
    { student: students[0]._id, totalFees: 50000, payments: [{ amount: 35000, note: "Installment 1" }] },
    { student: students[1]._id, totalFees: 50000, payments: [{ amount: 50000, note: "Full payment" }] },
    { student: students[2]._id, totalFees: 50000, payments: [] },
  ]);

  // ---- Exams + Marks ----
  const exam = await Exam.create({
    name: "Mid-Term Exam",
    class: classes[0]._id,
    subject: subjects[0]._id,
    examDate: new Date(),
    maxMarks: 100,
  });

  for (const s of bca1aStudents) {
    await Mark.create({ student: s._id, exam: exam._id, subject: subjects[0]._id, marksObtained: 60 + Math.floor(Math.random() * 35) });
  }

  console.log("\nDemo data seeded successfully!\n");
  console.log("Login credentials:");
  console.log("  Admin:   admin / Admin@123");
  console.log("  Teacher: rahul.sharma / Teacher@123");
  console.log("  Student: aarav.patel / Student@123");
  console.log("\nThis is demo data only - change these passwords for any real deployment.\n");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((error) => {
  console.error("Seeding failed:", error.message);
  process.exit(1);
});
