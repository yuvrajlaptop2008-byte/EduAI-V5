import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useUser } from "../context/UserContext";
import { listRemarksForStudent } from "../services/remarksDB";
import type { RemarkDoc } from "../types/schema";

interface Props { onBack: () => void; }

export default function StudentRemarks({ onBack }: Props) {
  const { user } = useUser();
  const [remarks, setRemarks] = useState<RemarkDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    listRemarksForStudent(user.uid).then(setRemarks).finally(() => setLoading(false));
  }, [user?.uid]);

  const subjects = Array.from(new Set(remarks.map((r) => r.subject)));
  const [subjectFilter, setSubjectFilter] = useState("All");
  const filtered = subjectFilter === "All" ? remarks : remarks.filter((r) => r.subject === subjectFilter);

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-5 text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center gap-2 mb-5">
        <MessageSquare className="text-brand" size={22} />
        <h1 className="text-xl font-bold text-white">Teacher Remarks</h1>
      </div>

      {subjects.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-4">
          {["All", ...subjects].map((s) => (
            <button key={s} onClick={() => setSubjectFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${subjectFilter === s ? "bg-brand text-white" : "bg-white/5 text-slate-400"}`}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading…</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-slate-500">No remarks from your teachers yet.</p>
        )}
        {filtered.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand uppercase tracking-wide">{r.subject}</span>
              <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-slate-100">{r.text}</p>
            <p className="text-xs text-slate-500 mt-2">— {r.teacherName}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
