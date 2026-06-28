import { useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { normalizeRole, type AppRole } from "../../utils/roles";
import { logAudit } from "../../services/auditLogDB";
import { useUser } from "../../context/UserContext";
import { toast } from "sonner";
import { Users as UsersIcon, Search, ChevronDown, Trash2, Download } from "lucide-react";
import StatCard from "../../components/layout/StatCard";
import { SkeletonStatCards, SkeletonTable } from "../../components/Skeleton";
import { GraduationCap, UserCog, Users2, ShieldCheck } from "lucide-react";

interface UserRow {
  uid: string; name: string; email: string; role: string;
  instituteId?: string | null; examGroupId?: string | null;
  createdAt?: number; lastActive?: number; onboarded?: boolean;
}

const ROLES: AppRole[] = ["student","teacher","admin","parent"];
const ROLE_COLORS: Record<string,string> = {
  student: "text-sky-600 bg-sky-500/10",
  teacher: "text-violet-600 bg-violet-500/10",
  admin: "text-rose-600 bg-rose-500/10",
  parent: "text-emerald-600 bg-emerald-500/10",
  user: "text-sky-600 bg-sky-500/10",
};

export default function Users() {
  const { user: me } = useUser();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AppRole>("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const load = () => {
    getDocs(collection(db, "users")).then(snap => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...(d.data() as any) })));
      setLoading(false);
    });
  };
  useEffect(load, []);

  const filtered = useMemo(() =>
    users.filter(u =>
      (roleFilter === "all" || normalizeRole(u.role) === roleFilter) &&
      (!search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || u.uid.includes(search))
    ).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
    [users, search, roleFilter]
  );

  const counts = useMemo(() => ({
    student: users.filter(u => normalizeRole(u.role) === "student").length,
    teacher: users.filter(u => normalizeRole(u.role) === "teacher").length,
    parent: users.filter(u => normalizeRole(u.role) === "parent").length,
    admin: users.filter(u => normalizeRole(u.role) === "admin").length,
  }), [users]);

  const changeRole = async (uid: string, newRole: AppRole) => {
    if (uid === me?.uid) { toast.error("You cannot change your own role."); return; }
    setChangingRole(uid);
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole });
      const u = users.find(x => x.uid === uid);
      logAudit(me!.uid, me!.name, "user.roleChange", `Changed ${u?.name || uid} → ${newRole}`);
      toast.success(`${u?.name || "User"} is now ${newRole}.`);
      load();
    } catch (e: any) { toast.error(e?.message || "Failed."); }
    finally { setChangingRole(null); }
  };

  const exportCSV = () => {
    const rows = [["Name","Email","Role","Institute","Joined"]];
    filtered.forEach(u => rows.push([u.name||"",u.email||"",normalizeRole(u.role),u.instituteId||"",u.createdAt?new Date(u.createdAt).toLocaleDateString():""]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), { href: `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`, download: "users.csv" });
    a.click();
  };

  const toggleSelect = (uid: string) => {
    const next = new Set(selected);
    next.has(uid) ? next.delete(uid) : next.add(uid);
    setSelected(next);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersIcon className="text-brand" size={20}/>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Users</h1>
          <span className="ml-1 px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-500 text-xs font-bold rounded-full">{users.length}</span>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-brand hover:text-brand transition-colors">
          <Download size={14}/> Export CSV
        </button>
      </div>

      {loading ? <SkeletonStatCards count={4}/> : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button onClick={() => setRoleFilter(roleFilter==="student"?"all":"student")} className="text-left">
            <StatCard label="Students" value={counts.student} icon={GraduationCap} gradient="from-sky-500 to-blue-600"/>
          </button>
          <button onClick={() => setRoleFilter(roleFilter==="teacher"?"all":"teacher")} className="text-left">
            <StatCard label="Teachers" value={counts.teacher} icon={UserCog} gradient="from-violet-500 to-indigo-600" delay={0.05}/>
          </button>
          <button onClick={() => setRoleFilter(roleFilter==="parent"?"all":"parent")} className="text-left">
            <StatCard label="Parents" value={counts.parent} icon={Users2} gradient="from-emerald-500 to-teal-600" delay={0.1}/>
          </button>
          <button onClick={() => setRoleFilter(roleFilter==="admin"?"all":"admin")} className="text-left">
            <StatCard label="Admins" value={counts.admin} icon={ShieldCheck} gradient="from-rose-500 to-red-600" delay={0.15}/>
          </button>
        </div>
      )}

      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input className="input w-full pl-9" placeholder="Search name, email or UID…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
          {(["all", ...ROLES] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${roleFilter===r ? "bg-white dark:bg-slate-800 text-brand shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500">{filtered.length} of {users.length} users</p>

      {loading ? <SkeletonTable rows={6} cols={5}/> : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-white/5 text-left">
                <tr>
                  <th className="p-3 w-8"><input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(filtered.map(u=>u.uid)) : new Set())}/></th>
                  <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                  <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                  <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Institute</th>
                  <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                  <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map((u, i) => (
                  <motion.tr key={u.uid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i*0.015, 0.3) }}
                    className="hover:bg-slate-50 dark:hover:bg-white/3 transition-colors">
                    <td className="p-3"><input type="checkbox" checked={selected.has(u.uid)} onChange={() => toggleSelect(u.uid)}/></td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand/10 to-orange-500/10 text-brand font-bold text-xs flex items-center justify-center shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{u.name || "—"}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="relative inline-flex items-center">
                        <select
                          value={normalizeRole(u.role)}
                          onChange={e => changeRole(u.uid, e.target.value as AppRole)}
                          disabled={changingRole === u.uid || u.uid === me?.uid}
                          className={`input text-xs py-1 pr-7 appearance-none font-semibold ${ROLE_COLORS[u.role] || ROLE_COLORS.user} border-0 rounded-full`}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"/>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-slate-500">{u.instituteId ? u.instituteId.slice(0,12) + "…" : "—"}</td>
                    <td className="p-3 text-xs text-slate-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.onboarded ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                        {u.onboarded ? "Active" : "Pending"}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="p-8 text-sm text-slate-500 text-center">No users match this filter.</p>}
        </div>
      )}
    </div>
  );
}
