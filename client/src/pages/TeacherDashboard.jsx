import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  School,
  GraduationCap,
  ClipboardCheck,
  Award,
  FileText,
  UserCheck,
  Save,
  Search,
  History,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotify } from "../context/NotificationContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

const TEACHER_NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "classes", label: "My Classes", icon: School },
  { key: "students", label: "My Students", icon: GraduationCap },
  { key: "attendance", label: "Attendance", icon: ClipboardCheck },
  { key: "marks", label: "Marks Entry", icon: Award },
  { key: "exams", label: "Exam Schedule", icon: FileText },
  { key: "profile", label: "Faculty Profile", icon: UserCheck },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { notify } = useNotify();

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Attendance state
  const [attendanceClassId, setAttendanceClassId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(todayStr());
  const [attendanceSheet, setAttendanceSheet] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceView, setAttendanceView] = useState("mark"); // "mark" | "history"
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  // Marks state
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examMarksData, setExamMarksData] = useState({ exam: null, students: [], marks: [] });
  const [marksMap, setMarksMap] = useState({});
  const [marksLoading, setMarksLoading] = useState(false);

  // Student filter
  const [studentClassFilter, setStudentClassFilter] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  // Load teacher dashboard stats & classes on mount
  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, classesRes, profileRes] = await Promise.all([
        api.get("/teachers/portal/stats"),
        api.get("/teachers/portal/classes"),
        api.get("/teachers/portal/profile").catch(() => ({ data: { teacher: null } })),
      ]);
      setStats(statsRes.data.stats);
      setClasses(classesRes.data.classes || []);
      setProfile(profileRes.data);

      if (classesRes.data.classes?.length > 0 && !attendanceClassId) {
        setAttendanceClassId(classesRes.data.classes[0]._id);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load teacher portal data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load students when students tab is active or filters change
  useEffect(() => {
    if (activeTab === "students") {
      const fetchStudents = async () => {
        try {
          const params = {};
          if (studentClassFilter) params.classId = studentClassFilter;
          if (studentSearch) params.search = studentSearch;
          const res = await api.get("/teachers/portal/students", { params });
          setStudents(res.data.students || []);
        } catch (err) {
          notify(getErrorMessage(err, "Failed to load students"), "error");
        }
      };
      fetchStudents();
    }
  }, [activeTab, studentClassFilter, studentSearch]);

  // Load exams when exams tab or marks tab is active
  useEffect(() => {
    if (activeTab === "exams" || activeTab === "marks") {
      api
        .get("/teachers/portal/exams")
        .then((res) => {
          setExams(res.data.exams || []);
          if (res.data.exams?.length > 0 && !selectedExamId) {
            setSelectedExamId(res.data.exams[0]._id);
          }
        })
        .catch(() => {});
    }
  }, [activeTab]);

  // Load attendance sheet
  const loadAttendanceSheet = async () => {
    if (!attendanceClassId || !attendanceDate) return;
    setAttendanceLoading(true);
    try {
      const res = await api.get("/teachers/portal/attendance/sheet", {
        params: { classId: attendanceClassId, date: attendanceDate },
      });
      setAttendanceSheet(
        res.data.sheet.map((row) => ({
          ...row,
          status: row.status || "Present",
        }))
      );
    } catch (err) {
      notify(getErrorMessage(err, "Failed to load attendance sheet"), "error");
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Load attendance history
  const loadAttendanceHistory = async () => {
    setAttendanceLoading(true);
    try {
      const params = {};
      if (attendanceClassId) params.classId = attendanceClassId;
      if (attendanceDate) params.date = attendanceDate;
      const res = await api.get("/teachers/portal/attendance/history", { params });
      setAttendanceHistory(res.data.history || []);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to load attendance history"), "error");
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "attendance") {
      if (attendanceView === "mark") {
        loadAttendanceSheet();
      } else {
        loadAttendanceHistory();
      }
    }
  }, [activeTab, attendanceClassId, attendanceDate, attendanceView]);

  const toggleAttendanceStatus = (studentId, status) => {
    setAttendanceSheet((prev) =>
      prev.map((row) => (row.student._id === studentId ? { ...row, status } : row))
    );
  };

  const handleSaveAttendance = async () => {
    if (!attendanceClassId || !attendanceDate) {
      notify("Select a class and date first", "error");
      return;
    }
    setAttendanceSaving(true);
    try {
      await api.post("/teachers/portal/attendance", {
        classId: attendanceClassId,
        date: attendanceDate,
        records: attendanceSheet.map((row) => ({
          studentId: row.student._id,
          status: row.status,
        })),
      });
      notify("Attendance saved successfully");
      loadDashboardData();
    } catch (err) {
      notify(getErrorMessage(err, "Failed to save attendance"), "error");
    } finally {
      setAttendanceSaving(false);
    }
  };

  // Load marks for selected exam
  useEffect(() => {
    if (activeTab === "marks" && selectedExamId) {
      setMarksLoading(true);
      api
        .get("/teachers/portal/marks", { params: { examId: selectedExamId } })
        .then((res) => {
          setExamMarksData(res.data);
          const map = {};
          (res.data.marks || []).forEach((m) => {
            map[m.student._id] = {
              value: m.marksObtained,
              markId: m._id,
              percentage: m.percentage,
              grade: m.grade,
            };
          });
          setMarksMap(map);
        })
        .catch((err) => {
          notify(getErrorMessage(err, "Failed to load marks for selected exam"), "error");
        })
        .finally(() => setMarksLoading(false));
    }
  }, [activeTab, selectedExamId]);

  const handleMarkChange = (studentId, value) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        value,
      },
    }));
  };

  const handleSaveMark = async (studentId) => {
    const entry = marksMap[studentId];
    if (entry?.value === undefined || entry?.value === "") {
      notify("Enter marks before saving", "error");
      return;
    }
    const numValue = Number(entry.value);
    const maxMarks = examMarksData.exam?.maxMarks;

    if (numValue < 0 || (maxMarks && numValue > maxMarks)) {
      notify(`Marks must be between 0 and ${maxMarks}`, "error");
      return;
    }

    try {
      const res = await api.post("/teachers/portal/marks", {
        studentId,
        examId: selectedExamId,
        marksObtained: numValue,
        markId: entry.markId,
      });

      setMarksMap((prev) => ({
        ...prev,
        [studentId]: {
          value: res.data.mark.marksObtained,
          markId: res.data.mark._id,
          percentage: res.data.mark.percentage,
          grade: res.data.mark.grade,
        },
      }));
      notify("Mark saved successfully");
    } catch (err) {
      notify(getErrorMessage(err, "Failed to save marks"), "error");
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        navItems={TEACHER_NAV}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        portalTitle="Teacher Portal"
      />

      <main className="app-content">
        {/* Unlinked Profile Notice */}
        {!user?.isProfileLinked && (
          <div className="auth-error" style={{ marginBottom: 20 }}>
            <AlertCircle size={18} />
            <span>
              Your login account is not yet linked to a Faculty record. Please ask an administrator to link your profile in <strong>Admin &gt; Users</strong>.
            </span>
          </div>
        )}

        {/* ==================== TAB 1: OVERVIEW ==================== */}
        {activeTab === "overview" && (
          <div>
            <header className="page-header">
              <div>
                <h1>Teacher Workspace</h1>
                <p className="page-subtitle">Welcome back, {user?.name}</p>
              </div>
            </header>

            {loading ? (
              <p className="muted">Loading dashboard metrics...</p>
            ) : error ? (
              <div className="auth-error">{error}</div>
            ) : (
              <>
                <div className="stat-grid">
                  <StatCard
                    icon={School}
                    label="Assigned Classes"
                    value={stats?.totalAssignedClasses ?? 0}
                    tone="blue"
                  />
                  <StatCard
                    icon={GraduationCap}
                    label="Students Taught"
                    value={stats?.totalStudents ?? 0}
                    tone="purple"
                  />
                  <StatCard
                    icon={Award}
                    label="Assigned Subjects"
                    value={stats?.totalSubjects ?? 0}
                    tone="orange"
                  />
                  <StatCard
                    icon={ClipboardCheck}
                    label="Today's Attendance"
                    value={stats?.todaysAttendanceMarked ?? 0}
                    tone="green"
                  />
                </div>

                <div className="table-card">
                  <div className="modal-header" style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <h2>My Assigned Classes Overview</h2>
                  </div>
                  {classes.length === 0 ? (
                    <div className="empty-state">
                      <School size={36} />
                      <h3>No Assigned Classes Yet</h3>
                      <p>You have not been assigned as a class teacher or subject teacher yet.</p>
                    </div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Class Name</th>
                          <th>Role in Class</th>
                          <th>Enrolled Students</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classes.map((c) => (
                          <tr key={c._id}>
                            <td>
                              <strong>{c.name}</strong>
                            </td>
                            <td>
                              {c.isClassTeacher ? (
                                <span className="badge badge-green">Class Teacher</span>
                              ) : (
                                <span className="badge badge-blue">Subject Teacher</span>
                              )}
                            </td>
                            <td>{c.studentCount} student(s)</td>
                            <td>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  setAttendanceClassId(c._id);
                                  setActiveTab("attendance");
                                }}
                              >
                                Take Attendance
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ==================== TAB 2: MY CLASSES ==================== */}
        {activeTab === "classes" && (
          <div>
            <header className="page-header">
              <div>
                <h1>Assigned Classes</h1>
                <p className="page-subtitle">Classes where you instruct or serve as Class Teacher</p>
              </div>
            </header>

            <div className="table-card">
              {classes.length === 0 ? (
                <div className="empty-state">
                  <School size={36} />
                  <h3>No Classes Assigned</h3>
                  <p>Contact your school administrator to configure class assignments.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Class Name</th>
                      <th>Class Teacher</th>
                      <th>Total Enrolled</th>
                      <th>Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <strong>{c.name}</strong>
                        </td>
                        <td>
                          {c.isClassTeacher ? (
                            <span className="badge badge-green">You are Class Teacher</span>
                          ) : (
                            c.classTeacher?.name || "Not assigned"
                          )}
                        </td>
                        <td>
                          <span className="badge badge-purple">{c.studentCount} Students</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setStudentClassFilter(c._id);
                                setActiveTab("students");
                              }}
                            >
                              View Roster
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setAttendanceClassId(c._id);
                                setActiveTab("attendance");
                              }}
                            >
                              Attendance
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: MY STUDENTS ==================== */}
        {activeTab === "students" && (
          <div>
            <header className="page-header">
              <div>
                <h1>Students</h1>
                <p className="page-subtitle">Students belonging only to your assigned classes</p>
              </div>
            </header>

            <div className="toolbar">
              <div className="search-box">
                <Search size={16} />
                <input
                  placeholder="Search by student name or roll number..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>

              <select
                className="filter-select"
                value={studentClassFilter}
                onChange={(e) => setStudentClassFilter(e.target.value)}
              >
                <option value="">All My Classes</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="table-card">
              {students.length === 0 ? (
                <div className="empty-state">
                  <GraduationCap size={36} />
                  <h3>No Students Found</h3>
                  <p>No students match your filter criteria.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Full Name</th>
                      <th>Class</th>
                      <th>Gender</th>
                      <th>Parent / Guardian</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s._id}>
                        <td>
                          <strong>{s.rollNumber}</strong>
                        </td>
                        <td>{s.name}</td>
                        <td>
                          <span className="badge badge-blue">{s.class?.name || "—"}</span>
                        </td>
                        <td>{s.gender}</td>
                        <td>{s.parentName || "—"}</td>
                        <td>{s.phone || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: ATTENDANCE ==================== */}
        {activeTab === "attendance" && (
          <div>
            <header className="page-header">
              <div>
                <h1>Daily Attendance</h1>
                <p className="page-subtitle">Mark and review attendance for your authorized classes</p>
              </div>
              <div className="toolbar" style={{ margin: 0 }}>
                <button
                  className={`tab-btn ${attendanceView === "mark" ? "active" : ""}`}
                  onClick={() => setAttendanceView("mark")}
                >
                  Mark Attendance
                </button>
                <button
                  className={`tab-btn ${attendanceView === "history" ? "active" : ""}`}
                  onClick={() => setAttendanceView("history")}
                >
                  <History size={14} /> Attendance History
                </button>
              </div>
            </header>

            <div className="toolbar">
              <select
                className="filter-select"
                value={attendanceClassId}
                onChange={(e) => setAttendanceClassId(e.target.value)}
              >
                {classes.length === 0 && <option value="">No classes available</option>}
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="filter-select"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
            </div>

            {attendanceView === "mark" ? (
              <div className="table-card">
                {!attendanceClassId ? (
                  <p className="muted" style={{ padding: 20 }}>
                    Select a class to mark attendance.
                  </p>
                ) : attendanceLoading ? (
                  <p className="muted" style={{ padding: 20 }}>
                    Loading attendance roster...
                  </p>
                ) : attendanceSheet.length === 0 ? (
                  <div className="empty-state">
                    <ClipboardCheck size={36} />
                    <h3>No Students Enrolled</h3>
                    <p>There are no students enrolled in this class.</p>
                  </div>
                ) : (
                  <>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Roll No</th>
                          <th>Student Name</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceSheet.map((row) => (
                          <tr key={row.student._id}>
                            <td>
                              <strong>{row.student.rollNumber}</strong>
                            </td>
                            <td>{row.student.name}</td>
                            <td>
                              <div className="status-toggle">
                                <button
                                  type="button"
                                  className={`status-pill present ${
                                    row.status === "Present" ? "active" : ""
                                  }`}
                                  onClick={() =>
                                    toggleAttendanceStatus(row.student._id, "Present")
                                  }
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  className={`status-pill absent ${
                                    row.status === "Absent" ? "active" : ""
                                  }`}
                                  onClick={() =>
                                    toggleAttendanceStatus(row.student._id, "Absent")
                                  }
                                >
                                  Absent
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{ padding: 18, borderTop: "1px solid #f1f5f9" }}>
                      <button
                        className="btn btn-primary btn-inline"
                        onClick={handleSaveAttendance}
                        disabled={attendanceSaving}
                      >
                        <Save size={16} />
                        {attendanceSaving ? "Saving..." : "Save Attendance"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="table-card">
                {attendanceLoading ? (
                  <p className="muted" style={{ padding: 20 }}>
                    Loading history...
                  </p>
                ) : attendanceHistory.length === 0 ? (
                  <div className="empty-state">
                    <History size={36} />
                    <h3>No Records Found</h3>
                    <p>No attendance records match your filter criteria.</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Student</th>
                        <th>Class</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceHistory.map((h) => (
                        <tr key={h._id}>
                          <td>{new Date(h.date).toLocaleDateString()}</td>
                          <td>
                            {h.student?.name} ({h.student?.rollNumber})
                          </td>
                          <td>{h.class?.name}</td>
                          <td>
                            <span
                              className={`badge ${
                                h.status === "Present" ? "badge-green" : "badge-red"
                              }`}
                            >
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 5: MARKS ENTRY ==================== */}
        {activeTab === "marks" && (
          <div>
            <header className="page-header">
              <div>
                <h1>Marks Entry</h1>
                <p className="page-subtitle">Enter and update student examination marks</p>
              </div>
            </header>

            <div className="toolbar">
              <select
                className="filter-select"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
              >
                <option value="">Select an examination...</option>
                {exams.map((ex) => (
                  <option key={ex._id} value={ex._id}>
                    {ex.name} — {ex.class?.name} — {ex.subject?.name} (Max: {ex.maxMarks})
                  </option>
                ))}
              </select>
            </div>

            <div className="table-card">
              {!selectedExamId ? (
                <p className="muted" style={{ padding: 20 }}>
                  Please select an exam from the dropdown above to grade students.
                </p>
              ) : marksLoading ? (
                <p className="muted" style={{ padding: 20 }}>
                  Loading examination roster...
                </p>
              ) : examMarksData.students?.length === 0 ? (
                <div className="empty-state">
                  <Award size={36} />
                  <h3>No Students Found</h3>
                  <p>There are no enrolled students in this exam's class.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Marks Obtained (/ {examMarksData.exam?.maxMarks})</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examMarksData.students.map((s) => {
                      const entry = marksMap[s._id] || {};
                      return (
                        <tr key={s._id}>
                          <td>
                            <strong>{s.rollNumber}</strong>
                          </td>
                          <td>{s.name}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max={examMarksData.exam?.maxMarks}
                              className="marks-input"
                              value={entry.value ?? ""}
                              onChange={(e) => handleMarkChange(s._id, e.target.value)}
                              placeholder={`0 - ${examMarksData.exam?.maxMarks}`}
                            />
                          </td>
                          <td>{entry.percentage !== undefined ? `${entry.percentage}%` : "—"}</td>
                          <td>
                            {entry.grade ? (
                              <span className="badge badge-blue">{entry.grade}</span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td>
                            <button
                              className="icon-btn"
                              title="Save Marks"
                              onClick={() => handleSaveMark(s._id)}
                            >
                              <Save size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 6: EXAM SCHEDULE ==================== */}
        {activeTab === "exams" && (
          <div>
            <header className="page-header">
              <div>
                <h1>Scheduled Exams</h1>
                <p className="page-subtitle">Exams scheduled for your assigned classes and subjects</p>
              </div>
            </header>

            <div className="table-card">
              {exams.length === 0 ? (
                <div className="empty-state">
                  <FileText size={36} />
                  <h3>No Exams Scheduled</h3>
                  <p>There are no exams scheduled for your classes currently.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Exam Name</th>
                      <th>Class</th>
                      <th>Subject</th>
                      <th>Exam Date</th>
                      <th>Maximum Marks</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((ex) => (
                      <tr key={ex._id}>
                        <td>
                          <strong>{ex.name}</strong>
                        </td>
                        <td>
                          <span className="badge badge-blue">{ex.class?.name}</span>
                        </td>
                        <td>
                          {ex.subject?.name} ({ex.subject?.code})
                        </td>
                        <td>{new Date(ex.examDate).toLocaleDateString()}</td>
                        <td>{ex.maxMarks} marks</td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setSelectedExamId(ex._id);
                              setActiveTab("marks");
                            }}
                          >
                            Enter Marks
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 7: FACULTY PROFILE ==================== */}
        {activeTab === "profile" && (
          <div>
            <header className="page-header">
              <div>
                <h1>Faculty Profile</h1>
                <p className="page-subtitle">Your personal teaching credentials and assignments</p>
              </div>
            </header>

            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar-large">
                  {user?.name?.[0]?.toUpperCase() || "T"}
                </div>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: 20 }}>{user?.name}</h2>
                  <span className="badge badge-purple" style={{ textTransform: "capitalize" }}>
                    Teacher / Faculty
                  </span>
                </div>
              </div>

              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <label>Full Name</label>
                  <span>{profile?.teacher?.name || user?.name}</span>
                </div>
                <div className="profile-info-item">
                  <label>Email Address</label>
                  <span>{profile?.teacher?.email || user?.email || "—"}</span>
                </div>
                <div className="profile-info-item">
                  <label>Phone Number</label>
                  <span>{profile?.teacher?.phone || "—"}</span>
                </div>
                <div className="profile-info-item">
                  <label>Subject Specialization</label>
                  <span>{profile?.teacher?.subject || "—"}</span>
                </div>
                <div className="profile-info-item">
                  <label>Academic Qualification</label>
                  <span>{profile?.teacher?.qualification || "—"}</span>
                </div>
                <div className="profile-info-item">
                  <label>Joining Date</label>
                  <span>
                    {profile?.teacher?.joiningDate
                      ? new Date(profile.teacher.joiningDate).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <div className="profile-info-item" style={{ gridColumn: "1 / -1" }}>
                  <label>Residential Address</label>
                  <span>{profile?.teacher?.address || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
