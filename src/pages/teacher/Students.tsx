import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useUser } from "../../context/UserContext";
import { listExamGroups } from "../../services/examGroupsDB";
import { listRecentAttendance, studentAttendancePct } from "../../services/attendanceDB";
import { listAttemptsForStudent } from "../../services/groupTestsDB";
import type { ExamGroup } from "../../types/schema";
import { SkeletonList } from "../../components/Skeleton";
import { Search, ChevronRight, GraduationCap, Users, AlertTriangle, Trophy, TrendingUp, CalendarCheck } from "lucide-react";

interface StudentRow {
  uid: string; name: string; email: string; examGroupId?: string;
  attendancePct: number; avgScore: number; totalTests: number; lastActive?: number;
}

export default function Students() {
  const { user } = useUser();
  const [groups, setGroups] = useState<ExamGroup[]>([]);
  const [groupId, setGroupId] = useState("");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name"|"attendance"|"score">("name");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ total: 0, lowAttendance: 0, avgScore: 0 });

  useEffect(() => {
    listExamGroups(user?.instituteId || undefined).then(gs => {
      setGroups(gs); if (gs[0]) setGroupId(gs[0].id);
    });
  }, [user?.instituteId]);

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    (async () => {
      const snap = await getDocs(query(collection(db, "users"), where("examGroupId", "==", groupId)));
      const records = await listRecentAttendance(groupId, 30);
      const list: StudentRow[] = await Promise.all(snap.docs.map(async d => {
        const uid = d.id; const data = d.data() as any;
        const att = studentAttendancePct(records, uid);
        const attempts = await listAttemptsForStudent(uid);
        const avg = attempts.length ? Math.round(attempts.reduce((s,a)=>s+a.score,0)/attempts.length) : 0;
        return { uid, name: data.name||"Student", email: data.email||"", examGroupId: data.examGroupId, attendancePct: att, avgScore: avg, totalTests: attempts.length, lastActive: data.lastActive };
      }));
      setStudents(list);
      setSummary({ total: list.length, lowAttendance: list.filter(s=>s.attendancePct < 75).length, avgScore: list.length ? Math.round(list.reduce((s,st)=>s+st.avgScore,0)/list.length) : 0 });
      setLoading(false);
    })();
  }, [groupId]);

  const filtered = useMemo(() => {
    let list = students.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === "attendance") list = [...list].sort((a,b) => a.attendancePct - b.attendancePct);
    else if (sortBy === "score") list = [...list].sort((a,b) => b.avgScore - a.avgScore);
    else list = [...list].sort((a,b) => a.name.localeCompare(b.name));
    return list;
  }, [students, search, sortBy]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-brand" size={20}/>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Students</h1>
          {!loading && <span className="ml-1 px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-500 text-xs font-bold rounded-full">{filtered.length}</span>}
        </div>
        <select className="input" value={groupId} onChange={e => setGroupId(e.target.value)}>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      {/* Summary cards */}
      {!loading && students.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-center">
            <Users size={16} className="text-sky-500 mx-auto mb-1"/>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{summary.total}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <div className={`border rounded-xl p-3.5 text-center ${summary.lowAttendance > 0 ? "bg-amber-500/5 border-amber-500/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10"}`}>
            <AlertTriangle size={16} className={`${summary.lowAttendance > 0 ? "text-amber-500" : "text-emerald-500"} mx-auto mb-1`}/>
            <p className={`text-xl font-extrabold ${summary.lowAttendance > 0 ? "text-amber-600" : "text-slate-900 dark:text-white"}`}>{summary.lowAttendance}</p>
            <p className="text-xs text-slate-500">Low attendance</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-center">
            <TrendingUp size={16} className="text-violet-500 mx-auto mb-1"/>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{summary.avgScore}</p>
            <p className="text-xs text-slate-500">Avg score</p>
          </div>
        </div>
      )}

      {/* Search + sort */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input className="input w-full pl-9" placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
          {(["name","attendance","score"] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${sortBy===s ? "bg-white dark:bg-slate-800 text-brand shadow-sm" : "text-slate-500"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? <SkeletonList rows={5}/> : (
        <div className="space-y-2">
          {filtered.map((s, i) => (
            <motion.div key={s.uid} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}>
              <Link to={`/teacher/students/${s.uid}`}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all group hover:shadow-md ${s.attendancePct < 75 && s.totalTests > 0 ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:border-brand"}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/20 to-orange-500/20 text-brand font-extrabold flex items-center justify-center text-sm shrink-0">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{s.name}</p>
                  <p className="text-xs text-slate-500 truncate">{s.email}</p>
                </div>
                <div className="hidden sm:flex items-center gap-5 text-center shrink-0">
                  <div>
                    <p className={`text-sm font-bold ${s.attendancePct < 75 ? "text-amber-500" : "text-emerald-600"}`}>{s.totalTests > 0 ? `${s.attendancePct}%` : "—"}</p>
                    <p className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5"><CalendarCheck size={9}/> Attend</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand">{s.totalTests > 0 ? s.avgScore : "—"}</p>
                    <p className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5"><Trophy size={9}/> Avg</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.totalTests}</p>
                    <p className="text-[10px] text-slate-400">Tests</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-brand transition-colors shrink-0"/>
              </Link>
            </motion.div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="py-16 text-center text-slate-400">
              <GraduationCap size={28} className="mx-auto mb-2 opacity-40"/>
              <p className="text-sm">{search ? "No students match your search." : "No students in this group yet."}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
