import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { listAttemptsForStudent } from "../../services/groupTestsDB";
import { listRecentAttendance, studentAttendancePct } from "../../services/attendanceDB";
import { listRemarksForStudent } from "../../services/remarksDB";
import { unreadCount } from "../../services/notificationsDB";
import { getAllDppProgress } from "../../utils/firestoreDppDB";
import { useParentChild } from "./useParentChild";
import { useUser } from "../../context/UserContext";
import StatCard from "../../components/layout/StatCard";
import { Award, Trophy, TrendingUp, CalendarCheck, BookOpen, MessageSquare, Bell, FileText, Sparkles } from "lucide-react";

export default function ParentDashboard() {
  const { user } = useUser();
  const { childId, child, children, setChildId } = useParentChild();
  const [latest, setLatest] = useState<{ score: number; totalMarks: number; rank: number | null; percentile: number | null } | null>(null);
  const [attendance, setAttendance] = useState<number | null>(null);
  const [dppCompleted, setDppCompleted] = useState<number>(0);
  const [remarks, setRemarks] = useState<number>(0);
  const [notifCount, setNotifCount] = useState<number>(0);

  useEffect(() => {
    if (!childId || !child) return;
    listAttemptsForStudent(childId).then(a =>
      setLatest(a[0] ? { score: a[0].score, totalMarks: a[0].totalMarks, rank: a[0].rank, percentile: (a[0] as any).percentile ?? null } : null)
    );
    if (child.examGroupId) {
      listRecentAttendance(child.examGroupId, 30).then(r => setAttendance(studentAttendancePct(r, childId)));
    }
    getAllDppProgress(childId).then(prog => {
      const total = Object.values(prog).reduce((s, ch) => s + Object.values(ch.completedDpps).filter(d => d.status === "completed").length, 0);
      setDppCompleted(total);
    });
    listRemarksForStudent(childId, true).then(r => setRemarks(r.length));
    if (user) unreadCount(user.uid).then(setNotifCount);
  }, [childId, child?.examGroupId, user?.uid]);

  const quickLinks = [
    { to: "/parent/progress", label: "Progress", icon: TrendingUp, color: "from-sky-400 to-blue-600" },
    { to: "/parent/attendance", label: "Attendance", icon: CalendarCheck, color: "from-emerald-400 to-teal-600" },
    { to: "/parent/remarks", label: "Remarks", icon: MessageSquare, color: "from-violet-400 to-purple-600" },
    { to: "/parent/reports", label: "Reports", icon: FileText, color: "from-amber-400 to-orange-600" },
    { to: "/parent/notifications", label: "Alerts", icon: Bell, color: "from-rose-400 to-red-600" },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
        <Sparkles className="text-brand" size={18} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Parent Dashboard</h1>
        {notifCount > 0 && (
          <Link to="/parent/notifications" className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold">
            <Bell size={12} /> {notifCount}
          </Link>
        )}
      </motion.div>

      {children.length > 1 && (
        <select className="input mt-3" value={childId || ""} onChange={e => setChildId(e.target.value)}>
          {children.map(c => <option key={c.uid} value={c.uid}>{c.name}</option>)}
        </select>
      )}

      {!child ? (
        <p className="text-sm text-slate-500 mt-6">No child linked yet — ask your institute admin to link one.</p>
      ) : (
        <>
          <p className="text-slate-500 dark:text-slate-400 mt-1 mb-5">Tracking <span className="font-semibold text-slate-700 dark:text-slate-200">{child.name}</span></p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Latest Score" value={latest ? `${latest.score}/${latest.totalMarks}` : "—"} icon={Award} gradient="from-orange-500 to-pink-600" />
            <StatCard label="Rank" value={latest?.rank ? `#${latest.rank}` : "—"} icon={Trophy} gradient="from-amber-500 to-orange-600" delay={0.05} />
            <StatCard label="Percentile" value={latest?.percentile != null ? `${latest.percentile}th` : "—"} icon={TrendingUp} gradient="from-emerald-500 to-teal-600" delay={0.1} />
            <StatCard label="Attendance" value={attendance !== null ? `${attendance}%` : "—"} icon={CalendarCheck} gradient="from-sky-500 to-blue-600" delay={0.15} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center">
              <p className="text-2xl font-extrabold text-brand">{dppCompleted}</p>
              <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1"><BookOpen size={11} /> DPPs Completed</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center">
              <p className="text-2xl font-extrabold text-violet-600">{remarks}</p>
              <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1"><MessageSquare size={11} /> Teacher Remarks</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {quickLinks.map(l => {
              const Icon = l.icon;
              return (
                <Link key={l.to} to={l.to} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-brand transition-colors text-center">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${l.color} flex items-center justify-center`}><Icon size={16} className="text-white" /></div>
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">{l.label}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
