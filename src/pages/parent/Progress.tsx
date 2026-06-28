import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { listAttemptsForStudent } from "../../services/groupTestsDB";
import { useParentChild } from "./useParentChild";
import type { GroupTestAttempt } from "../../types/schema";
import StatCard from "../../components/layout/StatCard";
import { TrendingUp, Award, Target, Calendar } from "lucide-react";

export default function Progress() {
  const { child } = useParentChild();
  const [attempts, setAttempts] = useState<GroupTestAttempt[]>([]);

  useEffect(() => { if (child) listAttemptsForStudent(child.uid).then(setAttempts); }, [child]);

  const chartData = [...attempts].reverse().map((a, i) => ({ name: `Test ${i + 1}`, score: a.score }));
  const avgPercentile = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.percentile ?? 0), 0) / attempts.length) : 0;
  const best = attempts.length ? Math.max(...attempts.map((a) => a.score)) : 0;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
        <TrendingUp className="text-brand" size={20} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Progress {child ? `· ${child.name}` : ""}</h1>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        <StatCard label="Tests Taken" value={attempts.length} icon={Calendar} gradient="from-sky-500 to-blue-600" />
        <StatCard label="Best Score" value={best} icon={Award} gradient="from-amber-500 to-orange-600" delay={0.05} />
        <StatCard label="Avg Percentile" value={attempts.length ? `${avgPercentile}th` : "—"} icon={Target} gradient="from-emerald-500 to-teal-600" delay={0.1} />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 mt-5 h-72">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#ff6b00" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-slate-500 flex items-center justify-center h-full">No test attempts yet.</p>
        )}
      </div>

      <div className="space-y-2 mt-5">
        {attempts.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm">
            <span className="text-slate-800 dark:text-slate-100">{new Date(a.submittedAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-3">
              <span className="font-semibold">{a.score}/{a.totalMarks}</span>
              <span className="text-brand font-medium">Rank #{a.rank ?? "—"}</span>
              {a.percentile != null && <span className="text-slate-400">{a.percentile}th pct</span>}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
