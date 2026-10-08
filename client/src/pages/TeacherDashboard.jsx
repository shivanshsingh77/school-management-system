import { useAuth } from "../context/AuthContext";

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="dashboard-placeholder">
      <h1>Teacher Dashboard</h1>
      <p>Welcome, {user?.name} ({user?.role})</p>
      <p className="muted">A dedicated teacher workspace (assigned classes, attendance, marks entry) can be built out further based on your needs.</p>
      <button className="btn btn-secondary" onClick={logout}>Logout</button>
    </div>
  );
}
