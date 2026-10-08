import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AdminLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-content"><Outlet /></main>
    </div>
  );
}
