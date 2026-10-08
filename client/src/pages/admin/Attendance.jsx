import { useEffect, useState } from "react";
import { Save, History } from "lucide-react";
import api from "../../services/api";
import { useNotify } from "../../context/NotificationContext";
import { getErrorMessage } from "../../utils/getErrorMessage";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function Attendance() {
  const { notify } = useNotify();
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(todayStr());
  const [sheet, setSheet] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("mark");
  const [history, setHistory] = useState([]);

  useEffect(() => { api.get("/classes").then((res) => setClasses(res.data.classes)).catch(() => {}); }, []);

  const loadSheet = async () => {
    if (!classId || !date) return;
    setLoading(true);
    try {
      const res = await api.get("/attendance/sheet", { params: { classId, date } });
      setSheet(res.data.sheet.map((row) => ({ ...row, status: row.status || "Present" })));
    } catch (err) {
      notify(getErrorMessage(err, "Failed to load attendance sheet"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (view === "mark") loadSheet(); }, [classId, date, view]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (classId) params.classId = classId;
      if (date) params.date = date;
      const res = await api.get("/attendance/history", { params });
      setHistory(res.data.history);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to load attendance history"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (view === "history") loadHistory(); }, [view, classId, date]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleStatus = (studentId, status) => {
    setSheet((prev) => prev.map((row) => (row.student._id === studentId ? { ...row, status } : row)));
  };

  const handleSave = async () => {
    if (!classId || !date) { notify("Select a class and date first", "error"); return; }
    setSaving(true);
    try {
      await api.post("/attendance", { classId, date, records: sheet.map((row) => ({ studentId: row.student._id, status: row.status })) });
      notify("Attendance saved successfully");
    } catch (err) {
      notify(getErrorMessage(err, "Failed to save attendance"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <header className="page-header">
        <div><h1>Attendance</h1><p className="page-subtitle">Mark daily attendance or review history</p></div>
        <div className="toolbar" style={{ margin: 0 }}>
          <button className={`tab-btn ${view === "mark" ? "active" : ""}`} onClick={() => setView("mark")}>Mark Attendance</button>
          <button className={`tab-btn ${view === "history" ? "active" : ""}`} onClick={() => setView("history")}><History size={14} /> History</button>
        </div>
      </header>

      <div className="toolbar">
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className="filter-select">
          <option value="">{view === "history" ? "All classes" : "Select class"}</option>
          {classes.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="filter-select" />
      </div>

      {view === "mark" ? (
        <div className="table-card">
          {!classId ? (
            <p className="muted" style={{ padding: 20 }}>Select a class to mark attendance.</p>
          ) : loading ? (
            <p className="muted" style={{ padding: 20 }}>Loading...</p>
          ) : sheet.length === 0 ? (
            <p className="muted" style={{ padding: 20 }}>No students found in this class.</p>
          ) : (
            <>
              <table className="data-table">
                <thead><tr><th>Roll No</th><th>Name</th><th>Status</th></tr></thead>
                <tbody>
                  {sheet.map((row) => (
                    <tr key={row.student._id}>
                      <td>{row.student.rollNumber}</td><td>{row.student.name}</td>
                      <td>
                        <div className="status-toggle">
                          <button className={`status-pill present ${row.status === "Present" ? "active" : ""}`} onClick={() => toggleStatus(row.student._id, "Present")}>Present</button>
                          <button className={`status-pill absent ${row.status === "Absent" ? "active" : ""}`} onClick={() => toggleStatus(row.student._id, "Absent")}>Absent</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: 16 }}>
                <button className="btn btn-primary btn-inline" onClick={handleSave} disabled={saving}><Save size={16} /> {saving ? "Saving..." : "Save Attendance"}</button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="table-card">
          {loading ? (
            <p className="muted" style={{ padding: 20 }}>Loading...</p>
          ) : history.length === 0 ? (
            <p className="muted" style={{ padding: 20 }}>No attendance records found for this filter.</p>
          ) : (
            <table className="data-table">
              <thead><tr><th>Date</th><th>Student</th><th>Class</th><th>Status</th></tr></thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id}>
                    <td>{new Date(h.date).toLocaleDateString()}</td>
                    <td>{h.student?.name} ({h.student?.rollNumber})</td>
                    <td>{h.class?.name}</td>
                    <td><span className={`badge ${h.status === "Present" ? "badge-green" : "badge-red"}`}>{h.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
