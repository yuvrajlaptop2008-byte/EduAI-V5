import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { listAttemptsForStudent } from "../../services/groupTestsDB";
import { listRemarksForStudent, addRemark, deleteRemark } from "../../services/remarksDB";
import { listRecentAttendance, studentAttendancePct } from "../../services/attendanceDB";
import { getAllDppProgress } from "../../utils/firestoreDppDB";
import type { GroupTestAttempt, RemarkDoc } from "../../types/schema";
import { useUser } from "../../context/UserContext";
import { toast } from "sonner";
import {
  ArrowLeft, Trophy, CalendarCheck, MessageSquare, TrendingUp,
  BookOpen, Target, Trash2, Eye, EyeOff, Send, CheckCircle2, XCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import StatCard from "../../components/layout/StatCard";

export default function StudentDetail() {
  const { studentId } = useParams<{ studentId: string }>();
  const { user } = useUser();
  const [student, setStudent] = useState<{ name: string; email: string; examGroupId?: string; role?: string } | null>(null);
  const [attempts, setAttempts] = useState<GroupTestAttempt[]>([]);
  const [remarks, setRemarks] = useState<RemarkDoc[]>([]);
  const [attendancePct, setAttendancePct] = useState<number | null>(null);
  const [dppCount, setDppCount] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  const [newRemark, setNewRemark] = useState("");
  const [parentVisible, setParentVisible] = useState(true);
  const [subject, setSubject] = useState("General");
  const [tab, setTab] = useState<"overview"|"tests"|"remarks"|"attendance">("overview");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    getDoc(doc(db, "users", studentId)).then(snap => { if (snap.exists()) setStudent(snap.data() as any); });
    listAttemptsForStudent(studentId).then(setAttempts);
    listRemarksForStudent(studentId).then(setRemarks);
    getAllDppProgress(studentId).then(prog => {
      const completed = Object.values(prog).reduce((s, ch) => s + Object.values(ch.completedDpps || {}).filter(d => (d as any).status === "completed").length, 0);
      setDppCount({ completed, total: Object.values(prog).reduce((s, ch) => s + Object.keys(ch.completedDpps || {}).length, 0) });
    });
  }, [studentId]);

  useEffect(() => {
    if (!student?.examGroupId || !studentId) return;
    listRecentAttendance(student.examGroupId, 30).then(r => setAttendancePct(studentAttendancePct(r, studentId)));
  }, [student?.examGroupId, studentId]);

  const addNewRemark = async () => {
    if (!newRemark.trim() || !studentId || !user) return;
    setSending(true);
    await addRemark({ studentId, teacherId: user.uid, teacherName: user.name, instituteId: user.instituteId || "default", examGroupId: student?.examGroupId || "", subject, text: newRemark, isParentVisible: parentVisible });
    toast.success("Remark added.");
    setNewRemark("");
    listRemarksForStudent(studentId).then(setRemarks);
    setSending(false);
  };

  const delRemark = async (id: string) => {
    await deleteRemark(id);
    toast.success("Remark deleted.");
    if (studentId) listRemarksForStudent(studentId).then(setRemarks);
  };

  const avg = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length) : 0;
  const bestRank = attempts.map(a => a.rank).filter((r): r is number => r !== null);
  const avgAccuracy = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.score / a.totalMarks) * 100, 0) / attempts.length) : 0;
  const chartData = [...attempts].reverse().map((a, i) => ({ test: `T${i + 1}`, score: a.score, max: a.totalMarks }));
  const accuracyData = [...attempts].reverse().map((a, i) => ({ test: `T${i + 1}`, acc: Math.round((a.score / a.totalMarks) * 100) }));

  if (!student) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  const TABS = ["overview","tests","remarks","attendance"] as const;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/teacher/students" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-brand transition-colors">
          <ArrowLeft size={18}/>
        </Link>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand/20 to-orange-500/20 text-brand font-extrabold text-lg flex items-center justify-center shrink-0">
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{student.name}</h1>
          <p className="text-sm text-slate-500">{student.email}{student.examGroupId && ` · ${student.examGroupId.replace("group-","")}`}</p>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Tests Taken" value={attempts.length} icon={BookOpen} gradient="from-orange-500 to-pink-600"/>
        <StatCard label="Avg Score" value={avg || "—"} icon={TrendingUp} gradient="from-violet-500 to-indigo-600" delay={0.04}/>
        <StatCard label="Avg Accuracy" value={avgAccuracy ? `${avgAccuracy}%` : "—"} icon={Target} gradient="from-sky-500 to-blue-600" delay={0.08}/>
        <StatCard label="Best Rank" value={bestRank.length ? `#${Math.min(...bestRank)}` : "—"} icon={Trophy} gradient="from-amber-500 to-orange-600" delay={0.12}/>
        <StatCard label="Attendance" value={attendancePct !== null ? `${attendancePct}%` : "—"} icon={CalendarCheck} gradient={`${attendancePct !== null && attendancePct < 75 ? "from-red-500 to-rose-600" : "from-emerald-500 to-teal-600"}`} delay={0.16}/>
      </div>

      {/* DPP progress */}
      {dppCount.total > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={18}/>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">DPP Progress</p>
            <div className="h-1.5 bg-slate-100 dark:bg-white/10 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${dppCount.total ? Math.round((dppCount.completed/dppCount.total)*100) : 0}%` }}/>
            </div>
          </div>
          <span className="text-sm font-bold text-emerald-600 shrink-0">{dppCount.completed}/{dppCount.total}</span>
        </div>
      )}

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-white/10">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${tab===t ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
            {t} {t==="remarks" && remarks.length > 0 && <span className="ml-1 text-xs bg-brand/10 text-brand px-1.5 py-0.5 rounded-full">{remarks.length}</span>}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Score Trend</p>
            {chartData.length > 1 ? (
              <div className="h-48"><ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15}/>
                  <XAxis dataKey="test" fontSize={10}/><YAxis fontSize={10}/>
                  <Tooltip formatter={(v: any) => [v, "Score"]}/>
                  <Line type="monotone" dataKey="score" stroke="#ff6b00" strokeWidth={2} dot={{ r: 3 }}/>
                  <Line type="monotone" dataKey="max" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 2" dot={false}/>
                </LineChart>
              </ResponsiveContainer></div>
            ) : <p className="text-sm text-slate-500 py-8 text-center">Not enough tests yet.</p>}
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Accuracy Trend</p>
            {accuracyData.length > 1 ? (
              <div className="h-48"><ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15}/>
                  <XAxis dataKey="test" fontSize={10}/><YAxis unit="%" fontSize={10} domain={[0,100]}/>
                  <Tooltip formatter={(v: any) => [`${v}%`,"Accuracy"]}/>
                  <Bar dataKey="acc" fill="#6366f1" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer></div>
            ) : <p className="text-sm text-slate-500 py-8 text-center">Not enough tests yet.</p>}
          </div>
        </div>
      )}

      {/* Tests history */}
      {tab === "tests" && (
        <div className="space-y-2">
          {attempts.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{new Date(a.submittedAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</p>
                <p className="text-xs text-slate-500 mt-0.5">{Math.round(a.timeTakenSec/60)} min · Rank {a.rank ?? "—"}{(a as any).percentile != null ? ` · ${(a as any).percentile}th %ile` : ""}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-brand">{a.score}<span className="text-sm text-slate-400 font-normal">/{a.totalMarks}</span></p>
                <p className="text-xs text-slate-500">{Math.round((a.score/a.totalMarks)*100)}% accuracy</p>
              </div>
            </motion.div>
          ))}
          {attempts.length === 0 && <p className="text-sm text-slate-500 text-center py-10">No test attempts yet.</p>}
        </div>
      )}

      {/* Remarks */}
      {tab === "remarks" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Add Remark</p>
            <div className="grid grid-cols-2 gap-2">
              <input className="input" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)}/>
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 px-3">
                <input type="checkbox" checked={parentVisible} onChange={e => setParentVisible(e.target.checked)}/>
                Parent can see this
              </label>
            </div>
            <div className="flex gap-2">
              <textarea className="input flex-1" rows={3} placeholder="Write your remark here…" value={newRemark} onChange={e => setNewRemark(e.target.value)}/>
            </div>
            <button onClick={addNewRemark} disabled={sending || !newRemark.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold shadow-md shadow-brand/20 disabled:opacity-50">
              <Send size={14}/> {sending ? "Sending…" : "Send Remark"}
            </button>
          </div>

          <div className="space-y-2">
            {remarks.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand uppercase tracking-wide">{r.subject}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${r.isParentVisible ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>
                      {r.isParentVisible ? "Parent visible" : "Private"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    <button onClick={() => delRemark(r.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                  </div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200">{r.text}</p>
              </motion.div>
            ))}
            {remarks.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No remarks yet.</p>}
          </div>
        </div>
      )}

      {/* Attendance */}
      {tab === "attendance" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
          {attendancePct !== null ? (
            <div className="text-center py-4">
              <p className={`text-5xl font-black mb-2 ${attendancePct < 75 ? "text-red-500" : attendancePct < 90 ? "text-amber-500" : "text-emerald-500"}`}>{attendancePct}%</p>
              <p className="text-slate-500 text-sm">Attendance rate (last 30 sessions)</p>
              {attendancePct < 75 && <p className="mt-3 text-sm text-red-500 bg-red-500/10 rounded-xl px-4 py-2 inline-block">⚠ Below 75% — consider notifying parents</p>}
            </div>
          ) : <p className="text-sm text-slate-500 text-center py-8">No attendance data yet.</p>}
        </div>
      )}
    </div>
  );
}
