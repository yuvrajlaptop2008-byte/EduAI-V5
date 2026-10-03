import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  FileQuestion,
  BarChart3,
  Database,
  Plus,
  Moon,
  Sun,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { dataService } from "../../services/dataService";
import { AdminSidebar } from "./AdminSidebar";
import { AdminBottomNav } from "./AdminBottomNav";

export default function AdminLayout() {
  const { user, profilePic, theme, setTheme } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const location = useLocation();

  const isDarkTheme =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const refreshCount = () => {
    dataService.getQuestionCount().then((count) => {
      setQuestionCount(count);
    }).catch(() => {});
  };

  useEffect(() => {
    refreshCount();

    const handleQuestionsChanged = () => {
      refreshCount();
    };

    window.addEventListener("eduai_questions_changed", handleQuestionsChanged);
    window.addEventListener("storage", handleQuestionsChanged);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("eduai_questions_channel");
      bc.onmessage = () => refreshCount();
    } catch {}

    return () => {
      window.removeEventListener("eduai_questions_changed", handleQuestionsChanged);
      window.removeEventListener("storage", handleQuestionsChanged);
      if (bc) bc.close();
    };
  }, []);

  // Determine current page title
  const getPageTitle = () => {
    const p = location.pathname;
    if (p === "/admin") return "Platform Command Center";
    if (p.startsWith("/admin/questions")) return "Question Bank Manager";
    if (p.startsWith("/admin/users")) return "User & Role Directory";
    if (p.startsWith("/admin/institutes")) return "Institutes & Batches";
    if (p.startsWith("/admin/import/pdf")) return "AI & PDF Paper Parser";
    if (p.startsWith("/admin/import")) return "CSV Bulk Question Import";
    if (p.startsWith("/admin/analytics")) return "System Performance Analytics";
    if (p.startsWith("/admin/settings")) return "Security & Audit Logs";
    return "Admin Portal";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white pb-24 transition-colors">
      {/* Slide-out Admin Drawer Sidebar identical to student Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        questionCount={questionCount}
      />

      {/* Sticky Top Header identical to student Home.tsx */}
      <header className="px-4 sm:px-8 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-40 border-b border-slate-900/5 dark:border-white/5">
        <div className="flex items-center gap-3.5">
          {/* Avatar button with ring that opens the sidebar drawer */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-rose-500 p-0.5 overflow-hidden focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 cursor-pointer shadow-md shadow-rose-500/20 hover:scale-105 transition-transform"
            title="Open Admin Menu"
          >
            <img
              src={
                profilePic ||
                `https://api.dicebear.com/9.x/adventurer/svg?seed=${user?.uid || "admin"}`
              }
              alt="Admin Avatar"
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
                Hey, {user?.name || "Administrator"}
              </span>
              <div className="bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-black px-1.5 py-0.5 rounded border border-rose-500/25 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={11} /> Admin
              </div>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Top Right Quick Actions (Replaces student streak/notebook with Admin Qs/Analytics/Add MCQ) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Question Counter Pill (Replaces student streak pill) */}
          <Link
            to="/admin/questions"
            className="flex items-center gap-1.5 bg-rose-500/10 dark:bg-rose-500/15 px-3 py-1.5 rounded-full border border-rose-500/20 shadow-inner overflow-hidden relative group hover:border-rose-500/40 transition-all"
            title="Total Question Bank MCQs"
          >
            <Database size={15} className="text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            <span className="text-rose-600 dark:text-rose-400 font-bold text-xs sm:text-sm">
              {questionCount} <span className="hidden sm:inline font-semibold">MCQs</span>
            </span>
          </Link>

          {/* Analytics shortcut (Replaces student leaderboard trophy) */}
          <Link
            to="/admin/analytics"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-800/80 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-105 hover:text-brand hover:border-brand/40 transition-all shadow-sm"
            title="System Analytics"
          >
            <BarChart3 size={18} />
          </Link>

          {/* Question Bank shortcut (Replaces student Notebook sparkle icon!) */}
          <Link
            to="/admin/questions"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-rose-500/10 to-pink-500/20 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 hover:scale-105 transition-all shadow-sm group"
            title="Question Bank & Content Manager"
          >
            <FileQuestion size={18} className="group-hover:scale-110 transition-transform" />
          </Link>

          {/* Theme Switcher Button */}
          <button
            onClick={() => setTheme(isDarkTheme ? "light" : "dark")}
            className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-105 transition-all shadow-sm"
            title={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkTheme ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* Main Page Body with same padding and max-width as student panel */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar */}
      <AdminBottomNav questionCount={questionCount} />
    </div>
  );
}
