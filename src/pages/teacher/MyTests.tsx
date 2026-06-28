import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useUser } from "../../context/UserContext";
import { listTestsByTeacher, publishTest, deleteGroupTest, listAttemptsForTest } from "../../services/groupTestsDB";
import type { GroupTest } from "../../types/schema";
import { SkeletonList } from "../../components/Skeleton";
import { toast } from "sonner";
import { Trash2, BarChart3, ListChecks, Clock, FileQuestion, Eye, EyeOff, CalendarDays, Users, ChevronRight } from "lucide-react";

export default function MyTests() {
  const { user } = useUser();
  const [tests, setTests] = useState<GroupTest[]>([]);
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all"|"published"|"draft">("all");
  const [deleting, setDeleting] = useState<string|null>(null);

  const load = async () => {
    if (!user) return;
    const data = await listTestsByTeacher(user.uid);
    setTests(data);
    setLoading(false);
    // Load attempt counts in background
    const counts: Record<string,number> = {};
    await Promise.all(data.map(async t => { counts[t.id] = (await listAttemptsForTest(t.id)).length; }));
    setAttemptCounts(counts);
  };
  useEffect(() => { load(); }, [user]);

  const del = async (id: string) => {
    setDeleting(id);
    await deleteGroupTest(id);
    toast.success("Test deleted.");
    load();
    setDeleting(null);
  };

  const toggle = async (t: GroupTest) => {
    await publishTest(t.id, !t.isPublished);
    toast.success(t.isPublished ? "Test unpublished." : "Test published — students can now see it.");
    load();
  };

  const filtered = filter === "all" ? tests : tests.filter(t => filter === "published" ? t.isPublished : !t.isPublished);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="text-brand" size={20} />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Tests</h1>
          {!loading && <span className="ml-1 px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-500 text-xs font-bold rounded-full">{tests.length}</span>}
        </div>
        <Link to="/teacher/create-test" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold shadow-md shadow-brand/20 hover:bg-brand/90 transition-colors">
          + New Test
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-fit">
        {(["all","published","draft"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter===f ? "bg-white dark:bg-slate-800 text-brand shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {f} {f!=="all" && `(${tests.filter(t=>f==="published"?t.isPublished:!t.isPublished).length})`}
          </button>
        ))}
      </div>

      {loading ? <SkeletonList rows={4} /> : (
        <div className="space-y-2">
          {filtered.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
              {/* Header row */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.isPublished ? "bg-emerald-500/10" : "bg-slate-100 dark:bg-white/5"}`}>
                  <FileQuestion size={18} className={t.isPublished ? "text-emerald-600" : "text-slate-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900 dark:text-white">{t.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.isPublished ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                      {t.isPublished ? "Live" : "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1"><FileQuestion size={11}/>{t.questionIds.length}Q</span>
                    <span className="flex items-center gap-1"><Clock size={11}/>{t.duration}min</span>
                    <span className="flex items-center gap-1"><Users size={11}/>{attemptCounts[t.id] ?? "…"} attempts</span>
                    {t.scheduledAt && <span className="flex items-center gap-1"><CalendarDays size={11}/>{new Date(t.scheduledAt).toLocaleDateString()}</span>}
                    <span>{t.totalMarks} marks · {(t as any).marksPerQuestion ?? 4}M / {(t as any).negativeMarks ?? 1}N</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/teacher/tests/${t.id}/results`} className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:border-brand hover:text-brand text-slate-500 transition-colors" title="Results">
                    <BarChart3 size={16} />
                  </Link>
                  <button onClick={() => toggle(t)} className={`p-2 rounded-xl border transition-colors ${t.isPublished ? "border-amber-500/30 text-amber-600 hover:bg-amber-500/5" : "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/5"}`} title={t.isPublished?"Unpublish":"Publish"}>
                    {t.isPublished ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                  <button onClick={() => del(t.id)} disabled={deleting===t.id} className="p-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/5 transition-colors disabled:opacity-40" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {/* Groups row */}
              {t.assignedGroupIds.length > 0 && (
                <div className="px-5 pb-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Groups:</span>
                  {t.assignedGroupIds.map(gid => (
                    <span key={gid} className="text-[10px] px-2 py-0.5 bg-brand/10 text-brand rounded-full font-medium">{gid.replace("group-","").toUpperCase()}</span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-white/10 text-center">
              <ListChecks className="text-slate-300 mb-2" size={28}/>
              <p className="text-sm text-slate-500">{filter==="all" ? "No tests yet." : `No ${filter} tests.`}</p>
              {filter==="all" && <Link to="/teacher/create-test" className="mt-3 text-sm text-brand font-medium hover:underline">Create your first test →</Link>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
