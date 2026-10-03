import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import { db } from "../../firebase";
import { dataService } from "../../services/dataService";
import { Link } from "react-router-dom";
import StatCard from "../../components/layout/StatCard";
import { SkeletonStatCards } from "../../components/Skeleton";
import { listInstitutes } from "../../services/institutesDB";
import { listRecentAuditLogs, type AuditLogEntry } from "../../services/auditLogDB";
import {
  Building2, Users, GraduationCap, FileQuestion, ClipboardList,
  UserCog, TrendingUp, Activity, ChevronRight, AlertTriangle, CheckCircle2
} from "lucide-react";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ institutes: 0, students: 0, teachers: 0, parents: 0, questions: 0, tests: 0, attempts: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<{name:string;score:number;total:number;time:number}[]>([]);
  const [alerts, setAlerts] = useState<{msg:string;type:"warn"|"ok"}[]>([]);

  useEffect(() => {
    (async () => {
      const [institutes, users, qData, qCount, tests, attempts] = await Promise.all([
        listInstitutes(),
        getDocs(collection(db, "users")),
        dataService.getQuestions({ limit: 50 }),
        dataService.getQuestionCount(),
        getDocs(collection(db, "groupTests")),
        getDocs(query(collection(db, "groupTestAttempts"), orderBy("submittedAt", "desc"), limit(5))),
      ]);

      let students = 0, teachers = 0, parents = 0;
      users.forEach(d => {
        const r = (d.data() as any).role;
        if (r === "teacher") teachers++;
        else if (r === "parent") parents++;
        else if (r !== "admin") students++;
      });

      const pending = qData.questions.filter(q => q.status === "pending").length;

      setCounts({
        institutes: institutes.length,
        students,
        teachers,
        parents,
        questions: qCount || qData.questions.length,
        tests: tests.size,
        attempts: attempts.size,
        pending
      });

      setRecentAttempts(attempts.docs.map(d => {
        const a = d.data() as any;
        return { name: a.studentName || "Student", score: a.score || 0, total: a.totalMarks || 100, time: a.submittedAt || Date.now() };
      }));

      const alertList: {msg:string;type:"warn"|"ok"}[] = [];
      if (pending > 0) alertList.push({ msg: `${pending} question${pending > 1 ? "s" : ""} awaiting review`, type: "warn" });
      if (institutes.length === 0) alertList.push({ msg: "No institutes created yet", type: "warn" });
      if (students > 0 && teachers === 0) alertList.push({ msg: "No teachers onboarded — invite one", type: "warn" });
      if (alertList.length === 0) alertList.push({ msg: "Platform is healthy ✓", type: "ok" });
      setAlerts(alertList);

      listRecentAuditLogs(6).then(setLogs);
      setLoading(false);
    })();
  }, []);

  const statCards = [
    { label: "Institutes", value: counts.institutes, icon: Building2, gradient: "from-orange-500 to-pink-600", to: "/admin/institutes" },
    { label: "Students", value: counts.students, icon: GraduationCap, gradient: "from-sky-500 to-blue-600", to: "/admin/users" },
    { label: "Teachers", value: counts.teachers, icon: UserCog, gradient: "from-violet-500 to-indigo-600", to: "/admin/users" },
    { label: "Questions", value: counts.questions, icon: FileQuestion, gradient: "from-amber-500 to-orange-600", to: "/admin/questions" },
    { label: "Tests", value: counts.tests, icon: ClipboardList, gradient: "from-emerald-500 to-teal-600", to: "/admin/analytics" },
    { label: "Attempts", value: counts.attempts, icon: TrendingUp, gradient: "from-rose-500 to-red-600", to: "/admin/analytics" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-slate-900 dark:text-white">
            Platform Overview
          </motion.h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <Link to="/admin/analytics" className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-brand hover:text-brand transition-colors">
          <TrendingUp size={15} /> Analytics
        </Link>
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        {alerts.map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${a.type === "warn" ? "bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400"}`}>
            {a.type === "warn" ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
            {a.msg}
            {a.type === "warn" && counts.pending > 0 && (
              <Link to="/admin/questions" className="ml-auto text-brand font-semibold text-xs hover:underline">Review →</Link>
            )}
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      {loading ? <SkeletonStatCards count={6} /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((s, i) => (
            <Link key={s.label} to={s.to}>
              <StatCard label={s.label} value={s.value} icon={s.icon} gradient={s.gradient} delay={i * 0.05} />
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent submissions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><TrendingUp size={15} className="text-brand" /> Recent Test Submissions</p>
            <Link to="/admin/analytics" className="text-xs text-brand hover:underline">All →</Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {recentAttempts.map((a, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center">{a.name.charAt(0)}</div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{a.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-brand">{a.score}/{a.total}</p>
                  <p className="text-[10px] text-slate-400">{new Date(a.time).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {recentAttempts.length === 0 && <p className="px-5 py-6 text-sm text-slate-500 text-center">No submissions yet.</p>}
          </div>
        </div>

        {/* Audit log */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Activity size={15} className="text-brand" /> Activity Log</p>
            <Link to="/admin/settings" className="text-xs text-brand hover:underline">Full log →</Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {logs.map((l, i) => (
              <div key={l.id || i} className="px-5 py-3">
                <p className="text-xs text-slate-700 dark:text-slate-200 truncate">{l.details}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{l.actorName} · {new Date(l.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {logs.length === 0 && <p className="px-5 py-6 text-sm text-slate-500 text-center">No activity recorded yet.</p>}
          </div>
        </div>
      </div>

      {/* Quick nav */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Quick Navigation</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: "/admin/institutes", label: "Manage Institutes", icon: Building2, color: "text-orange-500" },
            { to: "/admin/users", label: "Manage Users", icon: Users, color: "text-sky-500" },
            { to: "/admin/questions", label: "Question Bank", icon: FileQuestion, color: "text-violet-500" },
            { to: "/admin/settings", label: "Platform Settings", icon: AlertTriangle, color: "text-emerald-500" },
          ].map(n => {
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to} className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-brand transition-colors group text-sm font-medium text-slate-700 dark:text-slate-200">
                <Icon size={17} className={`${n.color} shrink-0`} />
                <span className="truncate">{n.label}</span>
                <ChevronRight size={13} className="ml-auto text-slate-300 group-hover:text-brand transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
