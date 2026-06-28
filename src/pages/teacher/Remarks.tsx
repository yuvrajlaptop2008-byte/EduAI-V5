import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useUser } from "../../context/UserContext";
import { listExamGroups } from "../../services/examGroupsDB";
import { addRemark, listRemarksForStudent } from "../../services/remarksDB";
import type { ExamGroup, RemarkDoc } from "../../types/schema";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

interface StudentLite { uid: string; name: string; }

export default function Remarks() {
  const { user } = useUser();
  const [groups, setGroups] = useState<ExamGroup[]>([]);
  const [groupId, setGroupId] = useState("");
  const [students, setStudents] = useState<StudentLite[]>([]);
  const [studentId, setStudentId] = useState("");
  const [subject, setSubject] = useState("General");
  const [text, setText] = useState("");
  const [parentVisible, setParentVisible] = useState(true);
  const [history, setHistory] = useState<RemarkDoc[]>([]);

  useEffect(() => { listExamGroups(user?.instituteId || undefined).then((gs) => { setGroups(gs); if (gs[0]) setGroupId(gs[0].id); }); }, [user?.instituteId]);
  useEffect(() => {
    if (!groupId) return;
    getDocs(query(collection(db, "users"), where("examGroupId", "==", groupId))).then((snap) => {
      const list = snap.docs.map((d) => ({ uid: d.id, name: (d.data() as any).name || "Student" }));
      setStudents(list); if (list[0]) setStudentId(list[0].uid);
    });
  }, [groupId]);
  useEffect(() => { if (studentId) listRemarksForStudent(studentId).then(setHistory); }, [studentId]);

  const submit = async () => {
    if (!text.trim() || !studentId) return;
    await addRemark({
      studentId, teacherId: user!.uid, teacherName: user!.name,
      instituteId: user?.instituteId || "default", examGroupId: groupId,
      subject, text, isParentVisible: parentVisible,
    });
    toast.success("Remark added.");
    setText("");
    listRemarksForStudent(studentId).then(setHistory);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2"><MessageSquare className="text-brand" size={20} /><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Remarks</h1></div>
      <div className="flex gap-3 mt-4">
        <select className="input" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select className="input flex-1" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          {students.map((s) => <option key={s.uid} value={s.uid}>{s.name}</option>)}
        </select>
      </div>

      <div className="mt-4 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-4">
        <input className="input w-full" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <textarea className="input w-full" rows={3} placeholder="Remark…" value={text} onChange={(e) => setText(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={parentVisible} onChange={(e) => setParentVisible(e.target.checked)} />
          Visible to parent
        </label>
        <button onClick={submit} className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium">Add Remark</button>
      </div>

      <div className="mt-6 space-y-2">
        {history.map((r) => (
          <div key={r.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand uppercase tracking-wide">{r.subject}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.isParentVisible ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>
                {r.isParentVisible ? "Parent-visible" : "Private"}
              </span>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-100 mt-1.5">{r.text}</p>
            <p className="text-xs text-slate-500 mt-1.5">{r.teacherName} · {new Date(r.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
