import React from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  FileText, 
  CalendarCheck2, 
  PlusCircle, 
  UploadCloud, 
  MessageSquare,
  TrendingUp 
} from "lucide-react";
import { RoleShell, NavItem } from "../../components/Layout/RoleShell";
import { StatCard } from "../../components/Shared/StatCard";
import { GlassCard } from "../../components/Shared/GlassCard";

const teacherNav: NavItem[] = [
  { label: "Dashboard", href: "/teacher", icon: TrendingUp },
  { label: "Create Test", href: "/teacher/create-test", icon: PlusCircle },
  { label: "My Tests", href: "/teacher/tests", icon: FileText },
  { label: "Attendance", href: "/teacher/attendance", icon: CalendarCheck2 },
  { label: "Students", href: "/teacher/students", icon: Users },
  { label: "Upload Questions", href: "/teacher/upload", icon: UploadCloud },
];

export const TeacherDashboard: React.FC = () => {
  return (
    <RoleShell roleName="Teacher" accentColor="#8083ff" navItems={teacherNav} userName="Prof. V.K. Sharma">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Faculty Command Center
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Department of Physics • Kota Central Campus
            </p>
          </div>
          <Link
            to="/teacher/create-test"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <PlusCircle size={18} />
            Create Group Test
          </Link>
        </div>

        {/* Faculty Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Assigned Students"
            value="128"
            icon={Users}
            progress={90}
            accentColor="#8083ff"
          />
          <StatCard
            title="Batch Attendance"
            value="94.2%"
            icon={CalendarCheck2}
            trend={{ value: "+1.8%", isPositive: true }}
            progress={94}
            accentColor="#10b981"
          />
          <StatCard
            title="Published Tests"
            value="18"
            icon={FileText}
            progress={65}
            accentColor="#38bdf8"
          />
          <StatCard
            title="Questions Contributed"
            value="420"
            icon={UploadCloud}
            progress={82}
            accentColor="#fbbf24"
          />
        </div>

        {/* Quick Actions Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/teacher/attendance" className="block">
            <GlassCard hoverEffect className="h-full border-indigo-500/20">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                <CalendarCheck2 size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Mark Daily Attendance</h3>
              <p className="text-xs text-slate-400">
                Record Present, Absent, or Late status for active batches and notify guardians.
              </p>
            </GlassCard>
          </Link>

          <Link to="/teacher/upload" className="block">
            <GlassCard hoverEffect className="h-full border-emerald-500/20">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <UploadCloud size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Batch CSV Question Upload</h3>
              <p className="text-xs text-slate-400">
                Bulk ingest multiple choice questions with LaTeX math via PapaParse importer.
              </p>
            </GlassCard>
          </Link>

          <Link to="/teacher/students" className="block">
            <GlassCard hoverEffect className="h-full border-rose-500/20">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Student Remarks</h3>
              <p className="text-xs text-slate-400">
                Log behavioral and academic feedback with 1-click publishing to parents.
              </p>
            </GlassCard>
          </Link>
        </div>
      </div>
    </RoleShell>
  );
};
