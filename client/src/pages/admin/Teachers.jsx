import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import api from "../../services/api";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import TeacherForm from "../../components/TeacherForm";
import { useNotify } from "../../context/NotificationContext";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function Teachers() {
  const { notify } = useNotify();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async (searchTerm = "") => {
    setLoading(true);
    try {
      const res = await api.get("/teachers", { params: searchTerm ? { search: searchTerm } : {} });
      setTeachers(res.data.teachers);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to load teachers"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const timer = setTimeout(() => load(search), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/teachers/${editing._id}`, formData);
        notify("Teacher updated successfully");
      } else {
        await api.post("/teachers", formData);
        notify("Teacher added successfully");
      }
      setShowForm(false);
      load(search);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to save teacher"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/teachers/${deleteTarget._id}`);
      notify("Teacher deleted successfully");
      setDeleteTarget(null);
      load(search);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to delete teacher"), "error");
    }
  };

  return (
    <div>
      <header className="page-header">
        <div><h1>Teachers</h1><p className="page-subtitle">{teachers.length} teacher(s)</p></div>
        <button className="btn btn-primary btn-inline" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus size={16} /> Add Teacher
        </button>
      </header>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Search by name, email, or subject..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <p className="muted" style={{ padding: 20 }}>Loading...</p>
        ) : teachers.length === 0 ? (
          <p className="muted" style={{ padding: 20 }}>No teachers found. Click "Add Teacher" to create one.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Qualification</th><th>Subject</th><th>Joining Date</th><th>Actions</th></tr></thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t._id}>
                  <td>{t.name}</td><td>{t.email}</td><td>{t.phone || "—"}</td><td>{t.qualification}</td><td>{t.subject}</td>
                  <td>{t.joiningDate ? new Date(t.joiningDate).toLocaleDateString() : "—"}</td>
                  <td>
                    <button className="icon-btn" onClick={() => { setEditing(t); setShowForm(true); }} title="Edit"><Pencil size={16} /></button>
                    <button className="icon-btn icon-btn-danger" onClick={() => setDeleteTarget(t)} title="Delete"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <Modal title={editing ? "Edit Teacher" : "Add Teacher"} onClose={() => setShowForm(false)} width={600}>
          <TeacherForm initialData={editing} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} submitting={submitting} />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog message={`Delete teacher "${deleteTarget.name}"? This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
