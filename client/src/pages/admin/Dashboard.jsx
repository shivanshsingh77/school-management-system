import { useEffect, useState } from "react";
import { GraduationCap, Users, School, Wallet, ClipboardCheck } from "lucide-react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/admin-stats")
      .then((res) => setStats(res.data.stats))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard stats"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}</p>
        </div>
      </header>

      {loading && <p className="muted">Loading stats...</p>}
      {error && <div className="auth-error" style={{ maxWidth: 480 }}>{error}</div>}

      {!loading && !error && (
        <div className="stat-grid">
          <StatCard icon={GraduationCap} label="Total Students" value={stats.totalStudents} tone="blue" />
          <StatCard icon={Users} label="Total Teachers" value={stats.totalTeachers} tone="purple" />
          <StatCard icon={School} label="Total Classes" value={stats.totalClasses} tone="green" />
          <StatCard icon={Wallet} label="Pending Fees" value={`₹${stats.pendingFees?.toLocaleString("en-IN") ?? 0}`} tone="orange" />
          <StatCard icon={ClipboardCheck} label="Today's Attendance" value={stats.todaysAttendance} tone="teal" />
        </div>
      )}
    </div>
  );
}
