import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CalendarCheck, TrendingUp } from "lucide-react";
import { useUser } from "../context/UserContext";
import { listRecentAttendance } from "../services/attendanceDB";
import type { AttendanceRecord, AttendanceStatus } from "../types/schema";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const STATUS_STYLE: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500 text-white",
  absent:  "bg-red-500/15 text-red-500 border border-red-500/30",
  late:    "bg-amber-500/15 text-amber-600 border border-amber-500/30",
};
const STATUS_LABEL: Record<AttendanceStatus, string> = { present: "P", absent: "A", late: "L" };

interface Props { onBack: () => void; }

export default function StudentAttendance({ onBack }: Props) {
  const { user } = useUser();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.examGroupId) { setLoading(false); return; }
    listRecentAttendance(user.examGroupId, 90)
      .then((r) => setRecords(r.filter((rec) => rec.students[user.uid])))
      .finally(() => setLoading(false));
  }, [user?.examGroupId, user?.uid]);

  const stats = useMemo(() => {
    const present = records.filter((r) => r.students[user!.uid] === "present").length;
    const absent  = records.filter((r) => r.students[user!.uid] === "absent").length;
    const late    = records.filter((r) => r.students[user!.uid] === "late").length;
    const pct     = records.length ? Math.round((present / records.length) * 100) : 0;
    return { present, absent, late, pct, total: records.length };
  }, [records, user?.uid]);

  // Weekly aggregates for bar chart (last 8 weeks)
  const weeklyData = useMemo(() => {
    const weeks: Record<string, { week: string; present: number; total: number }> = {};
    records.forEach((r) => {
      const d = new Date(r.date);
      const weekStart = new Date(d); weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (!weeks[key]) weeks[key] = { week: `${weekStart.getMonth()+1}/${weekStart.getDate()}`, present: 0, total: 0 };
      weeks[key].total++;
      if (r.students[user!.uid] === "present") weeks[key].present++;
    });
    return Object.values(weeks).slice(-8).map((w) => ({ ...w, pct: w.total ? Math.round((w.present/w.total)*100) : 0 }));
  }, [records, user?.uid]);

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-5 text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center gap-2 mb-5">
        <CalendarCheck className="text-brand" size={22} />
        <h1 className="text-xl font-bold text-white">My Attendance</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Present", val: stats.present, color: "text-emerald-400" },
          { label: "Absent",  val: stats.absent,  color: "text-red-400" },
          { label: "Late",    val: stats.late,     color: "text-amber-400" },
          { label: "Rate",    val: `${stats.pct}%`, color: "text-brand" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className={`text-xl font-extrabold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly trend chart */}
      {weeklyData.length > 1 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
          <p className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-brand" /> Weekly attendance %
          </p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="week" fontSize={10} stroke="#475569" />
                <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="pct" fill="#ff6b00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Day-by-day calendar grid */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="text-sm font-medium text-slate-300 mb-3">Last {records.length} sessions</p>
        {loading && <p className="text-xs text-slate-500">Loading…</p>}
        {!loading && records.length === 0 && (
          <p className="text-sm text-slate-500">No attendance recorded yet.</p>
        )}
        <div className="grid grid-cols-7 gap-1.5">
          {records.slice().reverse().map((r) => {
            const st = r.students[user!.uid] as AttendanceStatus;
            return (
              <div key={r.date} title={`${r.date} · ${st}`}
                className={`h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold ${STATUS_STYLE[st]}`}>
                <span>{STATUS_LABEL[st]}</span>
                <span className="text-[8px] opacity-70">{r.date.slice(8)}</span>
              </div>
            );
          })}
        </div>
        {!loading && records.length > 0 && (
          <div className="flex gap-3 mt-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Present</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/30 border border-red-500/40 inline-block" /> Absent</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/40 inline-block" /> Late</span>
          </div>
        )}
      </div>
    </div>
  );
}
