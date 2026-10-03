import React from "react";
import { Link } from "react-router-dom";
import { Flame, Trophy, Target, BookOpen, Clock, AlertCircle } from "lucide-react";
import { RoleShell, NavItem } from "../../components/Layout/RoleShell";
import { StatCard } from "../../components/Shared/StatCard";
import { GlassCard } from "../../components/Shared/GlassCard";

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/app", icon: Target },
  { label: "Tests & Exams", href: "/app/tests", icon: Clock },
  { label: "Mistake Notebook", href: "/app/notebook", icon: AlertCircle },
  { label: "Formulas", href: "/app/formulas", icon: BookOpen },
];

export const StudentDashboard: React.FC = () => {
  return (
    <RoleShell roleName="Student" accentColor="#ff6b00" navItems={studentNav} userName="Rahul Sharma">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Welcome back, Rahul 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Target: <span className="text-orange-400 font-semibold">JEE Main 2026</span> • Droppers Batch A
            </p>
          </div>
          <Link
            to="/app/tests"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all self-start sm:self-auto"
          >
            Start Mock Test ➔
          </Link>
        </div>

        {/* Vitals Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Daily Streak"
            value="14 Days"
            icon={Flame}
            trend={{ value: "+2 days", isPositive: true }}
            progress={70}
            accentColor="#ff6b00"
          />
          <StatCard
            title="Overall Accuracy"
            value="76.2%"
            icon={Target}
            trend={{ value: "+3.4%", isPositive: true }}
            progress={76}
            accentColor="#38bdf8"
          />
          <StatCard
            title="Total Practice Points"
            value="4,850 XP"
            icon={Trophy}
            progress={85}
            accentColor="#fbbf24"
          />
          <StatCard
            title="Batch Rank"
            value="#04 / 64"
            icon={Trophy}
            progress={94}
            accentColor="#10b981"
          />
        </div>

        {/* Quick Access Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/app/tests" className="block">
            <GlassCard hoverEffect className="h-full border-orange-500/20">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-3">
                <Clock size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">CBT Mock Tests</h3>
              <p className="text-xs text-slate-400">
                Full-length 3-hour NTA simulated papers with instant percentile rankings.
              </p>
            </GlassCard>
          </Link>

          <Link to="/app/notebook" className="block">
            <GlassCard hoverEffect className="h-full border-rose-500/20">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
                <AlertCircle size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Mistake Notebook</h3>
              <p className="text-xs text-slate-400">
                Review questions answered incorrectly with error tags and spaced repetition.
              </p>
            </GlassCard>
          </Link>

          <Link to="/app/formulas" className="block">
            <GlassCard hoverEffect className="h-full border-indigo-500/20">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                <BookOpen size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Formula Handbook</h3>
              <p className="text-xs text-slate-400">
                High-yield Physics, Chemistry, and Math formulas rendered in KaTeX LaTeX.
              </p>
            </GlassCard>
          </Link>
        </div>
      </div>
    </RoleShell>
  );
};
