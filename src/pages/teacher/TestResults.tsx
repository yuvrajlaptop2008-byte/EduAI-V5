import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { listAttemptsForTest, getGroupTest } from "../../services/groupTestsDB";
import { resolveGroupTestQuestions, type EngineQuestion } from "../../utils/groupTestBridge";
import type { GroupTestAttempt } from "../../types/schema";
import { ArrowLeft, Trophy, Users, TrendingUp, Target, AlertTriangle } from "lucide-react";
import StatCard from "../../components/layout/StatCard";

interface QStat { question: EngineQuestion; attempted: number; correct: number; accuracy: number; }

export default function TestResults() {
  const { testId } = useParams();
  const [attempts, setAttempts] = useState<GroupTestAttempt[]>([]);
  const [qStats, setQStats] = useState<QStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!testId) return;
    (async () => {
      const [a, test] = await Promise.all([listAttemptsForTest(testId), getGroupTest(testId)]);
      setAttempts(a);
      if (test) {
        const questions = await resolveGroupTestQuestions(test);
        const stats: QStat[] = questions.map((q) => {
          const relevant = a.filter((att) => att.answers[q.id] !== undefined && att.answers[q.id] !== null);
          const correct = relevant.filter((att) => String(att.answers[q.id]) === String(q.correctAnswer)).length;
          return { question: q, attempted: relevant.length, correct, accuracy: relevant.length ? Math.round((correct / relevant.length) * 100) : 0 };
        });
        setQStats(stats.sort((x, y) => x.accuracy - y.accuracy));
      }
      setLoading(false);
    })();
  }, [testId]);

  const avg = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length) : 0;
  const highest = attempts.length ? Math.max(...attempts.map((a) => a.score)) : 0;
  const total = attempts[0]?.totalMarks || 0;

  const chartData = attempts.slice(0, 15).map((a) => ({ name: a.studentName.split(" ")[0], score: a.score }));

  return (
    <div>
      <Link to="/teacher/tests" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand mb-3">
        <ArrowLeft size={14} /> Back to My Tests
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Test Results</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        <StatCard label="Attempts" value={attempts.length} icon={Users} gradient="from-sky-500 to-blue-600" />
        <StatCard label="Average Score" value={`${avg}/${total}`} icon={TrendingUp} gradient="from-violet-500 to-indigo-600" delay={0.05} />
        <StatCard label="Highest Score" value={`${highest}/${total}`} icon={Trophy} gradient="from-amber-500 to-orange-600" delay={0.1} />
        <StatCard label="Pass Rate (≥40%)" value={attempts.length ? `${Math.round((attempts.filter((a) => a.score >= total * 0.4).length / attempts.length) * 100)}%` : "—"} icon={Target} gradient="from-emerald-500 to-teal-600" delay={0.15} />
      </div>

      {chartData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 mt-5 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill="#ff6b00" fillOpacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {qStats.some((s) => s.attempted > 0) && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 mt-5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-amber-500" /> Weakest Questions
          </p>
          <div className="space-y-2">
            {qStats.filter((s) => s.attempted > 0).slice(0, 5).map((s) => (
              <div key={s.question.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-white/5">
                <p className="text-sm text-slate-700 dark:text-slate-200 truncate flex-1">{s.question.text}</p>
                <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${s.accuracy < 40 ? "bg-red-500/10 text-red-500" : s.accuracy < 70 ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}`}>
                  {s.accuracy}% ({s.correct}/{s.attempted})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10"><div className="bg-white dark:bg-slate-900 min-w-[520px]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-white/5 text-left text-slate-500">
            <tr><th className="p-3">Rank</th><th className="p-3">Student</th><th className="p-3">Score</th><th className="p-3">Percentile</th><th className="p-3">Time</th></tr>
          </thead>
          <tbody>
            {attempts.map((a, i) => (
              <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-t border-slate-100 dark:border-white/5">
                <td className="p-3 font-bold text-brand">#{a.rank}</td>
                <td className="p-3 text-slate-800 dark:text-slate-100">{a.studentName}</td>
                <td className="p-3 font-medium">{a.score} / {a.totalMarks}</td>
                <td className="p-3 text-slate-500">{a.percentile != null ? `${a.percentile}th` : "—"}</td>
                <td className="p-3 text-slate-500">{Math.round(a.timeTakenSec / 60)} min</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {!loading && attempts.length === 0 && <p className="p-6 text-sm text-slate-500 text-center">No attempts submitted yet.</p>}
      </div></div>
    </div>
  );
}
