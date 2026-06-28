import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useUser } from "../../context/UserContext";
import { listTestsByTeacher, listAttemptsForTest } from "../../services/groupTestsDB";
import { listExamGroups } from "../../services/examGroupsDB";
import type { GroupTest, ExamGroup } from "../../types/schema";
import StatCard from "../../components/layout/StatCard";
import { SkeletonStatCards } from "../../components/Skeleton";
import { 
  Upload, ClipboardPlus, ListChecks, CalendarCheck,
  MessageSquare, FileQuestion, Sparkles, ChevronRight,
  TrendingUp, Clock, Users, Activity, BookOpen
} from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useUser();
  const [questionCount, setQuestionCount] = useState<number | null>(null);
  const [tests, setTests] = useState<GroupTest[]>([]);
  const [groups, setGroups] = useState<ExamGroup[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<{label:string;time:string;type:string}[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [qSnap, teacherTests, examGroups] = await Promise.all([
        getDocs(collection(db, "custom_questions")),
        listTestsByTeacher(user.uid),
        listExamGroups(user.instituteId || undefined),
      ]);
      setQuestionCount(qSnap.size);
      setTests(teacherTests);
      setGroups(examGroups);

      // Count students in my groups
      const myGroupIds = new Set(teacherTests.flatMap(t => t.assignedGroupIds));
      let students = 0;
      for (const g of examGroups) {
        if (myGroupIds.has(g.id)) students += g.studentIds.length;
      }
      setStudentCount(students);

      // Count total attempts on my tests
      let attempts = 0;
      const activity: {label:string;time:string;type:string}[] = [];
      for (const t of teacherTests.slice(0, 3)) {
        const att = await listAttemptsForTest(t.id);
        attempts += att.length;
        if (att[0]) {
          activity.push({ label: `${att[0].studentName} submitted "${t.title}"`, time: new Date(att[0].submittedAt).toLocaleDateString(), type: "attempt" });
        }
      }
      setTotalAttempts(attempts);
      setRecentActivity(activity);
      setLoading(false);
    };
    load();
  }, [user]);

  const published = tests.filter(t => t.isPublished).length;
  const pending = tests.filter(t => !t.isPublished).length;

  const quickActions = [
    { to: "/teacher/create-test", label: "Create Test", icon: ClipboardPlus, gradient: "from-violet-500 to-indigo-600", desc: "New assignment" },
    { to: "/teacher/upload", label: "Add Questions", icon: Upload, gradient: "from-orange-500 to-pink-600", desc: "Expand the bank" },
    { to: "/teacher/attendance", label: "Take Attendance", icon: CalendarCheck, gradient: "from-sky-500 to-blue-600", desc: "Mark today" },
    { to: "/teacher/remarks", label: "Write Remark", icon: MessageSquare, gradient: "from-rose-500 to-red-600", desc: "Student feedback" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-slate-900 dark:text-white">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user?.name?.split(" ")[0] || "Teacher"} 👋
          </motion.h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <Link to="/teacher/tests" className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold shadow-md shadow-brand/20 hover:bg-brand/90 transition-colors">
          <ListChecks size={16} /> My Tests
        </Link>
      </div>

      {/* Stats */}
      {loading ? <SkeletonStatCards count={5} /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Students Reached" value={studentCount} icon={Users} gradient="from-sky-500 to-blue-600" />
          <StatCard label="Tests Created" value={tests.length} icon={ClipboardPlus} gradient="from-violet-500 to-indigo-600" delay={0.05} />
          <StatCard label="Published" value={published} icon={ListChecks} gradient="from-emerald-500 to-teal-600" delay={0.1} />
          <StatCard label="Total Attempts" value={totalAttempts} icon={TrendingUp} gradient="from-amber-500 to-orange-600" delay={0.15} />
          <StatCard label="Questions" value={questionCount ?? "…"} icon={FileQuestion} gradient="from-rose-500 to-red-600" delay={0.2} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick actions */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Quick Actions</p>
          {quickActions.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div key={a.to} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <Link to={a.to} className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-brand hover:shadow-lg hover:shadow-brand/5 transition-all group">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center shadow-md shrink-0`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{a.label}</p>
                    <p className="text-xs text-slate-400">{a.desc}</p>
                  </div>
                  <ChevronRight size={15} className="text-slate-300 group-hover:text-brand transition-colors shrink-0" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Recent tests */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">My Tests</p>
            <Link to="/teacher/tests" className="text-xs text-brand hover:underline">View all →</Link>
          </div>
          {tests.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-white/10 text-center">
              <ClipboardPlus className="text-slate-300 mb-2" size={28} />
              <p className="text-sm text-slate-500">No tests yet.</p>
              <Link to="/teacher/create-test" className="mt-3 text-sm text-brand font-medium hover:underline">Create your first test →</Link>
            </div>
          )}
          <div className="space-y-2">
            {tests.slice(0, 5).map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/teacher/tests/${t.id}/results`} className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-brand transition-colors group">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.isPublished ? "bg-emerald-500/10" : "bg-slate-100 dark:bg-white/5"}`}>
                    <BookOpen size={16} className={t.isPublished ? "text-emerald-600" : "text-slate-400"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{t.title}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <Clock size={10} /> {t.duration}m · {t.questionIds.length}Q · {t.totalMarks}M
                      {t.scheduledAt && <span>· 📅 {new Date(t.scheduledAt).toLocaleDateString()}</span>}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${t.isPublished ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                    {t.isPublished ? "Live" : "Draft"}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Activity feed */}
          {recentActivity.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Recent Activity</p>
              <div className="space-y-2">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm">
                    <Activity size={13} className="text-brand shrink-0" />
                    <span className="text-slate-700 dark:text-slate-200 truncate">{a.label}</span>
                    <span className="text-slate-400 text-xs shrink-0 ml-auto">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
