import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { dataService } from "../../services/dataService";
import { useUser } from "../../context/UserContext";
import { listExamGroups } from "../../services/examGroupsDB";
import { createGroupTest } from "../../services/groupTestsDB";
import type { ExamGroup } from "../../types/schema";
import type { Question } from "../../utils/questionBank";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Search, ClipboardPlus, CheckCircle2, Circle, Layers } from "lucide-react";

export default function CreateGroupTest() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [groups, setGroups] = useState<ExamGroup[]>([]);
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [chapterFilter, setChapterFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(60);
  const [scheduleAt, setScheduleAt] = useState(""); // datetime-local string, empty = available immediately
  const [marksPerQ, setMarksPerQ] = useState(4);
  const [negativeMarks, setNegativeMarks] = useState(1);
  const [groupIds, setGroupIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dataService.getQuestions({ limit: 200 }).then((res) => {
      setQuestions(res.questions.filter((q) => q.status !== "pending" && q.status !== "rejected"));
    });
    listExamGroups(user?.instituteId || undefined).then((gs) => { setGroups(gs); if (gs[0]) setGroupIds(new Set([gs[0].id])); });
  }, [user?.instituteId]);

  const subjects = useMemo(() => ["All", ...Array.from(new Set(questions.map((q) => q.subject)))], [questions]);
  const chapters = useMemo(
    () => ["All", ...Array.from(new Set(questions.filter((q) => subjectFilter === "All" || q.subject === subjectFilter).map((q) => q.chapter)))],
    [questions, subjectFilter],
  );
  const filtered = useMemo(
    () => questions.filter((q) =>
      (subjectFilter === "All" || q.subject === subjectFilter) &&
      (chapterFilter === "All" || q.chapter === chapterFilter) &&
      (!search || q.text.toLowerCase().includes(search.toLowerCase())),
    ),
    [questions, subjectFilter, chapterFilter, search],
  );

  const toggleQ = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleGroup = (id: string) => {
    const next = new Set(groupIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setGroupIds(next);
  };
  const selectAllFiltered = () => setSelected(new Set([...selected, ...filtered.map((q) => q.id)]));

  const publish = async (isPublished: boolean) => {
    if (!title.trim() || selected.size === 0 || groupIds.size === 0) {
      toast.error("Add a title, pick at least 1 question and 1 exam group.");
      return;
    }
    setSaving(true);
    try {
      await createGroupTest({
        instituteId: user?.instituteId || "default",
        title,
        createdBy: user!.uid,
        createdByName: user!.name,
        assignedGroupIds: Array.from(groupIds),
        questionIds: Array.from(selected).map(String),
        duration,
        totalMarks: selected.size * marksPerQ,
        marksPerQuestion: marksPerQ,
        negativeMarks,
        scheduledAt: scheduleAt ? new Date(scheduleAt).getTime() : null,
        isPublished,
      });
      toast.success(isPublished ? "Test published to your exam group(s)." : "Saved as draft.");
      navigate("/teacher/tests");
    } catch (e: any) {
      toast.error(e?.message || "Failed to create test.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
        <ClipboardPlus className="text-brand" size={20} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Test</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-1 lg:sticky lg:top-6 self-start space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-3 shadow-sm">
            <input className="input w-full" placeholder="Test title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-slate-500">Duration (min)</label>
                <input type="number" className="input w-full" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-[11px] text-slate-500">Marks / Q</label>
                <input type="number" className="input w-full" value={marksPerQ} onChange={(e) => setMarksPerQ(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-[11px] text-slate-500">Negative</label>
                <input type="number" className="input w-full" value={negativeMarks} onChange={(e) => setNegativeMarks(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-500">Release time (optional — leave blank for immediate)</label>
              <input type="datetime-local" className="input w-full" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
            </div>

            <p className="text-xs font-medium text-slate-500 pt-1 flex items-center gap-1.5"><Layers size={13} /> Assign to exam group(s)</p>
            {groups.length === 0 && <p className="text-xs text-amber-500">No exam groups yet — Admin → Institutes → Exam Groups.</p>}
            <div className="space-y-1.5">
              {groups.map((g) => (
                <label key={g.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                  <input type="checkbox" checked={groupIds.has(g.id)} onChange={() => toggleGroup(g.id)} />
                  {g.name} <span className="text-xs text-slate-400">({g.studentIds.length})</span>
                </label>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>{selected.size} questions selected</span>
                <span className="font-bold text-brand">{selected.size * marksPerQ} marks</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => publish(false)} disabled={saving} className="flex-1 px-3 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 text-sm font-medium disabled:opacity-50">Save Draft</button>
                <button onClick={() => publish(true)} disabled={saving} className="flex-1 px-3 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold shadow-md shadow-brand/20 disabled:opacity-50">Publish</button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input w-full pl-9" placeholder="Search questions…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setChapterFilter("All"); }} className="input">
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={chapterFilter} onChange={(e) => setChapterFilter(e.target.value)} className="input">
              {chapters.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button onClick={selectAllFiltered} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300">
              Select all {filtered.length}
            </button>
          </div>

          <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
            {filtered.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                onClick={() => toggleQ(q.id)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  selected.has(q.id)
                    ? "bg-brand/5 border-brand/40"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:border-slate-300"
                }`}
              >
                {selected.has(q.id)
                  ? <CheckCircle2 size={18} className="text-brand mt-0.5 shrink-0" />
                  : <Circle size={18} className="text-slate-300 dark:text-slate-600 mt-0.5 shrink-0" />}
                <div className="flex-1">
                  <p className="text-sm text-slate-800 dark:text-slate-100">{q.text}</p>
                  <p className="text-xs text-slate-500 mt-1">{q.subject} · {q.chapter} · <span className="capitalize">{q.difficulty}</span></p>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-6">
                <p className="text-sm font-medium mb-3">No questions in the question bank yet.</p>
                <div className="flex justify-center gap-3">
                  <a href="/teacher/upload" className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-semibold shadow-sm">
                    ✍️ Upload Question
                  </a>
                  <a href="/admin/import" className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    📄 Bulk CSV Import
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
