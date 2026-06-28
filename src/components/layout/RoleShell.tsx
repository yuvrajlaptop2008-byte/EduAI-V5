import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, ChevronLeft, ChevronRight, Sun, Moon, Menu, X, Bell } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { unreadCount } from "../../services/notificationsDB";
import { normalizeRole } from "../../utils/roles";

export interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  group?: string;
}

export default function RoleShell({
  navItems, roleLabel, accentColor = "#8083ff", children,
}: {
  navItems: NavItem[];
  roleLabel: string;
  accentColor?: string;
  children: ReactNode;
}) {
  const location = useLocation();
  const { user, logout, theme, setTheme } = useUser() as any;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (user) unreadCount(user.uid).then(setNotifCount).catch(() => {});
  }, [user?.uid]);

  const groups = Array.from(new Set(navItems.map(i => i.group || ""))).filter(Boolean);
  const ungrouped = navItems.filter(i => !i.group);
  const grouped = groups.map(g => ({ label: g, items: navItems.filter(i => i.group === g) }));

  const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const active = location.pathname === item.path ||
      (item.path !== "/" && item.path.length > 1 && location.pathname.startsWith(item.path + "/"));
    return (
      <Link
        to={item.path}
        onClick={() => setMobileOpen(false)}
        title={collapsed ? item.label : undefined}
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
          active
            ? "text-[#c0c1ff] bg-white/8 font-bold"
            : "text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-white/5 hover:scale-[1.02]"
        }`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full" style={{ background: accentColor }} />
        )}
        <Icon size={18} className="shrink-0" style={active ? { color: accentColor } : {}} />
        {!collapsed && <span className="truncate">{item.label}</span>}
        {!collapsed && item.badge != null && item.badge > 0 && (
          <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{item.badge > 9 ? "9+" : item.badge}</span>
        )}
        {collapsed && (
          <div className="absolute left-14 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-[#171f33] border border-white/10 text-white text-xs rounded-lg shadow-xl whitespace-nowrap ml-1">
            {item.label}
          </div>
        )}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 ${collapsed ? "justify-center px-2 py-5" : "px-5 py-5"} border-b border-white/8`}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shrink-0 primary-gradient">E</div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#dae2fd] leading-tight">EduAI</p>
            <p className="text-[10px] text-[#c7c4d7] opacity-60 leading-tight uppercase tracking-widest font-medium">{roleLabel}</p>
          </div>
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="ml-auto p-1 rounded-lg hover:bg-white/5 text-[#c7c4d7] hidden lg:flex">
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {ungrouped.map(item => <NavLink key={item.path} item={item} />)}
        {grouped.map(({ label, items }) => (
          <div key={label} className="mt-5">
            {!collapsed && <p className="text-[9px] font-black uppercase tracking-widest text-[#c7c4d7] opacity-40 px-3 mb-2">{label}</p>}
            {collapsed && <div className="h-px bg-white/8 mx-2 mb-2 mt-4" />}
            {items.map(item => <NavLink key={item.path} item={item} />)}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/8 p-3 space-y-1">
        <button
          onClick={() => setTheme?.(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#c7c4d7] hover:bg-white/5 hover:text-[#dae2fd] transition-colors"
          title={collapsed ? "Toggle theme" : undefined}
        >
          {theme === "dark" ? <Sun size={17} className="shrink-0" /> : <Moon size={17} className="shrink-0" />}
          {!collapsed && <span className="text-xs">{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
        </button>

        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 primary-gradient">
              {user.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#dae2fd] truncate">{user.name}</p>
              <p className="text-[10px] text-[#c7c4d7] opacity-50 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => logout?.()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#c7c4d7] hover:bg-red-500/10 hover:text-red-400 transition-colors"
          title={collapsed ? "Log out" : undefined}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && <span className="text-xs">Log out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex shrink-0 flex-col glass-sidebar transition-all duration-300 ${collapsed ? "w-[68px]" : "w-60"}`}>
        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="mx-auto mt-3 mb-1 p-1.5 rounded-lg hover:bg-white/5 text-[#c7c4d7]">
            <ChevronRight size={14} />
          </button>
        )}
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <div className="lg:hidden">
        <button onClick={() => setMobileOpen(true)} className="fixed top-4 left-4 z-40 p-2 rounded-xl glass border border-white/10 shadow-lg">
          <Menu size={17} className="text-[#c7c4d7]" />
        </button>
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
              <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed inset-y-0 left-0 z-50 w-60 glass-sidebar flex flex-col">
                <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-[#c7c4d7]">
                  <X size={15} />
                </button>
                <SidebarContent />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="glass-topbar h-14 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-px" />
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {notifCount > 0 && (
              <div className="relative">
                <Bell size={18} className="text-[#c7c4d7]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center">{notifCount}</span>
              </div>
            )}
            {user && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
                <div className="w-7 h-7 rounded-full primary-gradient flex items-center justify-center text-white font-bold text-xs">
                  {user.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-[#dae2fd] leading-none">{user.name}</p>
                  <p className="text-[9px] text-[#c7c4d7] opacity-50 uppercase tracking-wide">{normalizeRole(user.role)}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8 max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
