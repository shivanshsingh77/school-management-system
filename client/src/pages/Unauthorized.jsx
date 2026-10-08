import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="dashboard-placeholder">
      <h1>Access Denied</h1>
      <p>You don't have permission to view this page.</p>
      <Link className="btn btn-primary" to="/login">Back to Login</Link>
    </div>
  );
}
