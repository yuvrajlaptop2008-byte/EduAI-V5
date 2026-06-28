import { useState, useRef } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { useUser } from "../../context/UserContext";
import { commitRows } from "../../utils/csvImport";
import type { Question } from "../../utils/questionBank";
import { toast } from "sonner";
import { FileUp, Loader2, CheckCircle2, ArrowLeft, Sparkles, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

type Stage = "idle" | "uploading" | "parsing" | "preview" | "importing" | "done" | "error";

interface ParsedQ {
  text: string;
  options: string[];
  correctAnswer: number;
  solution: string;
  subject: string;
  chapter: string;
  difficulty: "Easy" | "Medium" | "Hard";
  approved: boolean;
}

export default function PdfImport() {
  const { user } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [parsed, setParsed] = useState<ParsedQ[]>([]);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFile = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    setFileName(file.name);
    setStage("uploading");
    setProgress(0);

    try {
      // 1. Upload to Firebase Storage
      const storageRef = ref(storage, `pdf-imports/${user!.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 50)),
          reject,
          resolve,
        );
      });

      setStage("parsing");
      setProgress(55);

      const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

      // 2. Call the Anthropic API via our own endpoint proxy (the claude.ai artifact API key)
      // In production this should be a Cloud Function; for now we call it from the client
      // using the fetch proxy that's available in this environment.
      const prompt = `You are parsing a PDF exam question paper. The file is at: ${downloadUrl}
      
Extract ALL MCQ questions from this document and return ONLY a valid JSON array. No extra text, no markdown code blocks.

Each item must have:
{
  "text": "full question text",
  "options": ["A option", "B option", "C option", "D option"],
  "correctAnswer": 0,  // 0-based index of correct option
  "solution": "brief explanation",
  "subject": "Physics|Chemistry|Maths|Biology|Other",
  "chapter": "chapter name",
  "difficulty": "Easy|Medium|Hard"
}

Return only the JSON array.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      setProgress(85);

      if (!response.ok) {
        throw new Error("AI parsing failed. Make sure the PDF is text-selectable (not a scanned image).");
      }

      const data = await response.json();
      const rawText = data.content?.[0]?.text || "";

      let questions: ParsedQ[] = [];
      try {
        const clean = rawText.replace(/```json|```/g, "").trim();
        questions = JSON.parse(clean);
        if (!Array.isArray(questions)) throw new Error("Not an array");
      } catch {
        throw new Error("Could not parse AI response. PDF may have unusual formatting.");
      }

      setParsed(questions.map((q) => ({ ...q, approved: true })));
      setStage("preview");
      setProgress(100);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
      setStage("error");
    }
  };

  const importAll = async () => {
    const toImport = parsed.filter((q) => q.approved);
    if (toImport.length === 0) { toast.error("Select at least 1 question."); return; }
    setStage("importing");

    const rows = toImport.map((q, i) => ({
      row: i + 1,
      data: {
        id: Date.now() + i,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        solution: q.solution,
        subject: q.subject,
        chapter: q.chapter,
        difficulty: q.difficulty,
        communitySolutions: [],
        uploadedBy: user!.uid,
        uploadedByName: user!.name,
        status: "active" as const,
      } as Question & { status: string; uploadedBy: string; uploadedByName: string },
      errors: [],
    }));

    try {
      await commitRows(rows as any, (done, total) => setProgress(Math.round((done / total) * 100)));
      setStage("done");
      toast.success(`${rows.length} questions imported.`);
    } catch (e: any) {
      setError(e?.message || "Import failed");
      setStage("error");
    }
  };

  const toggleApprove = (i: number) =>
    setParsed((prev) => prev.map((q, idx) => (idx === i ? { ...q, approved: !q.approved } : q)));

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="text-brand" size={20} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">PDF → AI Import</h1>
      </div>
      <p className="text-slate-500 dark:text-slate-400 mb-5 text-sm">
        Upload a PDF question paper. Claude reads it and extracts MCQs for your review before importing.
        <br /><span className="text-amber-500 font-medium">Requires text-selectable PDF</span> (not a scanned image).
      </p>

      {stage === "idle" && (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-12 text-center cursor-pointer hover:border-brand transition-colors"
        >
          <FileUp className="mx-auto text-slate-400 mb-3" size={32} />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Click or drag a PDF here</p>
          <p className="text-xs text-slate-400 mt-1">Max 10MB</p>
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      )}

      {(stage === "uploading" || stage === "parsing" || stage === "importing") && (
        <div className="text-center py-16">
          <Loader2 className="mx-auto text-brand animate-spin mb-3" size={28} />
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
            {stage === "uploading" && "Uploading PDF…"}
            {stage === "parsing" && "Claude is reading your questions…"}
            {stage === "importing" && "Importing to question bank…"}
          </p>
          <div className="mt-4 h-2 bg-slate-100 dark:bg-white/10 rounded-full max-w-xs mx-auto overflow-hidden">
            <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">{progress}%</p>
        </div>
      )}

      {stage === "error" && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Import failed</p>
              <p className="text-xs text-red-500 mt-1">{error}</p>
            </div>
          </div>
          <button onClick={() => { setStage("idle"); setError(""); }} className="mt-3 text-sm text-brand hover:underline">Try again</button>
        </div>
      )}

      {stage === "done" && (
        <div className="text-center py-12">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-3" size={32} />
          <p className="font-semibold text-slate-900 dark:text-white">Import complete!</p>
          <Link to="/admin/questions" className="mt-3 inline-block text-sm text-brand hover:underline">View question bank →</Link>
        </div>
      )}

      {stage === "preview" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Found <span className="font-bold text-slate-900 dark:text-white">{parsed.length}</span> questions in <span className="font-medium">{fileName}</span>.
              Uncheck any to skip.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setParsed((p) => p.map((q) => ({ ...q, approved: true })))} className="text-xs text-brand hover:underline">Select all</button>
              <button onClick={() => setParsed((p) => p.map((q) => ({ ...q, approved: false })))} className="text-xs text-slate-400 hover:underline">Deselect all</button>
            </div>
          </div>

          <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1 mb-4">
            {parsed.map((q, i) => (
              <div key={i} onClick={() => toggleApprove(i)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${q.approved ? "bg-brand/5 border-brand/30" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 opacity-50"}`}>
                <CheckCircle2 size={16} className={`mt-0.5 shrink-0 ${q.approved ? "text-brand" : "text-slate-300"}`} />
                <div className="flex-1">
                  <p className="text-sm text-slate-800 dark:text-slate-100 font-medium">{q.text}</p>
                  <div className="grid grid-cols-2 gap-x-4 mt-1.5">
                    {q.options.map((o, oi) => (
                      <p key={oi} className={`text-xs ${oi === q.correctAnswer ? "text-emerald-600 font-semibold" : "text-slate-500"}`}>
                        {String.fromCharCode(65 + oi)}. {o}
                      </p>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">{q.subject} · {q.chapter} · {q.difficulty}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStage("idle")} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm">
              <ArrowLeft size={14} /> Re-upload
            </button>
            <button onClick={importAll} className="flex-1 px-4 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold shadow-md shadow-brand/20">
              Import {parsed.filter((q) => q.approved).length} questions →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
