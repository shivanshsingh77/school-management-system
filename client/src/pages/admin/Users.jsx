import { useEffect, useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Link as LinkIcon } from "lucide-react";
import api from "../../services/api";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useNotify } from "../../context/NotificationContext";
import { getErrorMessage } from "../../utils/getErrorMessage";

const emptyForm = {
  username: "",
  password: "",
  name: "",
  email: "",
  role: "teacher",
  teacher: "",
  student: "",
};

export default function Users() {
  const { notify } = useNotify();
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, teachersRes, studentsRes] = await Promise.all([
        api.get("/users"),
        api.get("/teachers").catch(() => ({ data: { teachers: [] } })),
        api.get("/students").catch(() => ({ data: { students: [] } })),
      ]);
      setUsers(usersRes.data.users);
      setTeachers(teachersRes.data.teachers || []);
      setStudents(studentsRes.data.students || []);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to load users"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = (newRole) => {
    setForm((prev) => ({
      ...prev,
      role: newRole,
      teacher: "",
      student: "",
    }));
  };

  const handleTeacherSelect = (teacherId) => {
    const t = teachers.find((item) => item._id === teacherId);
    setForm((prev) => ({
      ...prev,
      teacher: teacherId,
      name: prev.name || t?.name || "",
      email: prev.email || t?.email || "",
    }));
  };

  const handleStudentSelect = (studentId) => {
    const s = students.find((item) => item._id === studentId);
    setForm((prev) => ({
      ...prev,
      student: studentId,
      name: prev.name || s?.name || "",
      email: prev.email || s?.email || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username.trim() || !form.password || !form.name.trim()) {
      setError("Username, password, and name are required");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        username: form.username.trim(),
        password: form.password,
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        teacher: form.role === "teacher" && form.teacher ? form.teacher : undefined,
        student: form.role === "student" && form.student ? form.student : undefined,
      };

      await api.post("/users", payload);
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
        <div>
          <h1>Users</h1>
          <p className="page-subtitle">Manage login accounts and profile linkages for admins, teachers, and students</p>
        </div>
        <button className="btn btn-primary btn-inline" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add User
        </button>
      </header>

      <div className="table-card">
        {loading ? (
          <p className="muted" style={{ padding: 20 }}>
            Loading users...
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Role</th>
                <th>Linked Profile</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                let linkedLabel = "—";
                if (u.role === "teacher") {
                  linkedLabel = u.teacher?.name ? (
                    <span className="badge badge-blue">
                      <LinkIcon size={12} /> {u.teacher.name}
                    </span>
                  ) : (
                    <span className="badge badge-orange">Unlinked</span>
                  );
                } else if (u.role === "student") {
                  linkedLabel = u.student?.name ? (
                    <span className="badge badge-blue">
                      <LinkIcon size={12} /> {u.student.name} ({u.student.rollNumber})
                    </span>
                  ) : (
                    <span className="badge badge-orange">Unlinked</span>
                  );
                }

                return (
                  <tr key={u._id}>
                    <td>
                      <strong>{u.username}</strong>
                    </td>
                    <td>{u.name}</td>
                    <td>
                      <span className="badge badge-purple" style={{ textTransform: "capitalize" }}>
                        {u.role}
                      </span>
                    </td>
                    <td>{linkedLabel}</td>
                    <td>
                      <span className={`badge ${u.isActive ? "badge-green" : "badge-red"}`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="icon-btn"
                        title={u.isActive ? "Deactivate" : "Activate"}
                        onClick={() => toggleStatus(u)}
                      >
                        {u.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                      {u.username !== "admin" && (
                        <button
                          className="icon-btn icon-btn-danger"
                          title="Delete"
                          onClick={() => setDeleteTarget(u)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <Modal title="Create User Account" onClose={() => setShowForm(false)} width={460}>
          <form onSubmit={handleSubmit} className="form-grid">
            {error && <div className="auth-error form-field-full">{error}</div>}

            <div className="form-field form-field-full">
              <label>Role *</label>
              <select value={form.role} onChange={(e) => handleRoleChange(e.target.value)}>
                <option value="admin">Administrator</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>

            {form.role === "teacher" && (
              <div className="form-field form-field-full">
                <label>Link to Teacher Profile (Recommended)</label>
                <select value={form.teacher} onChange={(e) => handleTeacherSelect(e.target.value)}>
                  <option value="">Select teacher profile to link...</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.subject} - {t.email})
                    </option>
                  ))}
                </select>
                <span className="field-hint">Links this login to the teacher's assigned classes & attendance records.</span>
              </div>
            )}

            {form.role === "student" && (
              <div className="form-field form-field-full">
                <label>Link to Student Profile (Recommended)</label>
                <select value={form.student} onChange={(e) => handleStudentSelect(e.target.value)}>
                  <option value="">Select student profile to link...</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.rollNumber} - {s.class?.name || "Class"})
                    </option>
                  ))}
                </select>
                <span className="field-hint">Links this login to the student's personal fees, attendance, and grades.</span>
              </div>
            )}

            <div className="form-field form-field-full">
              <label>Username *</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="e.g. rahul.sharma"
              />
            </div>

            <div className="form-field form-field-full">
              <label>Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters"
              />
            </div>

            <div className="form-field form-field-full">
              <label>Full Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full display name"
              />
            </div>

            <div className="form-field form-field-full">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="auth-actions form-field-full">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Creating..." : "Create User"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete user "${deleteTarget.username}"? They will no longer be able to log in.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
