import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import api from "../../services/api";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useNotify } from "../../context/NotificationContext";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function Classes() {
  const { notify } = useNotify();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", classTeacher: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [classesRes, teachersRes] = await Promise.all([api.get("/classes"), api.get("/teachers")]);
      setClasses(classesRes.data.classes);
      setTeachers(teachersRes.data.teachers);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to load classes"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Class name is required"); return; }
    setSubmitting(true);
    try {
      await api.post("/classes", { name: form.name, classTeacher: form.classTeacher || undefined });
      notify("Class added successfully");
      setShowForm(false);
      setForm({ name: "", classTeacher: "" });
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to add class"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/classes/${deleteTarget._id}`);
      notify("Class deleted successfully");
      setDeleteTarget(null);
      load();
    } catch (err) {
      notify(getErrorMessage(err, "Failed to delete class"), "error");
    }
  };

  return (
    <div>
      <header className="page-header">
        <div><h1>Classes</h1><p className="page-subtitle">{classes.length} class(es)</p></div>
        <button className="btn btn-primary btn-inline" onClick={() => setShowForm(true)}><Plus size={16} /> Add Class</button>
      </header>

      <div className="table-card">
        {loading ? (
          <p className="muted" style={{ padding: 20 }}>Loading...</p>
        ) : classes.length === 0 ? (
          <p className="muted" style={{ padding: 20 }}>No classes yet. e.g. "BCA 1A", "BCA 1B".</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Class Name</th><th>Class Teacher</th><th>Actions</th></tr></thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td><td>{c.classTeacher?.name || "Not assigned"}</td>
                  <td><button className="icon-btn icon-btn-danger" onClick={() => setDeleteTarget(c)} title="Delete"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <Modal title="Add Class" onClose={() => setShowForm(false)} width={420}>
          <form onSubmit={handleSubmit} className="form-grid">
            {error && <div className="auth-error form-field-full">{error}</div>}
            <div className="form-field form-field-full">
              <label>Class Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. BCA 1A" />
            </div>
            <div className="form-field form-field-full">
              <label>Class Teacher</label>
              <select value={form.classTeacher} onChange={(e) => setForm({ ...form, classTeacher: e.target.value })}>
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
        <ConfirmDialog message={`Delete class "${deleteTarget.name}"? Students assigned to it will need to be reassigned.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
