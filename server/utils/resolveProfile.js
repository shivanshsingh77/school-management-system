const Teacher = require("../models/Teacher");
const Student = require("../models/Student");

/**
 * Safely resolves and verifies user profile linkage.
 * - For teachers: verifies existing teacher ObjectId, or safely matches by email if EXACTLY ONE matching Teacher exists.
 * - For students: verifies existing student ObjectId, or safely matches by email if EXACTLY ONE matching Student exists.
 * - Does NOT silently link ambiguous (count > 1) or unmatched (count === 0) records.
 */
async function resolveUserProfile(user) {
  if (!user) return null;

  if (user.role === "teacher") {
    let linkedTeacher = null;
    if (user.teacher) {
      linkedTeacher = await Teacher.findById(user.teacher);
      if (!linkedTeacher) {
        user.teacher = undefined;
        await user.save();
      }
    }

    if (!linkedTeacher && user.email) {
      const normalizedEmail = user.email.toLowerCase().trim();
      const matches = await Teacher.find({ email: normalizedEmail });
      if (matches.length === 1) {
        user.teacher = matches[0]._id;
        await user.save();
        linkedTeacher = matches[0];
      }
    }

    return linkedTeacher;
  }

  if (user.role === "student") {
    let linkedStudent = null;
    if (user.student) {
      linkedStudent = await Student.findById(user.student).populate("class", "name");
      if (!linkedStudent) {
        user.student = undefined;
        await user.save();
      }
    }

    if (!linkedStudent && user.email) {
      const normalizedEmail = user.email.toLowerCase().trim();
      const matches = await Student.find({ email: normalizedEmail }).populate("class", "name");
      if (matches.length === 1) {
        user.student = matches[0]._id;
        await user.save();
        linkedStudent = matches[0];
      }
    }

    return linkedStudent;
  }

  return null;
}

module.exports = resolveUserProfile;
