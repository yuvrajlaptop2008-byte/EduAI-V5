import { useEffect, useState } from "react";
import { listRecentAttendance } from "../../services/attendanceDB";
import { useParentChild } from "./useParentChild";
import type { AttendanceRecord } from "../../types/schema";
import { CalendarCheck } from "lucide-react";

export default function ParentAttendance() {
  const { child } = useParentChild();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => { if (child?.examGroupId) listRecentAttendance(child.examGroupId).then(setRecords); }, [child?.examGroupId]);

  const relevant = child ? records.filter((r) => r.students[child.uid]) : [];
  const pct = relevant.length ? Math.round((relevant.filter((r) => r.students[child!.uid] === "present").length / relevant.length) * 100) : 0;

  return (
    <div>
      <div className="flex items-center gap-2"><CalendarCheck className="text-brand" size={20} /><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance {child ? `· ${child.name}` : ""}</h1></div>
      <p className="text-slate-500 dark:text-slate-400 mt-1">{relevant.length > 0 ? `${pct}% present (last ${relevant.length} sessions)` : "No attendance recorded yet."}</p>

      <div className="space-y-2 mt-5">
        {relevant.map((r) => (
          <div key={r.date} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm">
            <span className="text-slate-800 dark:text-slate-100">{r.date}</span>
            <span className={`capitalize font-medium ${r.students[child!.uid] === "present" ? "text-emerald-500" : r.students[child!.uid] === "late" ? "text-amber-500" : "text-red-500"}`}>
              {r.students[child!.uid]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
