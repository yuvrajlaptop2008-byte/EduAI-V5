import { Outlet } from "react-router-dom";
import {
  LayoutDashboard, Building2, FileQuestion, UploadCloud,
  Settings as SettingsIcon, Sparkles, Users as UsersIcon, BarChart3, GitBranch
} from "lucide-react";
import RoleShell from "./RoleShell";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/analytics", label: "Analytics", icon: BarChart3, group: "Insights" },
  { path: "/admin/institutes", label: "Institutes", icon: Building2, group: "Organization" },
  { path: "/admin/users", label: "All Users", icon: UsersIcon, group: "Organization" },
  { path: "/admin/questions", label: "Question Bank", icon: FileQuestion, group: "Content" },
  { path: "/admin/import", label: "Import CSV", icon: UploadCloud, group: "Content" },
  { path: "/admin/import/pdf", label: "Import PDF/AI", icon: Sparkles, group: "Content" },
  { path: "/admin/settings", label: "Settings", icon: SettingsIcon, group: "System" },
];

export default function AdminLayout() {
  return (
    <RoleShell navItems={navItems} roleLabel="Admin Control" accentColor="from-rose-500 to-pink-700">
      <Outlet />
    </RoleShell>
  );
}
