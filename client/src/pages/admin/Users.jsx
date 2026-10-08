import { useEffect, useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import api from "../../services/api";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useNotify } from "../../context/NotificationContext";
import { getErrorMessage } from "../../utils/getErrorMessage";

const emptyForm = { username: "", password: "", name: "", email: "", role: "teacher" };

export default function Users() {
  const { notify } = useNotify();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data.users);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to load users"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username.trim() || !form.password || !form.name.trim()) { setError("Username, password, and name are required"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setSubmitting(true);
    try {
      await api.post("/users", form);
      notify("User account created successfully");
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create user"));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.put(`/users/${user._id}/status`, { isActive: !user.isActive });
      notify(`User ${user.isActive ? "deactivated" : "activated"} successfully`);
      load();
    } catch (err) {
      notify(getErrorMessage(err, "Failed to update user status"), "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteTarget._id}`);
      notify("User deleted successfully");
      setDeleteTarget(null);
      load();
    } catch (err) {
      notify(getErrorMessage(err, "Failed to delete user"), "error");
    }
  };

  return (
    <div>
      <header className="page-header">
        <div><h1>Users</h1><p className="page-subtitle">Manage login accounts for admins, teachers, and students</p></div>
        <button className="btn btn-primary btn-inline" onClick={() => setShowForm(true)}><Plus size={16} /> Add User</button>
      </header>

      <div className="table-card">
        {loading ? (
          <p className="muted" style={{ padding: 20 }}>Loading...</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.username}</td><td>{u.name}</td><td style={{ textTransform: "capitalize" }}>{u.role}</td>
                  <td><span className={`badge ${u.isActive ? "badge-green" : "badge-red"}`}>{u.isActive ? "Active" : "Inactive"}</span></td>
                  <td>
                    <button className="icon-btn" title={u.isActive ? "Deactivate" : "Activate"} onClick={() => toggleStatus(u)}>
                      {u.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    {u.username !== "admin" && (<button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeleteTarget(u)}><Trash2 size={16} /></button>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <Modal title="Add User" onClose={() => setShowForm(false)} width={420}>
          <form onSubmit={handleSubmit} className="form-grid">
            {error && <div className="auth-error form-field-full">{error}</div>}
            <div className="form-field form-field-full"><label>Username *</label><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
            <div className="form-field form-field-full"><label>Password *</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div className="form-field form-field-full"><label>Full Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-field form-field-full"><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="form-field form-field-full">
              <label>Role *</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Admin</option><option value="teacher">Teacher</option><option value="student">Student</option>
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
        <ConfirmDialog message={`Delete user "${deleteTarget.username}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
