import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Trophy, Loader2 } from "lucide-react";
import { listAttemptsForTest } from "../../services/groupTestsDB";

/** Shows the student's rank within their exam group right after submitting a teacher-assigned test. */
export default function GroupTestRankBanner({ testId, studentId }: { testId?: string; studentId?: string }) {
  const [rank, setRank] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    if (!testId || !studentId) return;
    listAttemptsForTest(testId).then((all) => {
      const mine = all.find((a) => a.studentId === studentId);
      setRank(mine?.rank ?? null);
      setTotal(all.length);
    });
  }, [testId, studentId]);

  if (!testId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 mb-4 rounded-2xl bg-gradient-to-r from-brand/10 to-orange-500/5 border border-brand/20"
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-orange-700 flex items-center justify-center shrink-0">
        <Trophy size={16} className="text-white" />
      </div>
      {rank === null ? (
        <p className="text-sm text-slate-500 flex items-center gap-1.5"><Loader2 size={13} className="animate-spin" /> Calculating your rank…</p>
      ) : (
        <p className="text-sm text-slate-700 dark:text-slate-200">
          You ranked <span className="font-extrabold text-brand">#{rank}</span> out of {total} student{total !== 1 ? "s" : ""} in your exam group.
        </p>
      )}
    </motion.div>
  );
}
