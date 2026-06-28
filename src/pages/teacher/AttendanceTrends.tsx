import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useUser } from "../../context/UserContext";
import { listExamGroups } from "../../services/examGroupsDB";
import { listRecentAttendance } from "../../services/attendanceDB";
import type { ExamGroup, AttendanceRecord, AttendanceStatus } from "../../types/schema";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { TrendingUp, Users } from "lucide-react";

export default function AttendanceTrends() {
  const { user } = useUser();
  const [groups, setGroups] = useState<ExamGroup[]>([]);
  const [groupId, setGroupId] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<{ uid: string; name: string }[]>([]);

  useEffect(() => {
    listExamGroups(user?.instituteId || undefined).then((gs) => {
      setGroups(gs);
      if (gs[0]) setGroupId(gs[0].id);
    });
  }, [user?.instituteId]);

  useEffect(() => {
    if (!groupId) return;
    listRecentAttendance(groupId, 30).then(setRecords);
    getDocs(query(collection(db, "users"), where("examGroupId", "==", groupId))).then((snap) =>
      setStudents(snap.docs.map((d) => ({ uid: d.id, name: (d.data() as any).name || "Student" }))),
    );
  }, [groupId]);

  // Daily class attendance rate (last 30 sessions)
  const dailyRates = useMemo(
    () =>
      [...records].reverse().slice(-15).map((r) => {
        const vals = Object.values(r.students) as AttendanceStatus[];
        const present = vals.filter((v) => v === "present").length;
        return { date: r.date.slice(5), rate: vals.length ? Math.round((present / vals.length) * 100) : 0 };
      }),
    [records],
  );

  // Per-student attendance % across all loaded records
  const studentRates = useMemo(
    () =>
      students.map((s) => {
        const relevant = records.filter((r) => r.students[s.uid]);
        const present = relevant.filter((r) => r.students[s.uid] === "present").length;
        const pct = relevant.length ? Math.round((present / relevant.length) * 100) : 0;
        return { name: s.name.split(" ")[0], pct, absent: relevant.length - present };
      }).sort((a, b) => a.pct - b.pct),
    [students, records],
  );

  const lowAttendance = studentRates.filter((s) => s.pct < 75);

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="text-brand" size={20} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Trends</h1>
        <select className="input ml-auto" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      {lowAttendance.length > 0 && (
        <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
          <span className="text-amber-500 shrink-0">⚠</span>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            <span className="font-semibold">{lowAttendance.length} student{lowAttendance.length > 1 ? "s" : ""}</span> below 75% — {lowAttendance.map((s) => s.name).join(", ")}.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Class attendance rate (last 15 sessions)</p>
          <div className="h-56">
            {dailyRates.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyRates}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis domain={[0, 100]} fontSize={10} unit="%" />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                  <Line type="monotone" dataKey="rate" stroke="#ff6b00" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-slate-500">No records yet.</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-1.5"><Users size={14} /> Per-student attendance %</p>
          <div className="h-56 overflow-y-auto">
            {studentRates.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(200, studentRates.length * 28)}>
                <BarChart layout="vertical" data={studentRates}>
                  <XAxis type="number" domain={[0, 100]} fontSize={10} unit="%" />
                  <YAxis dataKey="name" type="category" fontSize={10} width={60} />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                  <Bar dataKey="pct" fill="#ff6b00" radius={[0, 4, 4, 0]}
                    label={{ position: "right", fontSize: 10, formatter: (v: any) => `${v}%` }} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-slate-500">No students in this group yet.</p>}
          </div>
        </div>
      </div>

      {/* Day-by-day table for most recent 7 sessions */}
      {records.length > 0 && (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10"><div className="bg-white dark:bg-slate-900 min-w-[600px]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-white/5 text-left text-slate-500">
              <tr>
                <th className="p-3">Student</th>
                {records.slice(0, 7).map((r) => <th key={r.date} className="p-3 text-center whitespace-nowrap">{r.date.slice(5)}</th>)}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.uid} className="border-t border-slate-100 dark:border-white/5">
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-100">{s.name}</td>
                  {records.slice(0, 7).map((r) => {
                    const st = r.students[s.uid] as AttendanceStatus | undefined;
                    return (
                      <td key={r.date} className="p-3 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${st === "present" ? "bg-emerald-500/10 text-emerald-600" : st === "late" ? "bg-amber-500/10 text-amber-600" : st === "absent" ? "bg-red-500/10 text-red-500" : "text-slate-300"}`}>
                          {st ? st[0].toUpperCase() : "—"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      )}
    </div>
  );
}
