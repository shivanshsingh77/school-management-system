import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "../../services/api";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useNotify } from "../../context/NotificationContext";
import { getErrorMessage } from "../../utils/getErrorMessage";

const emptyForm = { name: "", class: "", subject: "", examDate: "", maxMarks: "" };

export default function Exams() {
  const { notify } = useNotify();
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [examsRes, classesRes, subjectsRes] = await Promise.all([api.get("/exams"), api.get("/classes"), api.get("/subjects")]);
      setExams(examsRes.data.exams);
      setClasses(classesRes.data.classes);
      setSubjects(subjectsRes.data.subjects);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to load exams"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (exam) => {
    setEditing(exam);
    setForm({ name: exam.name, class: exam.class?._id || "", subject: exam.subject?._id || "", examDate: exam.examDate ? exam.examDate.slice(0, 10) : "", maxMarks: exam.maxMarks });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.class || !form.subject || !form.examDate || !form.maxMarks) { setError("All fields are required"); return; }
    setSubmitting(true);
    try {
      const payload = { ...form, maxMarks: Number(form.maxMarks) };
      if (editing) {
        await api.put(`/exams/${editing._id}`, payload);
        notify("Exam updated successfully");
      } else {
        await api.post("/exams", payload);
        notify("Exam created successfully");
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save exam"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/exams/${deleteTarget._id}`);
      notify("Exam deleted successfully");
      setDeleteTarget(null);
      load();
    } catch (err) {
      notify(getErrorMessage(err, "Failed to delete exam"), "error");
    }
  };

  const subjectsForClass = subjects.filter((s) => (form.class ? s.class?._id === form.class : true));

  return (
    <div>
      <header className="page-header">
        <div><h1>Exams</h1><p className="page-subtitle">{exams.length} exam(s)</p></div>
        <button className="btn btn-primary btn-inline" onClick={openAdd}><Plus size={16} /> Create Exam</button>
      </header>

      <div className="table-card">
        {loading ? (
          <p className="muted" style={{ padding: 20 }}>Loading...</p>
        ) : exams.length === 0 ? (
          <p className="muted" style={{ padding: 20 }}>No exams yet. Create classes and subjects first.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Exam Name</th><th>Class</th><th>Subject</th><th>Date</th><th>Max Marks</th><th>Actions</th></tr></thead>
            <tbody>
              {exams.map((ex) => (
                <tr key={ex._id}>
                  <td>{ex.name}</td><td>{ex.class?.name}</td><td>{ex.subject?.name} ({ex.subject?.code})</td>
                  <td>{new Date(ex.examDate).toLocaleDateString()}</td><td>{ex.maxMarks}</td>
                  <td>
                    <button className="icon-btn" onClick={() => openEdit(ex)} title="Edit"><Pencil size={16} /></button>
                    <button className="icon-btn icon-btn-danger" onClick={() => setDeleteTarget(ex)} title="Delete"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <Modal title={editing ? "Edit Exam" : "Create Exam"} onClose={() => setShowForm(false)} width={440}>
          <form onSubmit={handleSubmit} className="form-grid">
            {error && <div className="auth-error form-field-full">{error}</div>}
            <div className="form-field form-field-full">
              <label>Exam Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mid-Term Exam" />
            </div>
            <div className="form-field form-field-full">
              <label>Class *</label>
              <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value, subject: "" })}>
                <option value="">Select class</option>
                {classes.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
              </select>
            </div>
            <div className="form-field form-field-full">
              <label>Subject *</label>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                <option value="">Select subject</option>
                {subjectsForClass.map((s) => (<option key={s._id} value={s._id}>{s.name}</option>))}
              </select>
            </div>
            <div className="form-field">
              <label>Exam Date *</label>
              <input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Max Marks *</label>
              <input type="number" min="1" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} />
            </div>
            <div className="auth-actions form-field-full">
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Save"}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog message={`Delete exam "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
