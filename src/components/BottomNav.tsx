import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, PenTool, BookMarked, User } from "lucide-react";
import { useUser } from "../context/UserContext";

export default function BottomNav() {
  const location = useLocation();
  const { user } = useUser();

  const navItems = [
    { path: "/app", label: "Home", icon: Home },
    { path: "/app/tests", label: "Tests", icon: BookOpen },
    { path: "/app/notebook", label: "Notes", icon: PenTool },
    { path: "/app/formulas", label: "Formulas", icon: BookMarked },
    { path: "/app/profile", label: "Profile", icon: User },
  ];

  // Removed admin panel nav item splice

  return (
    <div
      id="bottom-nav"
      className="fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-900/10 dark:border-white/10 pb-safe z-50"
    >
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          let isActive = false;
          if (item.path ==="/app") {
            isActive =
              location.pathname ==="/app" ||
              location.pathname.startsWith("/app/exam") ||
              location.pathname.startsWith("/app/dpp") ||
              location.pathname.startsWith("/app/practice") ||
              location.pathname.startsWith("/app/leaderboard") ||
              location.pathname.startsWith("/app/analysis");
          } else if (item.path ==="/app/profile") {
            isActive =
              location.pathname.startsWith("/app/profile") ||
              location.pathname.startsWith("/app/avatar-editor");
          } else {
            isActive = location.pathname.startsWith(item.path);
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive
                  ?"text-brand"
                  :"text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
