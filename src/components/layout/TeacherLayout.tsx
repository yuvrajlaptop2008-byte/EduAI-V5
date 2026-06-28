import { Outlet } from "react-router-dom";
import { 
  LayoutDashboard, Upload, ClipboardPlus, ListChecks,
  CalendarCheck, BarChart2, MessageSquare, GraduationCap, TrendingUp
} from "lucide-react";
import RoleShell from "./RoleShell";

const navItems = [
  { path: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { path: "/teacher/students", label: "Students", icon: GraduationCap, group: "Teaching" },
  { path: "/teacher/remarks", label: "Remarks", icon: MessageSquare, group: "Teaching" },
  { path: "/teacher/attendance", label: "Mark Attendance", icon: CalendarCheck, group: "Teaching" },
  { path: "/teacher/attendance/trends", label: "Attendance Trends", icon: BarChart2, group: "Teaching" },
  { path: "/teacher/tests", label: "My Tests", icon: ListChecks, group: "Tests" },
  { path: "/teacher/create-test", label: "Create Test", icon: ClipboardPlus, group: "Tests" },
  { path: "/teacher/upload", label: "Upload Questions", icon: Upload, group: "Content" },
];

export default function TeacherLayout() {
  return (
    <RoleShell navItems={navItems} roleLabel="Teacher Portal" accentColor="from-violet-500 to-indigo-600">
      <Outlet />
    </RoleShell>
  );
}
