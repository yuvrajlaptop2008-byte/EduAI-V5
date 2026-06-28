import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ChevronRight,
  Target,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  MinusCircle,
  BarChart3,
  PieChart,
  BookOpen,
} from "lucide-react";
import { SubjectType } from "./types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { useUser } from "../../context/UserContext";
import { getTestReports } from "../../utils/analysis";

interface TestReportProps {
  results: any;
  onBack: () => void;
  onViewSolutions: () => void;
  onViewAnalysis?: () => void;
  onReattempt?: () => void;
}

const TestReport: React.FC<TestReportProps> = ({
  results,
  onBack,
  onViewSolutions,
  onViewAnalysis,
  onReattempt,
}) => {
  const [activeTab, setActiveTab] = useState<"Overall" | SubjectType>("Overall");
  const { theme } = useUser();

  // Calculate stats
  const filteredQuestions =
    activeTab === "Overall"
      ? results.questions
      : results.questions.filter((q: any) => q.subject === activeTab);

  const totalQuestions = filteredQuestions.length;
  const attempted = filteredQuestions.filter(
    (q: any) => results.answers[q.id] !== undefined,
  ).length;
  const correct = filteredQuestions.filter(
    (q: any) => String(results.answers[q.id]) === String(q.correctAnswer),
  ).length;
  const incorrect = attempted - correct;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const score = correct * 4 - incorrect * 1; // Assuming +4, -1 marking

  const subjects = Array.from(
    new Set(results.questions.map((q: any) => q.subject)),
  ) as SubjectType[];

  const subjectBreakdownData = subjects.map((sub) => {
    const questions = results.questions.filter((q: any) => q.subject === sub);
    const attemptedQ = questions.filter(
      (q: any) => results.answers[q.id] !== undefined,
    ).length;
    const correctQ = questions.filter(
      (q: any) => String(results.answers[q.id]) === String(q.correctAnswer),
    ).length;
    const incorrectQ = attemptedQ - correctQ;
    const unattemptedQ = questions.length - attemptedQ;
    return {
      name: sub,
      Correct: correctQ,
      Incorrect: incorrectQ,
      Unattempted: unattemptedQ,
    };
  });

  // Load real historical test reports
  const allReports = getTestReports();
  const sortedReports = [...allReports].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const now = Date.now();
  const currentScore = score;
  const isAlreadySaved = sortedReports.some(
    (r) => Math.abs(now - new Date(r.date).getTime()) < 15000 && r.score === currentScore
  );

  let finalReports = [...sortedReports];
  if (!isAlreadySaved) {
    finalReports.push({
      id: "current",
      email: "",
      testId: "current",
      subject: activeTab,
      chapter: "",
      correct,
      wrong: incorrect,
      skipped: totalQuestions - attempted,
      total: totalQuestions,
      score: currentScore,
      timeTaken: results.timeSpent,
      date: new Date().toISOString(),
    });
  }

  const reportsToShow = finalReports.slice(-6);

  let trendData = reportsToShow.map((r, index) => ({
    name: `Test ${index + 1}`,
    accuracy: r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0,
  }));

  if (trendData.length === 1) {
    trendData = [
      { name: "Start", accuracy: 0 },
      { name: "Test 1", accuracy: trendData[0].accuracy },
    ];
  }

  const gridStroke = theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const labelColor = theme === "dark" ? "#94a3b8" : "#475569";

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-slate-50/40 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-900/5 dark:border-white/5 flex flex-col items-center text-center">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}
      >
        <Icon size={20} />
      </div>
      <div className="text-lg font-black">{value}</div>
      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
        {label}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white pb-24">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg z-40">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">
              {results.name ||"Report Card"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Test Analysis
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {["Overall", ...subjects].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                activeTab === tab
                  ?"bg-brand border-brand text-slate-900 shadow-lg shadow-brand/20"
                  :"bg-slate-50 dark:bg-slate-800 border-slate-900/5 dark:border-white/5 text-slate-500 dark:text-slate-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 mt-6 space-y-6">
        {/* Score Banner */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-brand to-indigo-600 p-8 rounded-[2.5rem] text-center relative overflow-hidden shadow-2xl shadow-brand/20"
        >
          <div className="relative z-10">
            <div className="text-sm font-bold text-white/70 uppercase tracking-widest mb-2">
              Marks Obtained
            </div>
            <div className="text-6xl font-black mb-2 text-white">{score}</div>
            <div className="text-sm font-bold text-white/90">
              Out of {totalQuestions * 4}
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 dark:bg-slate-900/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 dark:bg-slate-900/10 rounded-full blur-3xl" />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={Target}
            label="Attempted"
            value={`${attempted}/${totalQuestions}`}
            color="bg-blue-500/10 text-blue-500"
          />
          <StatCard
            icon={Zap}
            label="Accuracy"
            value={`${accuracy}%`}
            color="bg-orange-500/10 text-orange-500"
          />
          <StatCard
            icon={Clock}
            label="Time Taken"
            value={`${Math.floor(results.timeSpent / 60)}m`}
            color="bg-emerald-500/10 text-emerald-500"
          />
        </div>

        {/* Accuracy Trend Chart */}
        {activeTab ==="Overall" && (
          <div className="bg-slate-50/40 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-900/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <BarChart3 size={18} className="text-brand" />
                Accuracy Trend
              </h3>
            </div>
            <div className="h-56 w-full -ml-4">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={1}
                minHeight={1}
              >
                <LineChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridStroke}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: labelColor, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fill: labelColor, fontSize: 12 }}
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                      border: theme === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "12px",
                      color: theme === "dark" ? "#ffffff" : "#0f172a",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.15)",
                    }}
                    itemStyle={{ fontSize: "14px", fontWeight: "bold", color: theme === "dark" ? "#ffffff" : "#0f172a" }}
                    formatter={(value: any) => [
                      `${Math.round(Number(value))}%`,
                      "Accuracy",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: theme === "dark" ? "#1e293b" : "#ffffff",
                      strokeWidth: 2,
                      stroke: "#3b82f6",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#3b82f6",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Subject Breakdown Chart */}
        {activeTab ==="Overall" && subjects.length > 1 && (
          <div className="bg-slate-50/40 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-900/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <PieChart size={18} className="text-brand" />
                Subject Breakdown
              </h3>
            </div>
            <div className="h-64 w-full -ml-4">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={1}
                minHeight={1}
              >
                <BarChart
                  data={subjectBreakdownData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill:"#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fill:"#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor:"#1e293b",
                      border:"1px solid rgba(255,255,255,0.1)",
                      borderRadius:"12px",
                      color:"#fff",
                    }}
                    itemStyle={{ fontSize:"14px", fontWeight:"bold" }}
                    cursor={{ fill:"rgba(255,255,255,0.02)" }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize:"12px", paddingTop:"20px" }}
                  />
                  <Bar
                    dataKey="Correct"
                    stackId="a"
                    fill="#10b981"
                    radius={[0, 0, 4, 4]}
                    barSize={32}
                  />
                  <Bar dataKey="Incorrect" stackId="a" fill="#ef4444" />
                  <Bar
                    dataKey="Unattempted"
                    stackId="a"
                    fill="#64748b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Attempt Analysis Circle View (Retained for Individual Subjects or Overview) */}
        <div className="bg-slate-50/40 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-900/5 dark:border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <Target size={18} className="text-brand" />
              Attempt Details
            </h3>
          </div>

          <div className="flex items-center justify-around py-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center mb-2 mx-auto">
                <span className="text-lg font-bold">{correct}</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                Correct
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center mb-2 mx-auto">
                <span className="text-lg font-bold">{incorrect}</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                Incorrect
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center mb-2 mx-auto">
                <span className="text-lg font-bold">
                  {totalQuestions - attempted}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                Unattempted
              </div>
            </div>
          </div>
        </div>

        {/* Time Spent Analysis */}
        <div className="bg-slate-50/40 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-900/5 dark:border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <Clock size={18} className="text-brand" />
              Time Allocation
            </h3>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-emerald-500">Correct Questions</span>
                <span>{Math.round((results.timeSpent * 0.6) / 60)} mins</span>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[60%] rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-red-500">Incorrect Questions</span>
                <span>{Math.round((results.timeSpent * 0.3) / 60)} mins</span>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-[30%] rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500 dark:text-slate-400">
                  Not Attempted
                </span>
                <span>{Math.round((results.timeSpent * 0.1) / 60)} mins</span>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 dark:bg-slate-500 w-[10%] rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-3 pb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onViewSolutions}
            className="w-full py-4 bg-slate-50 text-slate-900 dark:text-white font-bold rounded-2xl flex items-center justify-center gap-3 border border-slate-900/5 dark:border-white/5 shadow-xl hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 transition"
          >
            <BookOpen size={20} />
            View Solutions
            <ChevronRight size={20} />
          </motion.button>

          {onReattempt && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onReattempt}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition"
            >
              <Zap size={20} />
              Reattempt Test
              <ChevronRight size={20} />
            </motion.button>
          )}

          {onViewAnalysis && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onViewAnalysis}
              className="w-full py-4 bg-brand text-slate-900 font-bold rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-brand/20 hover:bg-blue-600 transition"
            >
              <BarChart3 size={20} />
              Full Deep Analysis
              <ChevronRight size={20} />
            </motion.button>
          )}
        </div>
      </main>
    </div>
  );
};

export default TestReport;
