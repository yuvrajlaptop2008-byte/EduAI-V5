import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  TrendingUp, 
  CalendarCheck2, 
  MessageSquare, 
  FileText, 
  ChevronDown 
} from "lucide-react";
import { RoleShell, NavItem } from "../../components/Layout/RoleShell";
import { StatCard } from "../../components/Shared/StatCard";
import { GlassCard } from "../../components/Shared/GlassCard";

const parentNav: NavItem[] = [
  { label: "Dashboard", href: "/parent", icon: TrendingUp },
  { label: "Progress & Scores", href: "/parent/progress", icon: FileText },
  { label: "Attendance Record", href: "/parent/attendance", icon: CalendarCheck2 },
  { label: "Teacher Remarks", href: "/parent/remarks", icon: MessageSquare },
];

export const ParentDashboard: React.FC = () => {
  const [selectedChild, setSelectedChild] = useState("Rahul Sharma");

  return (
    <RoleShell roleName="Parent" accentColor="#10b981" navItems={parentNav} userName="Smt. Anjali Sharma">
      <div className="space-y-6">
        {/* Child Selector & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Parent Guardian Portal
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Tracking academic progress, attendance consistency, and faculty observations.
            </p>
          </div>

          <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl border border-white/10 self-start sm:self-auto">
            <Users size={16} className="text-emerald-400" />
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white outline-none cursor-pointer"
            >
              <option value="Rahul Sharma" className="bg-slate-900 text-white">Rahul Sharma (JEE Droppers)</option>
              <option value="Pooja Sharma" className="bg-slate-900 text-white">Pooja Sharma (Class 11 NEET)</option>
            </select>
          </div>
        </div>

        {/* Child Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Monthly Attendance"
            value="96.5%"
            icon={CalendarCheck2}
            progress={96}
            accentColor="#10b981"
          />
          <StatCard
            title="Average Test Score"
            value="198 / 300"
            icon={TrendingUp}
            trend={{ value: "+14 marks", isPositive: true }}
            progress={66}
            accentColor="#38bdf8"
          />
          <StatCard
            title="Tests Attempted"
            value="12 Tests"
            icon={FileText}
            progress={80}
            accentColor="#fbbf24"
          />
          <StatCard
            title="Faculty Remarks"
            value="4 Unread"
            icon={MessageSquare}
            progress={40}
            accentColor="#a855f7"
          />
        </div>

        {/* Recent Teacher Remark Card */}
        <GlassCard className="border-emerald-500/20">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Latest Teacher Remark
              </h3>
            </div>
            <span className="text-xs text-slate-400">Yesterday at 4:30 PM</span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed mb-3">
            "Rahul performed exceptionally well in the Optics section during Mock Test 04. He should focus more on Modern Physics numerical calculations where silly sign mistakes occurred."
          </p>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>By: <strong className="text-slate-200">Prof. V.K. Sharma</strong> (Head of Physics)</span>
            <Link to="/parent/remarks" className="text-emerald-400 font-semibold hover:underline">
              View All Remarks ➔
            </Link>
          </div>
        </GlassCard>
      </div>
    </RoleShell>
  );
};
