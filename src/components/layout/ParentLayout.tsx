import { Outlet } from "react-router-dom";
import { LayoutDashboard, TrendingUp, CalendarCheck, MessageSquare, Bell, FileText } from "lucide-react";
import RoleShell from "./RoleShell";

const navItems = [
  { path: "/parent", label: "Dashboard", icon: LayoutDashboard },
  { path: "/parent/progress", label: "Progress", icon: TrendingUp, group: "My Child" },
  { path: "/parent/attendance", label: "Attendance", icon: CalendarCheck, group: "My Child" },
  { path: "/parent/remarks", label: "Remarks", icon: MessageSquare, group: "My Child" },
  { path: "/parent/reports", label: "Reports", icon: FileText, group: "My Child" },
  { path: "/parent/notifications", label: "Notifications", icon: Bell, group: "My Child" },
];

export default function ParentLayout() {
  return (
    <RoleShell navItems={navItems} roleLabel="Parent Portal" accentColor="from-emerald-500 to-teal-600">
      <Outlet />
    </RoleShell>
  );
}
