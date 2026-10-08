import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import api from "../../services/api";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import StudentForm from "../../components/StudentForm";
import { useNotify } from "../../context/NotificationContext";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function Students() {
  const { notify } = useNotify();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadStudents = async (searchTerm = "") => {
    setLoading(true);
    try {
      const res = await api.get("/students", { params: searchTerm ? { search: searchTerm } : {} });
      setStudents(res.data.students);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to load students"), "error");
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const res = await api.get("/classes");
      setClasses(res.data.classes);
    } catch {}
  };

  useEffect(() => { loadStudents(); loadClasses(); }, []);
  useEffect(() => {
    const timer = setTimeout(() => loadStudents(search), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/students/${editing._id}`, formData);
        notify("Student updated successfully");
      } else {
        await api.post("/students", formData);
        notify("Student added successfully");
      }
      setShowForm(false);
      loadStudents(search);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to save student"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/students/${deleteTarget._id}`);
      notify("Student deleted successfully");
      setDeleteTarget(null);
      loadStudents(search);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to delete student"), "error");
    }
  };

  return (
    <div>
      <header className="page-header">
        <div><h1>Students</h1><p className="page-subtitle">{students.length} student(s)</p></div>
        <button className="btn btn-primary btn-inline" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus size={16} /> Add Student
        </button>
      </header>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Search by name or roll number..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <p className="muted" style={{ padding: 20 }}>Loading...</p>
        ) : students.length === 0 ? (
          <p className="muted" style={{ padding: 20 }}>No students found. Click "Add Student" to create one.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Roll No</th><th>Name</th><th>Class</th><th>Gender</th><th>Phone</th><th>Email</th><th>Actions</th></tr></thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td>{s.rollNumber}</td><td>{s.name}</td><td>{s.class?.name || "—"}</td><td>{s.gender}</td><td>{s.phone || "—"}</td><td>{s.email || "—"}</td>
                  <td>
                    <button className="icon-btn" onClick={() => { setEditing(s); setShowForm(true); }} title="Edit"><Pencil size={16} /></button>
                    <button className="icon-btn icon-btn-danger" onClick={() => setDeleteTarget(s)} title="Delete"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <Modal title={editing ? "Edit Student" : "Add Student"} onClose={() => setShowForm(false)} width={600}>
          <StudentForm initialData={editing} classes={classes} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} submitting={submitting} />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog message={`Delete student "${deleteTarget.name}"? This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
