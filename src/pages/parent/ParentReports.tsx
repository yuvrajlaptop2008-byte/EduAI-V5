import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FileText, Download } from "lucide-react";
import { useParentChild } from "./useParentChild";
import { listAttemptsForStudent } from "../../services/groupTestsDB";
import { listRecentAttendance, studentAttendancePct } from "../../services/attendanceDB";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

type Period = "weekly" | "monthly";

export default function ParentReports() {
  const { child, children, childId, setChildId } = useParentChild();
  const [period, setPeriod] = useState<Period>("weekly");
  const [attempts, setAttempts] = useState<any[]>([]);
  const [attendancePct, setAttendancePct] = useState(0);

  useEffect(() => {
    if (!child) return;
    listAttemptsForStudent(child.uid).then(setAttempts);
    if (child.examGroupId) {
      listRecentAttendance(child.examGroupId, 30)
        .then(r => setAttendancePct(studentAttendancePct(r, child.uid)));
    }
  }, [child?.uid]);

  const now = Date.now();
  const cutoff = period === "weekly" ? now - 7 * 86400000 : now - 30 * 86400000;
  const periodAttempts = attempts.filter(a => a.submittedAt >= cutoff);
  const avgScore = periodAttempts.length ? Math.round(periodAttempts.reduce((s, a) => s + a.score, 0) / periodAttempts.length) : 0;
  const avgAccuracy = periodAttempts.length ? Math.round(periodAttempts.reduce((s, a) => s + (a.score / a.totalMarks) * 100, 0) / periodAttempts.length) : 0;
  const chartData = [...attempts].reverse().slice(-10).map((a, i) => ({ test: `T${i + 1}`, score: a.score, accuracy: Math.round((a.score / a.totalMarks) * 100) }));

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <FileText className="text-brand" size={20} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
      </div>

      {children.length > 1 && (
        <select className="input mb-4" value={childId || ""} onChange={e => setChildId(e.target.value)}>
          {children.map(c => <option key={c.uid} value={c.uid}>{c.name}</option>)}
        </select>
      )}

      <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-fit mb-5">
        {(["weekly", "monthly"] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize ${period === p ? "bg-white dark:bg-slate-800 text-brand shadow-sm" : "text-slate-500"}`}>
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Tests", val: periodAttempts.length },
          { label: "Avg Score", val: avgScore },
          { label: "Avg Accuracy", val: `${avgAccuracy}%` },
          { label: "Attendance", val: `${attendancePct}%` },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center">
            <p className="text-2xl font-extrabold text-brand">{s.val}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 h-56">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Score Trend</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="test" fontSize={10} /><YAxis fontSize={10} />
                <Tooltip /><Line type="monotone" dataKey="score" stroke="#ff6b00" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 h-56">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Accuracy %</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="test" fontSize={10} /><YAxis fontSize={10} unit="%" />
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Bar dataKey="accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {child && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-500">
          Report for <span className="font-semibold text-slate-700 dark:text-slate-200">{child.name}</span> · {period === "weekly" ? "Last 7 days" : "Last 30 days"} · Generated {new Date().toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
