import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import api from "../../services/api";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useNotify } from "../../context/NotificationContext";
import { getErrorMessage } from "../../utils/getErrorMessage";

const emptyForm = { name: "", code: "", class: "", teacher: "" };

export default function Subjects() {
  const { notify } = useNotify();
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [subjectsRes, classesRes, teachersRes] = await Promise.all([api.get("/subjects"), api.get("/classes"), api.get("/teachers")]);
      setSubjects(subjectsRes.data.subjects);
      setClasses(classesRes.data.classes);
      setTeachers(teachersRes.data.teachers);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to load subjects"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.code.trim() || !form.class) { setError("Subject name, code, and class are required"); return; }
    setSubmitting(true);
    try {
      await api.post("/subjects", { ...form, teacher: form.teacher || undefined });
      notify("Subject added successfully");
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to add subject"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/subjects/${deleteTarget._id}`);
      notify("Subject deleted successfully");
      setDeleteTarget(null);
      load();
    } catch (err) {
      notify(getErrorMessage(err, "Failed to delete subject"), "error");
    }
  };

  return (
    <div>
      <header className="page-header">
        <div><h1>Subjects</h1><p className="page-subtitle">{subjects.length} subject(s)</p></div>
        <button className="btn btn-primary btn-inline" onClick={() => setShowForm(true)}><Plus size={16} /> Add Subject</button>
      </header>

      <div className="table-card">
        {loading ? (
          <p className="muted" style={{ padding: 20 }}>Loading...</p>
        ) : subjects.length === 0 ? (
          <p className="muted" style={{ padding: 20 }}>No subjects yet.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Code</th><th>Subject Name</th><th>Class</th><th>Teacher</th><th>Actions</th></tr></thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s._id}>
                  <td>{s.code}</td><td>{s.name}</td><td>{s.class?.name || "—"}</td><td>{s.teacher?.name || "Not assigned"}</td>
                  <td><button className="icon-btn icon-btn-danger" onClick={() => setDeleteTarget(s)} title="Delete"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <Modal title="Add Subject" onClose={() => setShowForm(false)} width={420}>
          <form onSubmit={handleSubmit} className="form-grid">
            {error && <div className="auth-error form-field-full">{error}</div>}
            <div className="form-field form-field-full">
              <label>Subject Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-field form-field-full">
              <label>Subject Code *</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CS101" />
            </div>
            <div className="form-field form-field-full">
              <label>Class *</label>
              <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}>
                <option value="">Select class</option>
                {classes.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
              </select>
            </div>
            <div className="form-field form-field-full">
              <label>Teacher</label>
              <select value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })}>
                <option value="">Not assigned</option>
                {teachers.map((t) => (<option key={t._id} value={t._id}>{t.name}</option>))}
              </select>
            </div>
            <div className="auth-actions form-field-full">
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Save"}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog message={`Delete subject "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
