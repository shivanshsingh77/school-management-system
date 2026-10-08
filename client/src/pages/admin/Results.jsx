import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import api from "../../services/api";
import { useNotify } from "../../context/NotificationContext";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function Results() {
  const { notify } = useNotify();
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get("/exams").then((res) => setExams(res.data.exams)).catch(() => {}); }, []);

  const selectedExam = exams.find((e) => e._id === examId);

  const loadStudentsAndMarks = async () => {
    if (!selectedExam) return;
    setLoading(true);
    try {
      const [studentsRes, marksRes] = await Promise.all([
        api.get("/students", { params: { classId: selectedExam.class?._id } }),
        api.get("/marks", { params: { examId } }),
      ]);
      setStudents(studentsRes.data.students);
      const markMap = {};
      marksRes.data.marks.forEach((m) => {
        markMap[m.student._id] = { value: m.marksObtained, markId: m._id, percentage: m.percentage, grade: m.grade };
      });
      setMarks(markMap);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to load students/marks"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStudentsAndMarks(); }, [examId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (studentId, value) => setMarks((prev) => ({ ...prev, [studentId]: { ...prev[studentId], value } }));

  const handleSave = async (studentId) => {
    const entry = marks[studentId];
    if (entry?.value === undefined || entry?.value === "") { notify("Enter marks before saving", "error"); return; }
    const numValue = Number(entry.value);
    if (numValue < 0 || numValue > selectedExam.maxMarks) { notify(`Marks must be between 0 and ${selectedExam.maxMarks}`, "error"); return; }

    try {
      let res;
      if (entry.markId) {
        res = await api.put(`/marks/${entry.markId}`, { marksObtained: numValue });
      } else {
        res = await api.post("/marks", { student: studentId, exam: examId, subject: selectedExam.subject?._id, marksObtained: numValue });
      }
      setMarks((prev) => ({ ...prev, [studentId]: { value: res.data.mark.marksObtained, markId: res.data.mark._id, percentage: res.data.mark.percentage, grade: res.data.mark.grade } }));
      notify("Marks saved successfully");
    } catch (err) {
      notify(getErrorMessage(err, "Failed to save marks"), "error");
    }
  };

  return (
    <div>
      <header className="page-header">
        <div><h1>Marks / Results</h1><p className="page-subtitle">Enter and update student marks per exam</p></div>
      </header>

      <div className="toolbar">
        <select value={examId} onChange={(e) => setExamId(e.target.value)} className="filter-select">
          <option value="">Select an exam</option>
          {exams.map((ex) => (<option key={ex._id} value={ex._id}>{ex.name} — {ex.class?.name} — {ex.subject?.name} (Max: {ex.maxMarks})</option>))}
        </select>
      </div>

      <div className="table-card">
        {!examId ? (
          <p className="muted" style={{ padding: 20 }}>Select an exam to enter marks.</p>
        ) : loading ? (
          <p className="muted" style={{ padding: 20 }}>Loading...</p>
        ) : students.length === 0 ? (
          <p className="muted" style={{ padding: 20 }}>No students found in this class.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Roll No</th><th>Name</th><th>Marks Obtained (/ {selectedExam?.maxMarks})</th><th>Percentage</th><th>Grade</th><th>Actions</th></tr></thead>
            <tbody>
              {students.map((s) => {
                const entry = marks[s._id] || {};
                return (
                  <tr key={s._id}>
                    <td>{s.rollNumber}</td><td>{s.name}</td>
                    <td><input type="number" min="0" max={selectedExam?.maxMarks} value={entry.value ?? ""} onChange={(e) => handleChange(s._id, e.target.value)} className="marks-input" /></td>
                    <td>{entry.percentage !== undefined ? `${entry.percentage}%` : "—"}</td>
                    <td>{entry.grade ? <span className="badge badge-blue">{entry.grade}</span> : "—"}</td>
                    <td><button className="icon-btn" title="Save" onClick={() => handleSave(s._id)}><Save size={16} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
