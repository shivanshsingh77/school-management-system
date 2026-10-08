import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_HOME = { admin: "/admin/dashboard", teacher: "/teacher/dashboard", student: "/student/dashboard" };

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
      setError(err.response?.data?.message || "Login failed. Please try again.");
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
        <h1>School Management System</h1>
        <p className="auth-subtitle">Sign in to continue</p>
        {error && <div className="auth-error">{error}</div>}
        <label htmlFor="username">Username</label>
        <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        <div className="auth-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Signing in..." : "Login"}</button>
          <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={submitting}>Clear</button>
        </div>
        <p className="auth-hint">Demo admin login: <code>admin</code> / <code>Admin@123</code></p>
      </form>
    </div>
  );
}
