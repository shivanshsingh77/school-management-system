import { useAuth } from "../context/AuthContext";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="dashboard-placeholder">
      <h1>Student Dashboard</h1>
      <p>Welcome, {user?.name} ({user?.role})</p>
      <p className="muted">A dedicated student view (own attendance, fees, results) can be built out further based on your needs.</p>
      <button className="btn btn-secondary" onClick={logout}>Logout</button>
    </div>
  );
}
