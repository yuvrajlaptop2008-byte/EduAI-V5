import { useEffect, useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { dataService } from "../../services/dataService";
import { useUser } from "../../context/UserContext";
import { toast } from "sonner";
import { Plus, PencilLine } from "lucide-react";
import CsvImportPanel from "../../components/shared/CsvImportPanel";

const SUBJECTS = ["Physics", "Chemistry", "Maths", "Biology"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

export default function UploadQuestions() {
  const { user } = useUser();
  const [mode, setMode] = useState<"manual" | "csv">("manual");
  const [requireReview, setRequireReview] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "platform", "config")).then((snap) => setRequireReview(!!(snap.exists() && (snap.data() as any).requireQuestionReview)));
  }, []);

  const extraFields = requireReview
    ? { status: "pending" as const, uploadedBy: user?.uid, uploadedByName: user?.name }
    : { status: "active" as const, uploadedBy: user?.uid, uploadedByName: user?.name };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2">
        <PencilLine className="text-brand" size={20} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Upload Questions</h1>
      </div>
      <p className="text-slate-500 dark:text-slate-400 mt-1 mb-5">
        {requireReview
          ? "This institute requires Admin approval before new questions appear to students."
          : "Saved instantly to the shared question bank — no approval needed."}
      </p>

      <div className="flex gap-1 mb-5 bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-fit">
        <button onClick={() => setMode("manual")} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${mode === "manual" ? "bg-white dark:bg-slate-800 text-brand shadow-sm" : "text-slate-500"}`}>Manual</button>
        <button onClick={() => setMode("csv")} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${mode === "csv" ? "bg-white dark:bg-slate-800 text-brand shadow-sm" : "text-slate-500"}`}>CSV Bulk Import</button>
      </div>

      {mode === "manual"
        ? <ManualForm extraFields={extraFields} requireReview={requireReview} />
        : <CsvImportPanel extraFields={extraFields} onImported={(n) => toast.message(requireReview ? `${n} questions submitted for review.` : "Questions imported. They're live in the shared bank now.")} />}
    </div>
  );
}

function ManualForm({ extraFields, requireReview }: { extraFields: Record<string, any>; requireReview: boolean }) {
  const [subject, setSubject] = useState("Physics");
  const [chapter, setChapter] = useState("");
  const [difficulty, setDifficulty] = useState<typeof DIFFICULTIES[number]>("Medium");
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [solution, setSolution] = useState("");
  const [exam, setExam] = useState("JEE_MAIN");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<"en"|"hi"|"both">("en");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => { setChapter(""); setText(""); setOptions(["", "", "", ""]); setCorrectAnswer(0); setSolution(""); };

  const submit = async () => {
    if (!chapter.trim() || !text.trim() || options.some((o) => !o.trim())) {
      toast.error("Fill chapter, question text and all 4 options.");
      return;
    }
    setSaving(true);
    try {
      const id = Date.now();
      await dataService.saveQuestion({
        id,
        subject,
        chapter,
        topic: topic || chapter,
        difficulty,
        text,
        options,
        correctAnswer,
        solution,
        exam,
        ...extraFields,
      });

      toast.success(requireReview ? "Submitted for admin review." : "Question added to the bank.");
      reset();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save question.");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
      <div className="grid grid-cols-3 gap-3">
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input">{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select>
        <select value={exam} onChange={(e) => setExam(e.target.value)} className="input">
          <option value="JEE_MAIN">JEE Main</option><option value="JEE_ADV">JEE Advanced</option><option value="NEET">NEET</option><option value="School">School</option>
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="input">{DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}</select>
      </div>
      <input className="input w-full" placeholder="Chapter (e.g. Rotation)" value={chapter} onChange={(e) => setChapter(e.target.value)} />
      <textarea className="input w-full" rows={3} placeholder="Question text" value={text} onChange={(e) => setText(e.target.value)} />
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <input type="radio" checked={correctAnswer === i} onChange={() => setCorrectAnswer(i)} title="Mark as correct answer" />
          <input className="input flex-1" placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={(e) => { const next = [...options]; next[i] = e.target.value; setOptions(next); }} />
        </div>
      ))}
      <textarea className="input w-full" rows={3} placeholder="Solution / explanation" value={solution} onChange={(e) => setSolution(e.target.value)} />
      <button onClick={submit} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand text-white font-semibold shadow-md shadow-brand/20 disabled:opacity-50">
        <Plus size={18} /> {saving ? "Saving…" : "Add Question"}
      </button>
    </div>
  );
}
