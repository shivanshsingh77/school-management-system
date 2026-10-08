import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import api from "../../services/api";
import { useNotify } from "../../context/NotificationContext";
import { getErrorMessage } from "../../utils/getErrorMessage";

const TABS = [
  { key: "students", label: "Student Report" },
  { key: "teachers", label: "Teacher Report" },
  { key: "attendance", label: "Attendance Report" },
  { key: "fees", label: "Fee Report" },
  { key: "marks", label: "Examination Results" },
];

const endpointFor = { students: "/students", teachers: "/teachers", attendance: "/attendance/history", fees: "/fees", marks: "/marks" };
const listKeyFor = { students: "students", teachers: "teachers", attendance: "history", fees: "fees", marks: "marks" };

export default function Reports() {
  const { notify } = useNotify();
  const [tab, setTab] = useState("students");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(endpointFor[tab])
      .then((res) => setData(res.data[listKeyFor[tab]]))
      .catch((err) => notify(getErrorMessage(err, "Failed to load report"), "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const renderTable = () => {
    if (loading) return <p className="muted" style={{ padding: 20 }}>Loading...</p>;
    if (data.length === 0) return <p className="muted" style={{ padding: 20 }}>No data available yet.</p>;

    if (tab === "students") return (
      <table className="data-table">
        <thead><tr><th>Roll No</th><th>Name</th><th>Class</th><th>Gender</th><th>Parent/Guardian</th></tr></thead>
        <tbody>{data.map((s) => (<tr key={s._id}><td>{s.rollNumber}</td><td>{s.name}</td><td>{s.class?.name || "—"}</td><td>{s.gender}</td><td>{s.parentName}</td></tr>))}</tbody>
      </table>
    );

    if (tab === "teachers") return (
      <table className="data-table">
        <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Qualification</th></tr></thead>
        <tbody>{data.map((t) => (<tr key={t._id}><td>{t.name}</td><td>{t.email}</td><td>{t.subject}</td><td>{t.qualification}</td></tr>))}</tbody>
      </table>
    );

    if (tab === "attendance") return (
      <table className="data-table">
        <thead><tr><th>Date</th><th>Student</th><th>Class</th><th>Status</th></tr></thead>
        <tbody>{data.map((h) => (
          <tr key={h._id}>
            <td>{new Date(h.date).toLocaleDateString()}</td>
            <td>{h.student?.name} ({h.student?.rollNumber})</td>
            <td>{h.class?.name}</td>
            <td><span className={`badge ${h.status === "Present" ? "badge-green" : "badge-red"}`}>{h.status}</span></td>
          </tr>
        ))}</tbody>
      </table>
    );

    if (tab === "fees") return (
      <table className="data-table">
        <thead><tr><th>Student</th><th>Total Fees</th><th>Paid</th><th>Pending</th></tr></thead>
        <tbody>{data.map((f) => (
          <tr key={f._id}>
            <td>{f.student?.name} ({f.student?.rollNumber})</td>
            <td>₹{f.totalFees.toLocaleString("en-IN")}</td>
            <td>₹{f.paidAmount.toLocaleString("en-IN")}</td>
            <td>₹{f.pendingAmount.toLocaleString("en-IN")}</td>
          </tr>
        ))}</tbody>
      </table>
    );

    if (tab === "marks") return (
      <table className="data-table">
        <thead><tr><th>Student</th><th>Exam</th><th>Subject</th><th>Marks</th><th>%</th><th>Grade</th></tr></thead>
        <tbody>{data.map((m) => (
          <tr key={m._id}>
            <td>{m.student?.name} ({m.student?.rollNumber})</td>
            <td>{m.exam?.name}</td>
            <td>{m.subject?.name}</td>
            <td>{m.marksObtained} / {m.exam?.maxMarks}</td>
            <td>{m.percentage}%</td>
            <td><span className="badge badge-blue">{m.grade}</span></td>
          </tr>
        ))}</tbody>
      </table>
    );

    return null;
  };

  return (
    <div>
      <header className="page-header">
        <div><h1>Reports</h1><p className="page-subtitle">View and print reports across the system</p></div>
        <button className="btn btn-secondary btn-inline" onClick={() => window.print()}><Printer size={16} /> Print</button>
      </header>

      <div className="toolbar">
        {TABS.map((t) => (<button key={t.key} className={`tab-btn ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>{t.label}</button>))}
      </div>

      <div className="table-card">{renderTable()}</div>
    </div>
  );
}
