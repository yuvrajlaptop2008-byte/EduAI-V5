import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import { db } from "../../firebase";
import { dataService } from "../../services/dataService";
import { Link } from "react-router-dom";
import { listInstitutes } from "../../services/institutesDB";
import { listRecentAuditLogs, type AuditLogEntry } from "../../services/auditLogDB";
import {
  Building2,
  Users,
  GraduationCap,
  FileQuestion,
  UserCog,
  TrendingUp,
  Activity,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Plus,
  UploadCloud,
  Sparkles,
  ShieldCheck,
  Zap,
  BarChart3,
  Calendar,
  Database,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    institutes: 0,
    students: 0,
    teachers: 0,
    parents: 0,
    questions: 0,
    tests: 0,
    attempts: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<
    { name: string; score: number; total: number; time: number }[]
  >([]);
  const [alerts, setAlerts] = useState<{ msg: string; type: "warn" | "ok" }[]>([]);

  const loadData = async () => {
    try {
      const [institutes, users, qData, qCount, tests, attempts] =
        await Promise.all([
          listInstitutes(),
          getDocs(collection(db, "users")),
          dataService.getQuestions({ limit: 50 }),
          dataService.getQuestionCount(),
          getDocs(collection(db, "groupTests")),
          getDocs(
            query(
              collection(db, "groupTestAttempts"),
              orderBy("submittedAt", "desc"),
              limit(5),
            ),
          ),
        ]);

      let students = 0,
        teachers = 0,
        parents = 0;
      users.forEach((d) => {
        const r = (d.data() as any).role;
        if (r === "teacher") teachers++;
        else if (r === "parent") parents++;
        else if (r !== "admin") students++;
      });

      const pending = qData.questions.filter((q) => q.status === "pending").length;
      const totalQ = qCount || qData.questions.length;

      setCounts({
        institutes: institutes.length,
        students,
        teachers,
        parents,
        questions: totalQ,
        tests: tests.size,
        attempts: attempts.size,
        pending,
      });

      setRecentAttempts(
        attempts.docs.map((d) => {
          const a = d.data() as any;
          return {
            name: a.studentName || "Student",
            score: a.score || 0,
            total: a.totalMarks || 100,
            time: a.submittedAt || Date.now(),
          };
        }),
      );

      const alertList: { msg: string; type: "warn" | "ok" }[] = [];
      if (pending > 0)
        alertList.push({
          msg: `${pending} question${pending > 1 ? "s" : ""} awaiting moderation review`,
          type: "warn",
        });
      if (institutes.length === 0)
        alertList.push({ msg: "No partner institutes registered yet", type: "warn" });
      if (students > 0 && teachers === 0)
        alertList.push({ msg: "No teachers assigned to batches", type: "warn" });
      if (alertList.length === 0)
        alertList.push({ msg: "All platform services are operational and healthy ✓", type: "ok" });
      setAlerts(alertList);

      listRecentAuditLogs(6).then(setLogs).catch(() => {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-refresh when questions change
    const onQChange = () => loadData();
    window.addEventListener("eduai_questions_changed", onQChange);
    window.addEventListener("storage", onQChange);
    return () => {
      window.removeEventListener("eduai_questions_changed", onQChange);
      window.removeEventListener("storage", onQChange);
    };
  }, []);

  const totalUsers = counts.students + counts.teachers + counts.parents;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Overview Card (Identical to student Daily Goal / Exam Progress Card) */}
      <section className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-[2.5rem] p-7 border border-slate-900/10 dark:border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glowing Orbs matching student home page */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest uppercase bg-rose-500/20 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full border border-rose-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Live Control Center
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Platform Administration
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Real-time monitoring across question repositories, multi-tenant institutes, user enrollments, and test sessions.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/admin/questions"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand text-white font-bold text-xs shadow-lg shadow-brand/25 hover:bg-brand/90 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={15} /> Add MCQ
            </Link>
            <Link
              to="/admin/import"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all shadow-sm"
            >
              <UploadCloud size={15} /> Bulk CSV
            </Link>
            <Link
              to="/admin/import/pdf"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/30 hover:bg-rose-500/20 transition-all shadow-sm"
            >
              <Sparkles size={15} /> AI PDF Paper
            </Link>
          </div>
        </div>

        {/* Real-time Metrics Progress Bar */}
        <div className="mt-8 pt-6 border-t border-slate-900/5 dark:border-white/5 relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total MCQs
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {counts.questions}
              </span>
              <span className="text-xs text-slate-400 font-bold">active</span>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Users
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
                {totalUsers}
              </span>
              <span className="text-xs text-slate-400 font-bold">accounts</span>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Institutes
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {counts.institutes}
              </span>
              <span className="text-xs text-slate-400 font-bold">centers</span>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Test Attempts
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {counts.attempts}
              </span>
              <span className="text-xs text-slate-400 font-bold">submitted</span>
            </div>
          </div>
        </div>
      </section>

      {/* System Alerts */}
      <div className="space-y-2">
        {alerts.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold border ${
              a.type === "warn"
                ? "bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400"
                : "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {a.type === "warn" ? (
              <AlertTriangle size={18} className="shrink-0 text-amber-500" />
            ) : (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
            )}
            <span className="flex-1">{a.msg}</span>
            {a.type === "warn" && counts.pending > 0 && (
              <Link
                to="/admin/questions"
                className="text-xs font-black uppercase text-brand hover:underline px-2.5 py-1 rounded-md bg-white/20 dark:bg-slate-900/40"
              >
                Review Now →
              </Link>
            )}
          </motion.div>
        ))}
      </div>

      {/* Admin Modules Grid (Replacing Student Subject Cards like Physics, Chemistry, Maths) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Platform Modules
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Manage content, institutions, faculty, and examination pipeline
            </p>
          </div>
          <Link
            to="/admin/analytics"
            className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
          >
            <span>View System Metrics</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Question Bank (Direct replacement for Student Notebook/Practice) */}
          <Link
            to="/admin/questions"
            className="bg-slate-50/60 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-900/5 dark:border-white/5 hover:border-rose-500/30 dark:hover:border-rose-500/30 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all shadow-sm group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold shadow-lg shadow-rose-500/20 mb-4 group-hover:scale-105 transition-transform">
              <FileQuestion size={22} />
            </div>
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Content Repository
            </span>
            <h4 className="font-bold text-base text-slate-900 dark:text-white mt-2">
              Question Bank
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {counts.questions} Questions · Single & Bulk MCQs
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform">
              <span>Open Repository</span>
              <ArrowRight size={13} />
            </div>
          </Link>

          {/* Card 2: Users & Faculty */}
          <Link
            to="/admin/users"
            className="bg-slate-50/60 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-900/5 dark:border-white/5 hover:border-sky-500/30 dark:hover:border-sky-500/30 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all shadow-sm group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-sky-500/20 mb-4 group-hover:scale-105 transition-transform">
              <Users size={22} />
            </div>
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              Access & Roles
            </span>
            <h4 className="font-bold text-base text-slate-900 dark:text-white mt-2">
              User Directory
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {counts.students} Students · {counts.teachers} Teachers
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
              <span>Manage Roles</span>
              <ArrowRight size={13} />
            </div>
          </Link>

          {/* Card 3: Institutes */}
          <Link
            to="/admin/institutes"
            className="bg-slate-50/60 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-900/5 dark:border-white/5 hover:border-amber-500/30 dark:hover:border-amber-500/30 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all shadow-sm group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-lg shadow-amber-500/20 mb-4 group-hover:scale-105 transition-transform">
              <Building2 size={22} />
            </div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Organizations
            </span>
            <h4 className="font-bold text-base text-slate-900 dark:text-white mt-2">
              Institutes & Batches
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {counts.institutes} Centers · Multi-branch Batches
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>View Centers</span>
              <ArrowRight size={13} />
            </div>
          </Link>

          {/* Card 4: Import Pipelines */}
          <Link
            to="/admin/import"
            className="bg-slate-50/60 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-900/5 dark:border-white/5 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all shadow-sm group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 mb-4 group-hover:scale-105 transition-transform">
              <UploadCloud size={22} />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Data Ingestion
            </span>
            <h4 className="font-bold text-base text-slate-900 dark:text-white mt-2">
              Import Pipeline
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              CSV Sheets · NTA Question Papers (PDF)
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Start Ingestion</span>
              <ArrowRight size={13} />
            </div>
          </Link>
        </div>
      </section>

      {/* Two-Column Logs & Submissions Feed matching Student Home structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-900/5 dark:border-white/5 rounded-[2rem] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-brand" />
                Recent Test Submissions
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time student attempt logs
              </p>
            </div>
            <Link
              to="/admin/analytics"
              className="text-xs font-bold text-brand hover:underline"
            >
              All Submissions →
            </Link>
          </div>

          <div className="divide-y divide-slate-200/50 dark:divide-white/5">
            {recentAttempts.map((a, i) => (
              <div key={i} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold flex items-center justify-center">
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {a.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(a.time).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-brand bg-brand/10 px-2.5 py-1 rounded-lg border border-brand/20">
                    {a.score} / {a.total}
                  </span>
                </div>
              </div>
            ))}
            {recentAttempts.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No exam attempts recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Security & Audit Feed */}
        <div className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-900/5 dark:border-white/5 rounded-[2rem] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={18} className="text-rose-500" />
                Administrative Activity
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audit trail for operations & role changes
              </p>
            </div>
            <Link
              to="/admin/settings"
              className="text-xs font-bold text-brand hover:underline"
            >
              Full Trail →
            </Link>
          </div>

          <div className="divide-y divide-slate-200/50 dark:divide-white/5">
            {logs.map((l, i) => (
              <div key={l.id || i} className="py-3.5">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {l.details}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                    {l.actorName || "Admin"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(l.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No activity logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
