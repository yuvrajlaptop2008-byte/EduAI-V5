import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  LayoutDashboard,
  FileQuestion,
  Users,
  Building2,
  UploadCloud,
  Sparkles,
  BarChart3,
  Settings,
  Sun,
  Moon,
  LogOut,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useNavigate, useLocation } from "react-router-dom";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  questionCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose, questionCount }) => {
  const { user, profilePic, theme, setTheme, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const isDarkTheme =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const navLinks = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/questions", label: "Question Bank", icon: FileQuestion, badge: questionCount },
    { path: "/admin/users", label: "All Users", icon: Users },
    { path: "/admin/institutes", label: "Institutes & Branches", icon: Building2 },
    { path: "/admin/import", label: "CSV Bulk Import", icon: UploadCloud },
    { path: "/admin/import/pdf", label: "AI / PDF Paper Import", icon: Sparkles },
    { path: "/admin/analytics", label: "System Analytics", icon: BarChart3 },
    { path: "/admin/settings", label: "Settings & Audit", icon: Settings },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          >
            {/* Floating Close Button identical to student Sidebar */}
            <button
              onClick={onClose}
              className="absolute top-1/3 right-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
            >
              <X size={20} /> Close
            </button>
          </motion.div>

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white dark:bg-slate-900 z-[101] flex flex-col shadow-2xl border-r border-slate-900/5 dark:border-white/5"
          >
            {/* Admin Profile Section */}
            <div className="p-6 pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-rose-500/80 p-0.5 shrink-0 shadow-md shadow-rose-500/20">
                  <img
                    src={
                      profilePic ||
                      `https://api.dicebear.com/9.x/adventurer/svg?seed=${user?.uid || "admin"}`
                    }
                    alt="Admin Avatar"
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {user?.name || "Admin"}
                    </h2>
                    <ShieldCheck size={15} className="text-rose-500 shrink-0" />
                  </div>
                  <p className="text-rose-600 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider">
                    Super Administrator
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {user?.email || "admin@eduai.app"}
                  </p>
                </div>
              </div>

              {/* Admin Scope Badge */}
              <div className="w-full bg-rose-500/10 text-rose-600 dark:text-rose-400 py-2.5 px-3 rounded-xl flex items-center justify-between text-xs font-bold border border-rose-500/20">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  Admin Control Center
                </span>
                <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded-full">Active</span>
              </div>
            </div>

            {/* Menu Items (Replacing Student Notebook/Formulas with Question Bank & Admin Tools) */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      onClose();
                      navigate(item.path);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                      active
                        ? "bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20 shadow-sm"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon
                        size={19}
                        className={active ? "text-rose-600 dark:text-rose-400" : "text-slate-400 dark:text-slate-500"}
                      />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight size={16} className="text-slate-400 opacity-60" />
                    </div>
                  </button>
                );
              })}

              <div className="pt-2 border-t border-slate-100 dark:border-white/5 my-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate("/app");
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left text-brand hover:bg-brand/10 transition-colors font-semibold text-xs"
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap size={18} />
                    <span>Switch to Student View</span>
                  </div>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>

            {/* Bottom Actions: Theme & Logout */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5 space-y-2">
              <button
                onClick={() => setTheme(isDarkTheme ? "light" : "dark")}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-slate-700 dark:text-slate-200 text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  {isDarkTheme ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-400" />}
                  <span>{isDarkTheme ? "Light Mode" : "Dark Mode"}</span>
                </div>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  {isDarkTheme ? "Dark" : "Light"}
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  logout();
                  navigate("/login");
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-sm font-semibold"
              >
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
