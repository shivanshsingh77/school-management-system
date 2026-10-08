import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Users, GraduationCap, School, BookOpen,
  ClipboardCheck, Wallet, FileText, Award, BarChart3, UserCog, LogOut,
} from "lucide-react";

const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/students", label: "Students", icon: GraduationCap },
  { to: "/admin/teachers", label: "Teachers", icon: Users },
  { to: "/admin/classes", label: "Classes", icon: School },
  { to: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { to: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/admin/fees", label: "Fees", icon: Wallet },
  { to: "/admin/exams", label: "Exams", icon: FileText },
  { to: "/admin/results", label: "Marks/Results", icon: Award },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/users", label: "Users", icon: UserCog },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand"><School size={22} /><span>SMS</span></div>
      <nav className="sidebar-nav">
        {ADMIN_NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}>
            <Icon size={18} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase() || "?"}</div>
          <div>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
        <button className="sidebar-link logout-btn" onClick={logout}><LogOut size={18} /><span>Logout</span></button>
      </div>
    </aside>
  );
}
