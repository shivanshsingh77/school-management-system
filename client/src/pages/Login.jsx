import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { School, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ROLE_HOME = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setSubmitting(true);
    try {
      const user = await login(username.trim(), password);
      navigate(ROLE_HOME[user.role] || "/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please verify your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setUsername("");
    setPassword("");
    setError("");
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <div className="sidebar-brand-icon">
            <School size={22} />
          </div>
        </div>
        <h1>EduManage ERP</h1>
        <p className="auth-subtitle">Sign in to your educational workspace</p>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          placeholder="Enter your username"
          autoFocus
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="Enter your password"
        />

        <div className="auth-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            <LogIn size={16} />
            {submitting ? "Signing in..." : "Sign In"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClear}
            disabled={submitting}
          >
            Clear
          </button>
        </div>

        <div className="auth-hint">
          <strong>Demo Logins:</strong>
          <br />
          Admin: <code>admin</code> / <code>Admin@123</code>
          <br />
          Teacher: <code>rahul.sharma</code> / <code>Teacher@123</code>
          <br />
          Student: <code>aarav.patel</code> / <code>Student@123</code>
        </div>
      </form>
    </div>
  );
}
