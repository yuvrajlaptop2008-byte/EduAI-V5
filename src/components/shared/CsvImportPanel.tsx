import { useState } from "react";
import { motion } from "motion/react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { parseCsvFile, commitRows, CSV_TEMPLATE, type ParsedRow } from "../../utils/csvImport";

export default function CsvImportPanel({ onImported, extraFields }: { onImported?: (count: number) => void; extraFields?: Record<string, any> }) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const valid = rows.filter((r) => r.data);
  const invalid = rows.filter((r) => !r.data);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) { toast.error("Please upload a .csv file."); return; }
    setFileName(file.name);
    try {
      const parsed = await parseCsvFile(file);
      setRows(parsed);
      toast.success(`Parsed ${parsed.length} rows — ${parsed.filter((r) => r.data).length} valid.`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to parse CSV.");
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "eduai-question-template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async () => {
    setImporting(true);
    setProgress(0);
    try {
      const count = await commitRows(rows, (done, total) => setProgress(Math.round((done / total) * 100)), extraFields);
      toast.success(`Imported ${count} questions.`);
      onImported?.(count);
      setRows([]); setFileName("");
    } catch (e: any) {
      toast.error(e?.message || "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500">Bulk-add questions from a spreadsheet.</p>
        <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-xs font-medium text-brand hover:underline">
          <Download size={13} /> Download CSV template
        </button>
      </div>

      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
        className={`flex flex-col items-center justify-center gap-2 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
          dragOver ? "border-brand bg-brand/5" : "border-slate-200 dark:border-white/10 hover:border-slate-300"
        }`}
      >
        <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <UploadCloud size={28} className="text-slate-400" />
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{fileName || "Drop a .csv file here, or click to browse"}</p>
        <p className="text-xs text-slate-400">Columns: examType, subject, chapter, year, questionText, optionA-D, correct, solution, difficulty, tags</p>
      </label>

      {rows.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <div className="flex gap-3 mb-3">
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium"><CheckCircle2 size={15} /> {valid.length} valid</span>
            {invalid.length > 0 && <span className="flex items-center gap-1.5 text-sm text-red-500 font-medium"><XCircle size={15} /> {invalid.length} errors</span>}
          </div>

          <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/10">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 text-left text-slate-500 sticky top-0">
                <tr><th className="p-2">Row</th><th className="p-2">Question</th><th className="p-2">Subject</th><th className="p-2">Status</th></tr>
              </thead>
              <tbody>
                {rows.slice(0, 100).map((r) => (
                  <tr key={r.row} className={`border-t border-slate-100 dark:border-white/5 ${!r.data ? "bg-red-500/5" : ""}`}>
                    <td className="p-2 text-slate-400">{r.row}</td>
                    <td className="p-2 text-slate-700 dark:text-slate-200 max-w-xs truncate">{r.raw.questionText || "—"}</td>
                    <td className="p-2 text-slate-500">{r.raw.subject || "—"}</td>
                    <td className="p-2">
                      {r.data ? <span className="text-emerald-600">OK</span> : <span className="text-red-500" title={r.errors.join(", ")}>{r.errors[0]}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {importing ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={15} className="animate-spin" /> Importing… {progress}%
            </div>
          ) : (
            <button
              onClick={doImport}
              disabled={valid.length === 0}
              className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold shadow-md shadow-brand/20 disabled:opacity-50"
            >
              <FileSpreadsheet size={16} /> Import {valid.length} Questions
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
