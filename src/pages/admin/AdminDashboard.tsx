import { useEffect, useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import { db } from "../../firebase";
import { dataService } from "../../services/dataService";
import { Link, useNavigate } from "react-router-dom";
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
  BookOpen,
  FileText,
  Flame,
  RotateCw,
  Beaker,
  Battery,
  Thermometer,
  Calculator,
  Grid,
  Cpu,
} from "lucide-react";

const StudentAttendance = lazy(() => import("../StudentAttendance"));
const StudentRemarks = lazy(() => import("../StudentRemarks"));

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Physics");
  const [overlay, setOverlay] = useState<"attendance" | "remarks" | null>(null);

  const exams = [
    { name: "JEE Main", color: "text-blue-400", bg: "bg-blue-400/10" },
    { name: "JEE Advanced", color: "text-rose-400", bg: "bg-rose-400/10" },
    { name: "BITSAT", color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { name: "MHT-CET", color: "text-purple-400", bg: "bg-purple-400/10" },
    { name: "NDA", color: "text-amber-400", bg: "bg-amber-400/10" },
    { name: "VITEEE", color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { name: "NEST", color: "text-pink-400", bg: "bg-pink-400/10" },
    { name: "COMEDK", color: "text-indigo-400", bg: "bg-indigo-400/10" },
  ];

  const chapters = {
    Physics: [
      {
        title: "Current Electricity",
        qs: 6,
        color: "from-blue-500 to-blue-600",
        icon: <Zap size={20} />,
      },
      {
        title: "Semiconductors",
        qs: 2,
        color: "from-emerald-500 to-emerald-600",
        icon: <Cpu size={20} />,
      },
      {
        title: "Alternating Current",
        qs: 2,
        color: "from-rose-500 to-rose-600",
        icon: <Activity size={20} />,
      },
      {
        title: "Rotational Motion",
        qs: 2,
        color: "from-purple-500 to-purple-600",
        icon: <RotateCw size={20} />,
      },
    ],
    Chemistry: [
      {
        title: "p Block Elements",
        qs: 2,
        color: "from-orange-500 to-orange-600",
        icon: <Beaker size={20} />,
      },
      {
        title: "Electrochemistry",
        qs: 2,
        color: "from-teal-500 to-teal-600",
        icon: <Battery size={20} />,
      },
      {
        title: "Thermodynamics",
        qs: 1,
        color: "from-cyan-500 to-cyan-600",
        icon: <Thermometer size={20} />,
      },
      {
        title: "Chemical Kinetics",
        qs: 2,
        color: "from-pink-500 to-pink-600",
        icon: <Activity size={20} />,
      },
      {
        title: "Organic Chemistry",
        qs: 1,
        color: "from-orange-500 to-orange-600",
        icon: <Beaker size={20} />,
      },
      {
        title: "Chemical Bonding",
        qs: 1,
        color: "from-purple-500 to-purple-600",
        icon: <Beaker size={20} />,
      },
    ],
    Maths: [
      {
        title: "Calculus",
        qs: 3,
        color: "from-indigo-500 to-indigo-600",
        icon: <Calculator size={20} />,
      },
      {
        title: "Coordinate Geometry",
        qs: 2,
        color: "from-amber-500 to-amber-600",
        icon: <Grid size={20} />,
      },
      {
        title: "Algebra",
        qs: 1,
        color: "from-amber-500 to-amber-600",
        icon: <Calculator size={20} />,
      },
    ],
  };

  const tabs = ["Physics", "Chemistry", "Maths"];
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

      {/* Chapter PYQ Bank */}
      <section>
        <div className="flex justify-between items-center mb-4 border-b border-slate-900/5 dark:border-white/5 pb-3">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
              <BookOpen size={16} />
            </div>
            Chapter PYQ Bank
          </h2>
          <button
            onClick={() => navigate("/app/tests")}
            className="text-indigo-400 text-xs font-bold uppercase tracking-wider hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 cursor-pointer"
          >
            View All
          </button>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-6 px-6 snap-x">
          <div className="grid grid-rows-2 grid-flow-col gap-4">
            {exams.map((exam, i) => {
              const examId = exam.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
              return (
                <motion.div
                  key={i}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/app/exam/${examId}`)}
                  className="w-36 h-28 bg-slate-50/60 dark:bg-slate-800/60 backdrop-blur-md rounded-[1.5rem] p-4 border border-slate-200/50 dark:border-slate-700/50 flex flex-col justify-between snap-start hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 hover:border-slate-600 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
                >
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/5 dark:bg-slate-900/5 rounded-full blur-xl group-hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" />
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${exam.bg} ${exam.color}`}
                  >
                    <BookOpen size={20} />
                  </div>
                  <span className="text-sm font-bold leading-tight relative z-10 text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:hover:text-white">
                    {exam.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MARKS Tests */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">MARKS Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/app/tests"
            state={{ initialView: "pyq-exam-list", selectedExam: "JEE Main" }}
          >
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="p-5 rounded-[2rem] border border-indigo-500/30 bg-gradient-to-br from-slate-100/80 to-indigo-50/40 dark:from-slate-800/80 dark:to-indigo-950/40 relative overflow-hidden group cursor-pointer shadow-xl shadow-indigo-900/20 h-full flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors duration-500" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="pr-4 tracking-wide w-full">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                      PYQ Mock Tests
                    </h3>
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-black rounded-lg uppercase shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                      NEW
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    Real previous year questions in exam-simulated
                    environment.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-indigo-400 to-blue-500" />
                      <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-purple-400 to-pink-500" />
                    </div>
                    <span className="text-[10px] font-medium text-indigo-400">
                      Full exam simulation
                    </span>
                  </div>
                </div>
                <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[1rem] flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 ml-4">
                  <FileText size={24} />
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/app/tests" state={{ initialView: "create-flow" }}>
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="p-5 rounded-[2rem] border border-emerald-500/30 bg-gradient-to-br from-emerald-50/80 to-emerald-100/40 dark:from-slate-800/80 dark:to-emerald-950/40 relative overflow-hidden group cursor-pointer shadow-xl shadow-emerald-900/20 h-full flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-500" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="pr-4 tracking-wide w-full">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                      Create Custom Test
                    </h3>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black rounded-lg uppercase shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      UPDATED
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    Select subjects and set your own timer. Build practice
                    sessions.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-emerald-400 to-teal-500" />
                      <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-cyan-400 to-blue-500" />
                    </div>
                    <span className="text-[10px] font-medium text-emerald-400">
                      Customizable practice
                    </span>
                  </div>
                </div>
                <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-[1rem] flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ml-4">
                  <Calendar size={24} />
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/app/dpp" className="block">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="p-5 rounded-[2rem] border border-orange-500/30 bg-gradient-to-br from-orange-50/80 to-orange-100/40 dark:from-slate-800/80 dark:to-orange-950/40 relative overflow-hidden group cursor-pointer shadow-xl shadow-orange-900/20 h-full flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/20 transition-colors duration-500" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="pr-4 tracking-wide w-full">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-orange-400 transition-colors">
                      Solve DPPs
                    </h3>
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black rounded-lg uppercase shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                      HOT
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    Structured Daily Practice. 700+ curated problems by expert educators.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-orange-400 to-amber-500" />
                      <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-red-400 to-orange-500" />
                    </div>
                    <span className="text-[10px] font-medium text-orange-400">
                      Structured Daily Practice
                    </span>
                  </div>
                </div>
                <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-600 rounded-[1rem] flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ml-4">
                  <Flame size={24} />
                </div>
              </div>
            </motion.div>
          </Link>

          <Link
            to="/app/tests"
            state={{ initialView: "class-test-list" }}
            className="block"
          >
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="p-5 rounded-[2rem] border border-purple-500/30 bg-gradient-to-br from-purple-50/80 to-purple-100/40 dark:from-slate-800/80 dark:to-purple-950/40 relative overflow-hidden group cursor-pointer shadow-xl shadow-purple-900/20 h-full flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-colors duration-500" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="pr-4 tracking-wide w-full">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-purple-400 transition-colors tracking-tight">
                      Class Tests
                    </h3>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-black rounded-lg uppercase shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                      ASSIGNED
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    Attempt structured tests officially assigned by your
                    teachers.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-purple-400 to-indigo-500" />
                      <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-pink-400 to-purple-500" />
                    </div>
                    <span className="text-[10px] font-medium text-purple-400">
                      Assigned by teachers
                    </span>
                  </div>
                </div>
                <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-[1rem] flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 ml-4">
                  <GraduationCap size={24} />
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Attendance + Remarks quick-access row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.button
            onClick={() => setOverlay("attendance")}
            whileTap={{ scale: 0.97 }}
            className="p-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/80 to-teal-100/40 dark:from-slate-800/80 dark:to-emerald-950/40 text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-2">
              <Calendar size={16} className="text-white" />
            </div>
            <p className="font-bold text-sm text-slate-900 dark:text-white">Attendance</p>
            <p className="text-xs text-slate-500 mt-0.5">Your records & trend</p>
          </motion.button>
          <motion.button
            onClick={() => setOverlay("remarks")}
            whileTap={{ scale: 0.97 }}
            className="p-4 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-50/80 to-purple-100/40 dark:from-slate-800/80 dark:to-violet-950/40 text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center mb-2">
              <Activity size={16} className="text-white" />
            </div>
            <p className="font-bold text-sm text-slate-900 dark:text-white">Remarks</p>
            <p className="text-xs text-slate-500 mt-0.5">Feedback from teachers</p>
          </motion.button>
        </div>

        {/* Analytics quick-link */}
        <Link to="/app/analytics" className="block mb-3">
          <motion.div whileTap={{scale:0.97}} className="p-3.5 rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-50/80 to-blue-100/40 dark:from-slate-800/80 dark:to-sky-950/40 flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center"><Activity size={16} className="text-white"/></div><div><p className="font-bold text-sm text-slate-900 dark:text-white">My Analytics</p><p className="text-xs text-slate-500">Score trends · subject accuracy</p></div></div>
            <ChevronRight size={16} className="text-slate-300"/>
          </motion.div>
        </Link>
      </section>

      {/* Formula Cards */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <FileText className="text-brand" />
            Formula Cards
          </h2>
          <Link
            to="/app/formulas"
            className="text-sm font-bold text-brand bg-brand/10 px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-brand/20 transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="flex bg-slate-50/50 dark:bg-slate-800/50 p-1.5 rounded-2xl mb-6 shadow-inner border border-slate-900/5 dark:border-white/5 mx-auto max-w-md">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-[1] py-2.5 rounded-xl text-sm font-bold transition-all relative z-10 cursor-pointer ${activeTab === tab ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="adminFormulaTabIndicator"
                  className="absolute inset-0 bg-brand rounded-xl -z-10 shadow-lg shadow-brand/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {tab}
            </button>
          ))}
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-6 px-6 snap-x">
          <Link
            to={`/app/formulas/${activeTab}`}
            className="min-w-[160px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-[2rem] p-5 flex flex-col justify-center items-center h-48 snap-start shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-slate-900/5 dark:border-white/5 hover:border-brand/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-brand/5 group-hover:bg-brand/10 transition-colors" />
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-brand mb-4 shadow-inner border border-slate-900/5 dark:border-white/5 relative z-10">
              <FileText size={28} />
            </div>
            <h3 className="font-bold text-sm leading-tight text-center relative z-10 text-slate-900 dark:text-white">
              View All
              <br />
              {activeTab} Formulas
            </h3>
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <ChevronRight size={16} className="text-brand" />
            </div>
          </Link>
          {(chapters[activeTab as keyof typeof chapters] || []).map(
            (chapter, i) => (
              <Link
                key={i}
                to={`/app/formulas/${activeTab}/${encodeURIComponent(chapter.title)}`}
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={`min-w-[160px] bg-gradient-to-br ${chapter.color} rounded-[2rem] p-6 flex flex-col justify-between h-48 snap-start shadow-[0_8px_30px_rgb(0,0,0,0.4)] cursor-pointer relative overflow-hidden group`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 dark:bg-slate-900/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" />
                  <div className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-slate-900/10 dark:border-white/10 shadow-inner relative z-10">
                    {chapter.icon}
                  </div>
                  <div className="relative z-10 mt-4">
                    <h3 className="font-black text-[15px] leading-tight mb-2 drop-shadow-md text-white">
                      {chapter.title}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-900/10 dark:border-white/10 text-white">
                      <FileText size={12} className="opacity-80" />
                      <p className="text-[10px] font-bold opacity-90 uppercase tracking-widest leading-none">
                        {chapter.qs} Cards
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ),
          )}
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

      {/* Full-screen overlays for student attendance/remarks */}
      <AnimatePresence>
        {overlay && (
          <motion.div
            key={overlay}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-0 z-[100] overflow-y-auto"
          >
            <Suspense
              fallback={
                <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              {overlay === "attendance" && (
                <StudentAttendance onBack={() => setOverlay(null)} />
              )}
              {overlay === "remarks" && (
                <StudentRemarks onBack={() => setOverlay(null)} />
              )}
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
