import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileQuestion,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

export const AdminBottomNav: React.FC<{ questionCount?: number }> = ({ questionCount }) => {
  const location = useLocation();

  const navItems = [
    { path: "/admin", label: "Overview", icon: LayoutDashboard },
    { path: "/admin/questions", label: "Questions", icon: FileQuestion, badge: questionCount },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-900/5 dark:border-white/5 px-4 sm:px-8 py-2.5 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          location.pathname === item.path ||
          (item.path !== "/admin" && location.pathname.startsWith(item.path));

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all py-1 px-2.5 rounded-xl relative ${
              active
                ? "text-rose-600 dark:text-rose-400 font-bold scale-105"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[8px] font-bold px-1 py-0.2 rounded-full min-w-3.5 text-center leading-3">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">{item.label}</span>
            {active && (
              <span className="absolute bottom-0 w-3 h-0.5 bg-rose-500 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};
