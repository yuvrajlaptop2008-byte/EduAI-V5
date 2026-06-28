import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useUser } from "../../context/UserContext";
import { listExamGroups } from "../../services/examGroupsDB";
import { markAttendance, getAttendance } from "../../services/attendanceDB";
import type { ExamGroup, AttendanceStatus } from "../../types/schema";
import { toast } from "sonner";
import { CalendarCheck, Save, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface StudentLite { uid: string; name: string; }

export default function Attendance() {
  const { user } = useUser();
  const [groups, setGroups] = useState<ExamGroup[]>([]);
  const [groupId, setGroupId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<StudentLite[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { listExamGroups(user?.instituteId || undefined).then((gs) => { setGroups(gs); if (gs[0]) setGroupId(gs[0].id); }); }, [user?.instituteId]);

  useEffect(() => {
    if (!groupId) return;
    const q = query(collection(db, "users"), where("examGroupId", "==", groupId));
    getDocs(q).then((snap) => setStudents(snap.docs.map((d) => ({ uid: d.id, name: (d.data() as any).name || "Student" }))));
    getAttendance(groupId, date).then((rec) => setStatusMap(rec?.students || {}));
  }, [groupId, date]);

  const setStatus = (uid: string, status: AttendanceStatus) => setStatusMap((m) => ({ ...m, [uid]: status }));
  const summary = useMemo(() => {
    const vals = Object.values(statusMap);
    return { present: vals.filter((v) => v === "present").length, absent: vals.filter((v) => v === "absent").length, late: vals.filter((v) => v === "late").length };
  }, [statusMap]);

  const save = async () => {
    if (!groupId) return;
    setSaving(true);
    try {
      await markAttendance(groupId, date, user!.uid, statusMap);
      toast.success("Attendance saved.");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save.");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <CalendarCheck className="text-brand" size={20} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance</h1>
        <Link to="/teacher/attendance/trends" className="ml-auto flex items-center gap-1.5 text-sm text-brand hover:underline"><TrendingUp size={14} /> View Trends</Link>
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <select className="input" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        <span className="text-xs text-slate-500">
          <span className="text-emerald-500 font-semibold">{summary.present} present</span> · <span className="text-red-500 font-semibold">{summary.absent} absent</span> · <span className="text-amber-500 font-semibold">{summary.late} late</span>
        </span>
        <button onClick={save} disabled={saving} className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold shadow-md shadow-brand/20 disabled:opacity-50">
          <Save size={14} /> {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {students.map((s) => (
          <div key={s.uid} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold shrink-0">
                {s.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-100">{s.name}</p>
            </div>
            <div className="flex gap-1">
              {(["present", "absent", "late"] as AttendanceStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatus(s.uid, st)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize ${
                    statusMap[s.uid] === st ? "bg-brand text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        ))}
        {groupId && students.length === 0 && <p className="text-sm text-slate-500">No students in this exam group yet.</p>}
      </div>
    </div>
  );
}
