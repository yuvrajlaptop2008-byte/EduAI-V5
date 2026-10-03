import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "sonner";
import { Settings as SettingsIcon, Save, ShieldCheck, History } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { logAudit, listRecentAuditLogs, type AuditLogEntry } from "../../services/auditLogDB";
import { seedLeaderboardFromAttempts } from "../../utils/seedDemoData";

export default function Settings() {
  const { user } = useUser();
  const [announcement, setAnnouncement] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [requireQuestionReview, setRequireQuestionReview] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [rebuildingLB, setRebuildingLB] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "platform", "config")).then((snap) => {
      if (snap.exists()) {
        const d = snap.data() as any;
        setAnnouncement(d.announcement || "");
        setMaintenanceMode(!!d.maintenanceMode);
        setRequireQuestionReview(!!d.requireQuestionReview);
      }
      setLoaded(true);
    });
    listRecentAuditLogs(20).then(setLogs);
  }, []);

  const save = async () => {
    await setDoc(doc(db, "platform", "config"), { announcement, maintenanceMode, requireQuestionReview }, { merge: true });
    logAudit(user!.uid, user!.name, "settings.save", `Updated platform settings (review: ${requireQuestionReview}, maintenance: ${maintenanceMode})`);
    toast.success("Saved.");
    listRecentAuditLogs(20).then(setLogs);
  };

  if (!loaded) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2"><SettingsIcon className="text-brand" size={20} /><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Settings</h1></div>
      <div className="space-y-4 mt-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
        <div>
          <label className="text-xs text-slate-500 block mb-1">Platform-wide announcement</label>
          <textarea className="input w-full" rows={3} value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Shown as a dismissible banner to everyone" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} />
          Maintenance mode <span className="text-xs text-slate-400">(blocks everyone except Admins)</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={requireQuestionReview} onChange={(e) => setRequireQuestionReview(e.target.checked)} />
          <ShieldCheck size={14} className="text-brand" /> Require Admin approval for teacher-uploaded questions
        </label>
        <button onClick={save} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold shadow-md shadow-brand/20"><Save size={14} /> Save</button>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Add Real Question Bank Data</p>
        <p className="text-xs text-slate-500 mb-3">Upload questions manually, import bulk question sheets via CSV, or parse official NTA exam papers via PDF import.</p>
        <div className="flex gap-2">
          <a href="/admin/import" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold shadow-sm">
            📄 CSV Bulk Import
          </a>
          <a href="/admin/import/pdf" className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-slate-200">
            📑 PDF Question Parser
          </a>
          <a href="/teacher/upload" className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-slate-200">
            ✍️ Manual Uploader
          </a>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Rebuild Leaderboard</p>
        <p className="text-xs text-slate-500 mb-3">Recalculates all-time rankings from existing test attempts.</p>
        <button onClick={async()=>{setRebuildingLB(true);const n=await seedLeaderboardFromAttempts();toast.success(`Rebuilt ${n} leaderboard entries.`);setRebuildingLB(false);}} disabled={rebuildingLB} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 text-sm font-medium disabled:opacity-50">{rebuildingLB?"Rebuilding…":"🏆 Rebuild Leaderboard"}</button>
      </div>

      <div className="flex items-center gap-2 mt-8 mb-3">
        <History size={16} className="text-brand" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recent Activity</p>
      </div>
      <div className="space-y-1.5">
        {logs.map((l) => (
          <div key={l.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
            <span className="text-slate-600 dark:text-slate-300">{l.details}</span>
            <span className="text-slate-400 shrink-0 ml-3">{l.actorName} · {new Date(l.createdAt).toLocaleString()}</span>
          </div>
        ))}
        {logs.length === 0 && <p className="text-xs text-slate-500">No activity recorded yet.</p>}
      </div>
    </div>
  );
}
