import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { dataService } from "../../services/dataService";
import type { Question } from "../../utils/questionBank";
import { Trash2, Pencil, X, Check, FileQuestion, Search, ShieldAlert, ShieldCheck, ShieldX, Plus } from "lucide-react";
import { toast } from "sonner";
import StatCard from "../../components/layout/StatCard";
import { logAudit } from "../../services/auditLogDB";
import { useUser } from "../../context/UserContext";

export default function QuestionBank() {
  const { user } = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subject, setSubject] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editing, setEditing] = useState<Question | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "active" | "rejected">("all");
  const [languageFilter, setLanguageFilter] = useState("all");

  // Add Question State
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState("Physics");
  const [newChapter, setNewChapter] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [newExam, setNewExam] = useState("JEE_MAIN");
  const [newText, setNewText] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(0);
  const [newSolution, setNewSolution] = useState("");

  const resetNewForm = () => {
    setNewChapter("");
    setNewText("");
    setNewOptions(["", "", "", ""]);
    setNewCorrectAnswer(0);
    setNewSolution("");
  };

  const load = () => {
    dataService.getQuestions({ limit: 200 }).then((res) => {
      setQuestions(res.questions);
    });
  };
  useEffect(load, []);

  const subjects = useMemo(() => ["All", ...Array.from(new Set(questions.map((q) => q.subject)))], [questions]);
  const filtered = useMemo(
    () => questions.filter((q) =>
      (subject === "All" || q.subject === subject) &&
      (difficulty === "All" || q.difficulty === difficulty) &&
      (statusFilter === "all" || (statusFilter === "active" ? (q.status ?? "active") === "active" : q.status === statusFilter)) &&
      (languageFilter === "all" || (q as any).language === languageFilter) &&
      (!search || q.text.toLowerCase().includes(search.toLowerCase()) || q.chapter.toLowerCase().includes(search.toLowerCase())),
    ),
    [questions, subject, difficulty, search, statusFilter],
  );
  const pendingCount = questions.filter((q) => q.status === "pending").length;

  const remove = async (id: number) => {
    await dataService.deleteQuestion(id);
    logAudit(user!.uid, user!.name, "question.delete", `Deleted question #${id}`);
    toast.success("Question removed.");
    load();
  };

  const bulkDelete = async () => {
    await Promise.all(Array.from(selected).map((id) => dataService.deleteQuestion(id)));
    logAudit(user!.uid, user!.name, "question.bulkDelete", `Deleted ${selected.size} questions`);
    toast.success(`${selected.size} questions removed.`);
    setSelected(new Set());
    load();
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const saveEdit = async () => {
    if (!editing) return;
    await dataService.saveQuestion(editing);
    logAudit(user!.uid, user!.name, "question.edit", `Edited question #${editing.id}`);
    toast.success("Question updated.");
    setEditing(null);
    load();
  };

  const moderate = async (q: Question, status: "active" | "rejected") => {
    await dataService.saveQuestion({ ...q, status });
    logAudit(user!.uid, user!.name, `question.${status === "active" ? "approve" : "reject"}`, `${status === "active" ? "Approved" : "Rejected"} question #${q.id} from ${q.uploadedByName || "unknown"}`);
    toast.success(status === "active" ? "Approved." : "Rejected.");
    load();
  };

  const createQuestion = async () => {
    if (!newText.trim() || !newChapter.trim() || newOptions.some((o) => !o.trim())) {
      toast.error("Please fill chapter, question text and all 4 options.");
      return;
    }
    const id = Date.now();
    await dataService.saveQuestion({
      id,
      subject: newSubject,
      chapter: newChapter,
      difficulty: newDifficulty,
      text: newText,
      options: newOptions,
      correctAnswer: newCorrectAnswer,
      solution: newSolution,
      exam: newExam,
      status: "active",
      uploadedBy: user?.uid,
      uploadedByName: user?.name,
    });
    logAudit(user!.uid, user!.name, "question.create", `Created question #${id} in ${newSubject} - ${newChapter}`);
    toast.success("Question created and published to Question Bank!");
    setIsAdding(false);
    resetNewForm();
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileQuestion className="text-brand" size={20} />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Question Bank</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition shadow-sm"
          >
            <Plus size={15} /> Add MCQ
          </button>
          <Link to="/admin/import" className="text-sm font-medium text-brand hover:underline">Bulk Import →</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-5">
        <StatCard label="Total Questions" value={questions.length} icon={FileQuestion} gradient="from-orange-500 to-pink-600" />
        <button onClick={() => setStatusFilter("pending")} className="text-left">
          <StatCard label="Pending Review" value={pendingCount} icon={ShieldAlert} gradient="from-amber-500 to-orange-600" delay={0.04} />
        </button>
        {["Easy", "Medium", "Hard"].map((d, i) => (
          <StatCard key={d} label={d} value={questions.filter((q) => q.difficulty === d).length} icon={FileQuestion} gradient={["from-emerald-500 to-teal-600", "from-violet-500 to-indigo-600", "from-rose-500 to-red-600"][i]} delay={0.08 * (i + 1)} />
        ))}
      </div>

      <div className="flex gap-1 mt-5 bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-fit">
        {(["all", "active", "pending", "rejected"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize ${statusFilter === s ? "bg-white dark:bg-slate-800 text-brand shadow-sm" : "text-slate-500"}`}>
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mt-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input w-full pl-9" placeholder="Search question or chapter…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
          {subjects.map((s) => <option key={s}>{s}</option>)}
        </select>
<select className="input" value={languageFilter} onChange={e=>setLanguageFilter(e.target.value)}><option value="all">All Languages</option><option value="en">English</option><option value="hi">Hindi</option><option value="both">Bilingual</option></select>
        <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          {["All", "Easy", "Medium", "Hard"].map((d) => <option key={d}>{d}</option>)}
        </select>
        {selected.size > 0 && (
          <button onClick={bulkDelete} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-600 text-sm font-medium">
            <Trash2 size={14} /> Delete {selected.size}
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500 mt-3">{filtered.length} of {questions.length} questions</p>

      <div className="space-y-2 mt-2 max-h-[60vh] overflow-y-auto pr-1">
        {filtered.map((q) => (
          <div key={q.id} className={`flex items-start gap-3 p-3.5 rounded-xl border ${q.status === "pending" ? "bg-amber-500/5 border-amber-500/20" : q.status === "rejected" ? "bg-red-500/5 border-red-500/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10"}`}>
            <input type="checkbox" className="mt-1" checked={selected.has(q.id)} onChange={() => toggleSelect(q.id)} />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-slate-800 dark:text-slate-100">{q.text}</p>
                {q.status === "pending" && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 shrink-0">PENDING</span>}
                {q.status === "rejected" && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-600 shrink-0">REJECTED</span>}
              </div>
              <p className="text-xs text-slate-500 mt-1">{q.subject}{(q as any).topic ? ` › ${(q as any).topic}` : ""} · {q.chapter} · <span className="capitalize">{q.difficulty}</span>{(q as any).language && (q as any).language !== "en" ? ` · 🌐${(q as any).language}` : ""}{q.uploadedByName && <> · by {q.uploadedByName}</>}</p>
              {(q as any).tags?.length > 0 && <div className="flex gap-1 flex-wrap mt-1">{((q as any).tags as string[]).slice(0,4).map((t:string)=><span key={t} className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-slate-500">{t}</span>)}</div>}
            </div>
            {q.status === "pending" && (
              <>
                <button onClick={() => moderate(q, "active")} className="text-emerald-600 hover:bg-emerald-500/10 shrink-0 p-1 rounded" title="Approve"><ShieldCheck size={15} /></button>
                <button onClick={() => moderate(q, "rejected")} className="text-red-500 hover:bg-red-500/10 shrink-0 p-1 rounded" title="Reject"><ShieldX size={15} /></button>
              </>
            )}
            <button onClick={() => setEditing(q)} className="text-slate-400 hover:text-brand shrink-0 p-1"><Pencil size={15} /></button>
            <button onClick={() => remove(q.id)} className="text-red-500 shrink-0 p-1"><Trash2 size={15} /></button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-6">
            <FileQuestion className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              {questions.length === 0 ? "Question bank is empty." : "No questions match these filters."}
            </p>
            <p className="text-xs text-slate-500 mb-4">
              {questions.length === 0 ? "Start building your question bank with real questions." : "Try adjusting your search or filters."}
            </p>
            {questions.length === 0 && (
              <div className="flex justify-center gap-2">
                <Link to="/admin/import" className="px-3.5 py-2 rounded-lg bg-brand text-white text-xs font-semibold">
                  📄 Bulk Import CSV
                </Link>
                <Link to="/admin/import/pdf" className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  📑 PDF Import
                </Link>
                <Link to="/teacher/upload" className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  ✍️ Add Single Question
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900 dark:text-white">Edit Question</p>
              <button onClick={() => setEditing(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <textarea className="input w-full" rows={3} value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} />
            {editing.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" checked={editing.correctAnswer === i} onChange={() => setEditing({ ...editing, correctAnswer: i })} />
                <input className="input flex-1" value={opt} onChange={(e) => { const o = [...editing.options]; o[i] = e.target.value; setEditing({ ...editing, options: o }); }} />
              </div>
            ))}
            <textarea className="input w-full" rows={2} placeholder="Solution" value={editing.solution} onChange={(e) => setEditing({ ...editing, solution: e.target.value })} />
            <button onClick={saveEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold">
              <Check size={15} /> Save Changes
            </button>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsAdding(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-100 dark:border-white/10">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add New MCQ</h3>
                <p className="text-xs text-slate-500">Create a question that immediately updates the student question bank & totals.</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Subject</label>
                <select className="input w-full" value={newSubject} onChange={(e) => setNewSubject(e.target.value)}>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Target Exam</label>
                <select className="input w-full" value={newExam} onChange={(e) => setNewExam(e.target.value)}>
                  <option value="jee-main">JEE Main</option>
                  <option value="jee-advanced">JEE Advanced</option>
                  <option value="neet">NEET</option>
                  <option value="all">All Exams</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Chapter Name</label>
                <input
                  className="input w-full"
                  placeholder="e.g. Kinematics, Thermodynamics"
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Difficulty</label>
                <select className="input w-full" value={newDifficulty} onChange={(e) => setNewDifficulty(e.target.value as any)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Question Text</label>
              <textarea
                className="input w-full"
                rows={3}
                placeholder="Type the question statement here..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                Answer Options (select radio for correct answer)
              </label>
              {newOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct_opt"
                    id={`opt_${i}`}
                    checked={newCorrectAnswer === i}
                    onChange={() => setNewCorrectAnswer(i)}
                    className="accent-brand h-4 w-4"
                  />
                  <span className="text-xs font-bold text-slate-500 w-5">({String.fromCharCode(65 + i)})</span>
                  <input
                    className="input flex-1 text-sm"
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...newOptions];
                      updated[i] = e.target.value;
                      setNewOptions(updated);
                    }}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Explanation / Solution (Optional)</label>
              <textarea
                className="input w-full text-sm"
                rows={2}
                placeholder="Detailed step-by-step solution..."
                value={newSolution}
                onChange={(e) => setNewSolution(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createQuestion}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand/90 shadow-md shadow-brand/20 transition"
              >
                <Plus size={15} /> Save & Add to Question Bank
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
