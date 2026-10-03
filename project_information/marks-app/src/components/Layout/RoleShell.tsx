import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LucideIcon, Menu, X, Bell } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface RoleShellProps {
  roleName: string;
  accentColor: string;
  navItems: NavItem[];
  children: React.ReactNode;
  userName?: string;
  userAvatar?: string;
  unreadCount?: number;
}

export const RoleShell: React.FC<RoleShellProps> = ({
  roleName,
  accentColor,
  navItems,
  children,
  userName = "User",
  unreadCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0b1326] text-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 glass-topbar border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-orange-400 to-indigo-400 bg-clip-text text-transparent">
            MarksApp
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            {roleName}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 glass-sidebar border-r border-white/10 min-h-screen sticky top-0 z-40 p-4 justify-between">
        <div>
          {/* Logo / Brand Header */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10 px-2">
            <div>
              <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-orange-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                MarksApp
              </h1>
              <span className="text-xs text-slate-400">EduAI V5 Platform</span>
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              {roleName}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: `${accentColor}25`,
                          borderColor: `${accentColor}40`,
                          borderWidth: "1px",
                          color: "#ffffff",
                        }
                      : {}
                  }
                >
                  <Icon size={18} style={isActive ? { color: accentColor } : {}} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: accentColor, color: "#fff" }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="truncate max-w-[120px]">
              <p className="text-xs font-semibold text-slate-200 truncate">{userName}</p>
              <p className="text-[10px] text-slate-400 capitalize">{roleName}</p>
            </div>
          </div>
          <button
            type="button"
            className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5"
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
