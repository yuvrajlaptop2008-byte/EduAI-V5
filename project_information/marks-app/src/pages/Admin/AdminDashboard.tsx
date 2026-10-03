import React from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  Users, 
  Database, 
  ShieldCheck, 
  Sliders, 
  FileSpreadsheet, 
  Activity 
} from "lucide-react";
import { RoleShell, NavItem } from "../../components/Layout/RoleShell";
import { StatCard } from "../../components/Shared/StatCard";
import { GlassCard } from "../../components/Shared/GlassCard";

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: Activity },
  { label: "Institutes & Branches", href: "/admin/institutes", icon: Building2 },
  { label: "Question Bank", href: "/admin/questions", icon: Database },
  { label: "User Roles & Invites", href: "/admin/users", icon: Users },
  { label: "CSV Ingestion", href: "/admin/import", icon: FileSpreadsheet },
  { label: "Platform Settings", href: "/admin/settings", icon: Sliders },
];

export const AdminDashboard: React.FC = () => {
  return (
    <RoleShell roleName="Admin" accentColor="#ef4444" navItems={adminNav} userName="Super Administrator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Platform Administration
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              EduAI V5 Global Infrastructure & Multi-Tenant Management
            </p>
          </div>
          <Link
            to="/admin/settings"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all self-start sm:self-auto"
          >
            <ShieldCheck size={18} />
            Security & Controls
          </Link>
        </div>

        {/* Global System Vitals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value="14,290"
            icon={Users}
            trend={{ value: "+12.4%", isPositive: true }}
            progress={88}
            accentColor="#ef4444"
          />
          <StatCard
            title="Enrolled Institutes"
            value="42"
            icon={Building2}
            progress={65}
            accentColor="#a855f7"
          />
          <StatCard
            title="Questions in Bank"
            value="18,650"
            icon={Database}
            progress={92}
            accentColor="#38bdf8"
          />
          <StatCard
            title="Tests Submitted Today"
            value="3,840"
            icon={Activity}
            progress={74}
            accentColor="#10b981"
          />
        </div>

        {/* Admin Operational Portals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/institutes" className="block">
            <GlassCard hoverEffect className="h-full border-rose-500/20">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
                <Building2 size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Hierarchy Management</h3>
              <p className="text-xs text-slate-400">
                Configure Institutes, regional Branches, Batches, and assign campus administrators.
              </p>
            </GlassCard>
          </Link>

          <Link to="/admin/questions" className="block">
            <GlassCard hoverEffect className="h-full border-blue-500/20">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                <Database size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Question Bank Approvals</h3>
              <p className="text-xs text-slate-400">
                Review pending faculty questions, audit LaTeX accuracy, and approve into global pool.
              </p>
            </GlassCard>
          </Link>

          <Link to="/admin/settings" className="block">
            <GlassCard hoverEffect className="h-full border-amber-500/20">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                <Sliders size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Emergency Platform Gates</h3>
              <p className="text-xs text-slate-400">
                Broadcast global announcement banners, toggle maintenance mode, and seed demo records.
              </p>
            </GlassCard>
          </Link>
        </div>
      </div>
    </RoleShell>
  );
};
