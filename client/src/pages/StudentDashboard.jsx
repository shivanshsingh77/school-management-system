import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  UserCheck,
  ClipboardCheck,
  Wallet,
  Award,
  FileText,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  School,
  GraduationCap,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotify } from "../context/NotificationContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

const STUDENT_NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "profile", label: "My Profile", icon: UserCheck },
  { key: "attendance", label: "Attendance Record", icon: ClipboardCheck },
  { key: "fees", label: "Fees & Dues", icon: Wallet },
  { key: "marks", label: "Marks & Grades", icon: Award },
  { key: "exams", label: "Exam Schedule", icon: FileText },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const { notify } = useNotify();

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [attendanceData, setAttendanceData] = useState({ history: [], summary: {} });
  const [feeData, setFeeData] = useState({ fee: null, payments: [], totalFees: 0, paidAmount: 0, pendingAmount: 0 });
  const [marks, setMarks] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStudentData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, profileRes] = await Promise.all([
        api.get("/students/portal/stats"),
        api.get("/students/portal/profile").catch(() => ({ data: { student: null } })),
      ]);
      setStats(statsRes.data.stats);
      setProfile(profileRes.data.student);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load student dashboard"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  // Lazy load specific tab details when clicked
  useEffect(() => {
    if (activeTab === "attendance") {
      api
        .get("/students/portal/attendance")
        .then((res) => setAttendanceData(res.data))
        .catch((err) => notify(getErrorMessage(err, "Failed to load attendance"), "error"));
    } else if (activeTab === "fees") {
      api
        .get("/students/portal/fees")
        .then((res) => setFeeData(res.data))
        .catch((err) => notify(getErrorMessage(err, "Failed to load fee information"), "error"));
    } else if (activeTab === "marks") {
      api
        .get("/students/portal/marks")
        .then((res) => setMarks(res.data.marks || []))
        .catch((err) => notify(getErrorMessage(err, "Failed to load marks"), "error"));
    } else if (activeTab === "exams") {
      api
        .get("/students/portal/exams")
        .then((res) => setExams(res.data.exams || []))
        .catch((err) => notify(getErrorMessage(err, "Failed to load exam schedule"), "error"));
    }
  }, [activeTab]);

  return (
    <div className="app-shell">
      <Sidebar
        navItems={STUDENT_NAV}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        portalTitle="Student Portal"
      />

      <main className="app-content">
        {/* Unlinked Profile Notice */}
        {!user?.isProfileLinked && (
          <div className="auth-error" style={{ marginBottom: 20 }}>
            <AlertCircle size={18} />
            <span>
              Your student login is not yet linked to an enrolled student record. Please contact the administration office.
            </span>
          </div>
        )}

        {/* ==================== TAB 1: OVERVIEW ==================== */}
        {activeTab === "overview" && (
          <div>
            <header className="page-header">
              <div>
                <h1>Student Dashboard</h1>
                <p className="page-subtitle">Welcome back, {user?.name}</p>
              </div>
            </header>

            {loading ? (
              <p className="muted">Loading student information...</p>
            ) : error ? (
              <div className="auth-error">{error}</div>
            ) : (
              <>
                <div className="stat-grid">
                  <StatCard
                    icon={ClipboardCheck}
                    label="Attendance Rate"
                    value={`${stats?.attendancePercentage ?? 100}%`}
                    tone={stats?.attendancePercentage >= 75 ? "green" : "orange"}
                  />
                  <StatCard
                    icon={Wallet}
                    label="Pending Fees"
                    value={`₹${(stats?.pendingFees ?? 0).toLocaleString("en-IN")}`}
                    tone={stats?.pendingFees > 0 ? "orange" : "green"}
                  />
                  <StatCard
                    icon={Award}
                    label="Academic Performance"
                    value={stats?.averageMarksPercentage ? `${stats.averageMarksPercentage}%` : "—"}
                    tone="blue"
                  />
                  <StatCard
                    icon={GraduationCap}
                    label="Overall Grade"
                    value={stats?.overallGrade ?? "—"}
                    tone="purple"
                  />
                </div>

                {/* Profile Snapshot Card */}
                {profile && (
                  <div className="profile-card">
                    <div className="profile-header">
                      <div className="profile-avatar-large">
                        {profile.name?.[0]?.toUpperCase() || "S"}
                      </div>
                      <div>
                        <h2 style={{ margin: "0 0 4px", fontSize: 20 }}>{profile.name}</h2>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span className="badge badge-blue">
                            Roll No: {profile.rollNumber}
                          </span>
                          <span className="badge badge-purple">
                            Class: {profile.class?.name || "Enrolled"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="profile-info-grid">
                      <div className="profile-info-item">
                        <label>Enrolled Class</label>
                        <span>{profile.class?.name || "—"}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>Class Teacher</label>
                        <span>{profile.class?.classTeacher?.name || "Not assigned"}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>Parent / Guardian</label>
                        <span>{profile.parentName || "—"}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>Contact Phone</label>
                        <span>{profile.phone || "—"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ==================== TAB 2: MY PROFILE ==================== */}
        {activeTab === "profile" && (
          <div>
            <header className="page-header">
              <div>
                <h1>Personal Profile</h1>
                <p className="page-subtitle">Your student enrollment records and contact details</p>
              </div>
            </header>

            {!profile ? (
              <div className="empty-state">
                <UserCheck size={36} />
                <h3>No Profile Linked</h3>
                <p>No enrollment profile is associated with this login account.</p>
              </div>
            ) : (
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar-large">
                    {profile.name?.[0]?.toUpperCase() || "S"}
                  </div>
                  <div>
                    <h2 style={{ margin: "0 0 4px", fontSize: 20 }}>{profile.name}</h2>
                    <span className="badge badge-blue">Enrolled Student</span>
                  </div>
                </div>

                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <label>Roll Number</label>
                    <span>{profile.rollNumber}</span>
                  </div>
                  <div className="profile-info-item">
                    <label>Full Name</label>
                    <span>{profile.name}</span>
                  </div>
                  <div className="profile-info-item">
                    <label>Class</label>
                    <span>{profile.class?.name || "—"}</span>
                  </div>
                  <div className="profile-info-item">
                    <label>Class Teacher</label>
                    <span>{profile.class?.classTeacher?.name || "Not assigned"}</span>
                  </div>
                  <div className="profile-info-item">
                    <label>Gender</label>
                    <span>{profile.gender || "—"}</span>
                  </div>
                  <div className="profile-info-item">
                    <label>Date of Birth</label>
                    <span>
                      {profile.dateOfBirth
                        ? new Date(profile.dateOfBirth).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                  <div className="profile-info-item">
                    <label>Parent / Guardian</label>
                    <span>{profile.parentName}</span>
                  </div>
                  <div className="profile-info-item">
                    <label>Phone Number</label>
                    <span>{profile.phone || "—"}</span>
                  </div>
                  <div className="profile-info-item">
                    <label>Email Address</label>
                    <span>{profile.email || "—"}</span>
                  </div>
                  <div className="profile-info-item">
                    <label>Admission Date</label>
                    <span>
                      {profile.admissionDate
                        ? new Date(profile.admissionDate).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                  <div className="profile-info-item" style={{ gridColumn: "1 / -1" }}>
                    <label>Residential Address</label>
                    <span>{profile.address || "—"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 3: ATTENDANCE ==================== */}
        {activeTab === "attendance" && (
          <div>
            <header className="page-header">
              <div>
                <h1>Attendance History</h1>
                <p className="page-subtitle">Your daily attendance log and cumulative percentage</p>
              </div>
            </header>

            <div className="stat-grid">
              <StatCard
                icon={ClipboardCheck}
                label="Attendance Rate"
                value={`${attendanceData.summary?.percentage ?? 100}%`}
                tone={attendanceData.summary?.percentage >= 75 ? "green" : "orange"}
              />
              <StatCard
                icon={CheckCircle2}
                label="Days Present"
                value={attendanceData.summary?.present ?? 0}
                tone="teal"
              />
              <StatCard
                icon={AlertCircle}
                label="Days Absent"
                value={attendanceData.summary?.absent ?? 0}
                tone="orange"
              />
              <StatCard
                icon={Calendar}
                label="Total Recorded Sessions"
                value={attendanceData.summary?.total ?? 0}
                tone="blue"
              />
            </div>

            <div className="table-card">
              {attendanceData.history?.length === 0 ? (
                <div className="empty-state">
                  <ClipboardCheck size={36} />
                  <h3>No Attendance Records Yet</h3>
                  <p>Attendance records will show up here once marked by your teachers.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Class</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.history.map((record) => (
                      <tr key={record._id}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>{record.class?.name || "—"}</td>
                        <td>
                          <span
                            className={`badge ${
                              record.status === "Present" ? "badge-green" : "badge-red"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: FEES & DUES ==================== */}
        {activeTab === "fees" && (
          <div>
            <header className="page-header">
              <div>
                <h1>Fees &amp; Dues Status</h1>
                <p className="page-subtitle">Overview of tuition fees, payments, and remaining balance</p>
              </div>
            </header>

            <div className="stat-grid">
              <StatCard
                icon={Wallet}
                label="Total Tuition Fees"
                value={`₹${(feeData.totalFees ?? 0).toLocaleString("en-IN")}`}
                tone="blue"
              />
              <StatCard
                icon={CheckCircle2}
                label="Total Paid"
                value={`₹${(feeData.paidAmount ?? 0).toLocaleString("en-IN")}`}
                tone="green"
              />
              <StatCard
                icon={Clock}
                label="Pending Balance"
                value={`₹${(feeData.pendingAmount ?? 0).toLocaleString("en-IN")}`}
                tone={feeData.pendingAmount > 0 ? "orange" : "green"}
              />
            </div>

            <div className="table-card">
              <div className="modal-header" style={{ borderBottom: "1px solid #e2e8f0" }}>
                <h2>Payment History &amp; Receipts</h2>
                {feeData.pendingAmount === 0 && feeData.totalFees > 0 ? (
                  <span className="badge badge-green">All Dues Cleared</span>
                ) : feeData.pendingAmount > 0 ? (
                  <span className="badge badge-orange">Balance Due</span>
                ) : null}
              </div>

              {feeData.payments?.length === 0 ? (
                <div className="empty-state">
                  <Wallet size={36} />
                  <h3>No Payments Recorded</h3>
                  <p>No fee payments have been registered for your account yet.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Receipt #</th>
                      <th>Payment Date</th>
                      <th>Amount Paid</th>
                      <th>Notes / Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeData.payments.map((p, idx) => (
                      <tr key={p._id || idx}>
                        <td>
                          <strong>#{idx + 1}</strong>
                        </td>
                        <td>{new Date(p.date).toLocaleDateString()}</td>
                        <td>
                          <strong>₹{p.amount?.toLocaleString("en-IN")}</strong>
                        </td>
                        <td>{p.note || "Tuition fee payment"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 5: MARKS & RESULTS ==================== */}
        {activeTab === "marks" && (
          <div>
            <header className="page-header">
              <div>
                <h1>Marks &amp; Results</h1>
                <p className="page-subtitle">Examination scores, percentages, and grade cards</p>
              </div>
            </header>

            <div className="table-card">
              {marks.length === 0 ? (
                <div className="empty-state">
                  <Award size={36} />
                  <h3>No Results Available</h3>
                  <p>Examination results have not been posted yet.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Examination</th>
                      <th>Subject</th>
                      <th>Subject Code</th>
                      <th>Marks Obtained</th>
                      <th>Percentage</th>
                      <th>Letter Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((m) => (
                      <tr key={m._id}>
                        <td>
                          <strong>{m.exam?.name}</strong>
                        </td>
                        <td>{m.subject?.name}</td>
                        <td>
                          <span className="badge badge-purple">{m.subject?.code}</span>
                        </td>
                        <td>
                          {m.marksObtained} / {m.exam?.maxMarks}
                        </td>
                        <td>
                          <strong>{m.percentage}%</strong>
                        </td>
                        <td>
                          <span className="badge badge-blue">{m.grade}</span>
                        </td>
                      </tr>
                    ))}
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
                <h1>Upcoming Examination Schedule</h1>
                <p className="page-subtitle">Scheduled examinations and tests for your class</p>
              </div>
            </header>

            <div className="table-card">
              {exams.length === 0 ? (
                <div className="empty-state">
                  <FileText size={36} />
                  <h3>No Scheduled Exams</h3>
                  <p>There are no examinations currently scheduled for your class.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Examination Name</th>
                      <th>Subject</th>
                      <th>Class</th>
                      <th>Exam Date</th>
                      <th>Maximum Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((ex) => (
                      <tr key={ex._id}>
                        <td>
                          <strong>{ex.name}</strong>
                        </td>
                        <td>
                          {ex.subject?.name} ({ex.subject?.code})
                        </td>
                        <td>
                          <span className="badge badge-blue">{ex.class?.name}</span>
                        </td>
                        <td>{new Date(ex.examDate).toLocaleDateString()}</td>
                        <td>{ex.maxMarks} marks</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
