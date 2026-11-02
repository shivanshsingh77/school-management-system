const asyncHandler = require("../utils/asyncHandler");
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Exam = require("../models/Exam");
const Mark = require("../models/Mark");

/**
 * Returns authorized class IDs, class documents, and subjects for the requesting teacher.
 */
async function getTeacherScope(teacherId) {
  if (!teacherId) {
    return { authorizedClassIds: [], authorizedClasses: [], subjectsTaught: [], relevantSubjects: [] };
  }

  // 1. Classes where this teacher is assigned as the class teacher
  const classesAsTeacher = await Class.find({ classTeacher: teacherId }).select("_id name");

  // 2. Subjects directly taught by this teacher
  const subjectsTaught = await Subject.find({ teacher: teacherId }).populate("class", "name");

  // 3. Union of all authorized class IDs
  const classIdSet = new Set();
  classesAsTeacher.forEach((c) => classIdSet.add(c._id.toString()));
  subjectsTaught.forEach((s) => {
    if (s.class?._id) classIdSet.add(s.class._id.toString());
  });

  const authorizedClassIds = Array.from(classIdSet);
  const authorizedClasses = await Class.find({ _id: { $in: authorizedClassIds } }).populate("classTeacher", "name");

  // All subjects in teacher's authorized classes or taught directly
  const relevantSubjects = await Subject.find({
    $or: [{ teacher: teacherId }, { class: { $in: authorizedClassIds } }],
  })
    .populate("class", "name")
    .populate("teacher", "name");

  return { authorizedClassIds, authorizedClasses, subjectsTaught, relevantSubjects };
}

/**
 * @desc Get overview stats for the logged-in teacher
 * @route GET /api/teachers/portal/stats
 * @access Private (Teacher)
 */
const getTeacherStats = asyncHandler(async (req, res) => {
  const teacherId = req.user.teacher;
  if (!teacherId) {
    return res.json({
      success: true,
      stats: {
        totalAssignedClasses: 0,
        totalStudents: 0,
        totalSubjects: 0,
        todaysAttendanceMarked: 0,
        todaysAttendanceTotal: 0,
      },
      message: "No teacher profile linked to this account yet.",
    });
  }

  const { authorizedClassIds, subjectsTaught } = await getTeacherScope(teacherId);

  const totalStudents = await Student.countDocuments({ class: { $in: authorizedClassIds } });

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date();
  dayEnd.setHours(23, 59, 59, 999);

  const todaysAttendanceCount = await Attendance.countDocuments({
    class: { $in: authorizedClassIds },
    date: { $gte: dayStart, $lte: dayEnd },
    status: "Present",
  });

  const totalAttendanceRecordsToday = await Attendance.countDocuments({
    class: { $in: authorizedClassIds },
    date: { $gte: dayStart, $lte: dayEnd },
  });

  res.json({
    success: true,
    stats: {
      totalAssignedClasses: authorizedClassIds.length,
      totalStudents,
      totalSubjects: subjectsTaught.length,
      todaysAttendanceMarked: todaysAttendanceCount,
      todaysAttendanceTotal: totalAttendanceRecordsToday,
    },
  });
});

/**
 * @desc Get current teacher profile
 * @route GET /api/teachers/portal/profile
 * @access Private (Teacher)
 */
const getTeacherProfile = asyncHandler(async (req, res) => {
  const teacherId = req.user.teacher;
  if (!teacherId) {
    res.status(404);
    throw new Error("No teacher profile linked to your account. Contact an administrator.");
  }

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    res.status(404);
    throw new Error("Teacher profile record not found");
  }

  const { authorizedClasses, subjectsTaught } = await getTeacherScope(teacherId);

  res.json({
    success: true,
    teacher,
    assignedClasses: authorizedClasses,
    subjectsTaught,
  });
});

/**
 * @desc Get assigned classes for the logged-in teacher
 * @route GET /api/teachers/portal/classes
 * @access Private (Teacher)
 */
const getAssignedClasses = asyncHandler(async (req, res) => {
  const teacherId = req.user.teacher;
  if (!teacherId) {
    return res.json({ success: true, count: 0, classes: [] });
  }

  const { authorizedClasses } = await getTeacherScope(teacherId);

  // Attach student count to each class
  const classesWithCounts = await Promise.all(
    authorizedClasses.map(async (c) => {
      const studentCount = await Student.countDocuments({ class: c._id });
      const isClassTeacher = c.classTeacher?._id?.toString() === teacherId.toString();
      return {
        ...c.toObject(),
        studentCount,
        isClassTeacher,
      };
    })
  );

  res.json({ success: true, count: classesWithCounts.length, classes: classesWithCounts });
});

/**
 * @desc Get students belonging ONLY to teacher's assigned classes
 * @route GET /api/teachers/portal/students
 * @access Private (Teacher)
 */
const getAssignedStudents = asyncHandler(async (req, res) => {
  const teacherId = req.user.teacher;
  if (!teacherId) {
    return res.json({ success: true, count: 0, students: [] });
  }

  const { authorizedClassIds } = await getTeacherScope(teacherId);

  const { classId, search } = req.query;

  // Filter query
  let queryClassIds = authorizedClassIds;
  if (classId) {
    if (!authorizedClassIds.includes(classId.toString())) {
      res.status(403);
      throw new Error("Access denied: You are not assigned to this class");
    }
    queryClassIds = [classId];
  }

  const filter = { class: { $in: queryClassIds } };

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [{ name: regex }, { rollNumber: regex }, { email: regex }];
  }

  const students = await Student.find(filter)
    .populate("class", "name")
    .sort({ rollNumber: 1 });

  res.json({ success: true, count: students.length, students });
});

/**
 * @desc Get attendance sheet for an authorized class
 * @route GET /api/teachers/portal/attendance/sheet
 * @access Private (Teacher)
 */
const getTeacherAttendanceSheet = asyncHandler(async (req, res) => {
  const teacherId = req.user.teacher;
  if (!teacherId) {
    res.status(403);
    throw new Error("Teacher profile not linked");
  }

  const { classId, date } = req.query;
  if (!classId || !date) {
    res.status(400);
    throw new Error("classId and date are required");
  }

  const { authorizedClassIds } = await getTeacherScope(teacherId);
  if (!authorizedClassIds.includes(classId.toString())) {
    res.status(403);
    throw new Error("Access denied: You are not authorized to mark or view attendance for this class");
  }

  const students = await Student.find({ class: classId }).sort({ rollNumber: 1 });
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const records = await Attendance.find({
    date: { $gte: dayStart, $lte: dayEnd },
    student: { $in: students.map((s) => s._id) },
  });

  const recordMap = {};
  records.forEach((r) => {
    recordMap[r.student.toString()] = r.status;
  });

  const sheet = students.map((s) => ({
    student: s,
    status: recordMap[s._id.toString()] || null,
  }));

  res.json({ success: true, sheet });
});

/**
 * @desc Save attendance for an authorized class
 * @route POST /api/teachers/portal/attendance
 * @access Private (Teacher)
 */
const saveTeacherAttendance = asyncHandler(async (req, res) => {
  const teacherId = req.user.teacher;
  if (!teacherId) {
    res.status(403);
    throw new Error("Teacher profile not linked");
  }

  const { classId, date, records } = req.body;
  if (!classId || !date || !Array.isArray(records) || records.length === 0) {
    res.status(400);
    throw new Error("classId, date, and at least one attendance record are required");
  }

  const { authorizedClassIds } = await getTeacherScope(teacherId);
  if (!authorizedClassIds.includes(classId.toString())) {
    res.status(403);
    throw new Error("Access denied: You are not authorized to record attendance for this class");
  }

  // Verify all students belong to this authorized class to prevent IDOR
  const enrolledStudentIds = (
    await Student.find({ class: classId }).select("_id")
  ).map((s) => s._id.toString());

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const savedRecords = [];
  for (const record of records) {
    if (!enrolledStudentIds.includes(record.studentId.toString())) {
      continue; // Skip invalid student ID not enrolled in this class
    }

    const saved = await Attendance.findOneAndUpdate(
      { student: record.studentId, date: dayStart },
      {
        student: record.studentId,
        class: classId,
        date: dayStart,
        status: record.status,
        markedBy: req.user._id,
      },
      { upsert: true, new: true, runValidators: true }
    );
    savedRecords.push(saved);
  }

  res.json({
    success: true,
    message: "Attendance saved successfully",
    count: savedRecords.length,
  });
});

/**
 * @desc View attendance history for teacher's authorized classes
 * @route GET /api/teachers/portal/attendance/history
 * @access Private (Teacher)
 */
const getTeacherAttendanceHistory = asyncHandler(async (req, res) => {
  const teacherId = req.user.teacher;
  if (!teacherId) {
    return res.json({ success: true, count: 0, history: [] });
  }

  const { authorizedClassIds } = await getTeacherScope(teacherId);
  const { classId, date, studentId } = req.query;

  let queryClassIds = authorizedClassIds;
  if (classId) {
    if (!authorizedClassIds.includes(classId.toString())) {
      res.status(403);
      throw new Error("Access denied: You are not assigned to this class");
    }
    queryClassIds = [classId];
  }

  const filter = { class: { $in: queryClassIds } };

  if (studentId) {
    // Verify student belongs to authorized classes
    const validStudent = await Student.findOne({ _id: studentId, class: { $in: authorizedClassIds } });
    if (!validStudent) {
      res.status(403);
      throw new Error("Access denied: Student does not belong to your assigned classes");
    }
    filter.student = studentId;
  }

  if (date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    filter.date = { $gte: dayStart, $lte: dayEnd };
  }

  const history = await Attendance.find(filter)
    .populate("student", "name rollNumber")
    .populate("class", "name")
    .sort({ date: -1 });

  res.json({ success: true, count: history.length, history });
});

/**
 * @desc Get exams for teacher's assigned classes and subjects
 * @route GET /api/teachers/portal/exams
 * @access Private (Teacher)
 */
const getTeacherExams = asyncHandler(async (req, res) => {
  const teacherId = req.user.teacher;
  if (!teacherId) {
    return res.json({ success: true, count: 0, exams: [] });
  }

  const { authorizedClassIds } = await getTeacherScope(teacherId);

  const exams = await Exam.find({ class: { $in: authorizedClassIds } })
    .populate("class", "name")
    .populate("subject", "name code")
    .sort({ examDate: -1 });

  res.json({ success: true, count: exams.length, exams });
});

/**
 * @desc Get marks roster for an exam within teacher's scope
 * @route GET /api/teachers/portal/marks
 * @access Private (Teacher)
 */
const getTeacherMarks = asyncHandler(async (req, res) => {
  const teacherId = req.user.teacher;
  if (!teacherId) {
    return res.json({ success: true, count: 0, marks: [], students: [] });
  }

  const { examId } = req.query;
  if (!examId) {
    res.status(400);
    throw new Error("examId is required");
  }

  const { authorizedClassIds } = await getTeacherScope(teacherId);

  const exam = await Exam.findById(examId)
    .populate("class", "name")
    .populate("subject", "name code");

  if (!exam) {
    res.status(404);
    throw new Error("Exam not found");
  }

  if (!authorizedClassIds.includes(exam.class._id.toString())) {
    res.status(403);
    throw new Error("Access denied: You are not assigned to this exam's class");
  }

  const students = await Student.find({ class: exam.class._id }).sort({ rollNumber: 1 });

  const marks = await Mark.find({ exam: examId })
    .populate("student", "name rollNumber")
    .populate("subject", "name code")
    .sort({ createdAt: -1 });

  res.json({ success: true, exam, students, marks });
});

/**
 * @desc Enter or update mark for an authorized student and exam
 * @route POST /api/teachers/portal/marks
 * @access Private (Teacher)
 */
const saveTeacherMark = asyncHandler(async (req, res) => {
  const teacherId = req.user.teacher;
  if (!teacherId) {
    res.status(403);
    throw new Error("Teacher profile not linked");
  }

  const { studentId, examId, marksObtained, markId } = req.body;
  if (!studentId || !examId || marksObtained === undefined || marksObtained === "") {
    res.status(400);
    throw new Error("studentId, examId, and marksObtained are required");
  }

  const numMarks = Number(marksObtained);
  if (isNaN(numMarks) || numMarks < 0) {
    res.status(400);
    throw new Error("Marks must be a valid non-negative number");
  }

  const { authorizedClassIds } = await getTeacherScope(teacherId);

  const exam = await Exam.findById(examId);
  if (!exam) {
    res.status(404);
    throw new Error("Exam not found");
  }

  if (!authorizedClassIds.includes(exam.class.toString())) {
    res.status(403);
    throw new Error("Access denied: You are not authorized to enter marks for this class");
  }

  if (numMarks > exam.maxMarks) {
    res.status(400);
    throw new Error(`Marks obtained (${numMarks}) cannot exceed maximum marks (${exam.maxMarks})`);
  }

  // Verify student is enrolled in this exam's class
  const student = await Student.findOne({ _id: studentId, class: exam.class });
  if (!student) {
    res.status(403);
    throw new Error("Access denied: Student is not enrolled in this exam's class");
  }

  let mark;
  if (markId) {
    mark = await Mark.findById(markId);
    if (!mark) {
      res.status(404);
      throw new Error("Mark record not found");
    }
    mark.marksObtained = numMarks;
    await mark.save();
  } else {
    // Check if mark already exists (compound unique index)
    mark = await Mark.findOne({ student: studentId, exam: examId, subject: exam.subject });
    if (mark) {
      mark.marksObtained = numMarks;
      await mark.save();
    } else {
      mark = await Mark.create({
        student: studentId,
        exam: examId,
        subject: exam.subject,
        marksObtained: numMarks,
      });
    }
  }

  res.json({ success: true, mark, message: "Marks saved successfully" });
});

module.exports = {
  getTeacherStats,
  getTeacherProfile,
  getAssignedClasses,
  getAssignedStudents,
  getTeacherAttendanceSheet,
  saveTeacherAttendance,
  getTeacherAttendanceHistory,
  getTeacherExams,
  getTeacherMarks,
  saveTeacherMark,
};
