import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  BookOpen,
  ClipboardCheck,
  Wallet,
  FileText,
  Award,
  BarChart3,
  UserCog,
  LogOut,
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

export default function Sidebar({ navItems, activeTab, onSelectTab, portalTitle = "School ERP" }) {
  const { user, logout } = useAuth();
  const items = navItems || ADMIN_NAV;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <School size={20} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-title">EduManage</span>
          <span className="sidebar-brand-subtitle">{portalTitle}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;

          // If onSelectTab is provided (e.g. for modular dashboard tabs)
          if (onSelectTab && item.key) {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                className={`sidebar-link ${isActive ? "active" : ""}`}
                onClick={() => onSelectTab(item.key)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          }

          // Otherwise render NavLink for standard routes
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase() || "?"}</div>
          <div>
            <div className="sidebar-user-name" title={user?.name}>
              {user?.name}
            </div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
        <button className="sidebar-link logout-btn" onClick={logout}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
