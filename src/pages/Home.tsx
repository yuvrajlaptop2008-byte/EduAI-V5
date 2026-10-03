import React, { useState, useEffect, lazy, Suspense } from"react";
const StudentAttendance = lazy(() => import("./StudentAttendance"));
const StudentRemarks = lazy(() => import("./StudentRemarks"));
import { motion, AnimatePresence } from"motion/react";
import { Link, useNavigate } from"react-router-dom";
import {
  Sparkles,
  Mic,
  Trophy,
  ChevronRight,
  Flame,
  FileText,
  Calendar,
  Zap,
  Beaker,
  Calculator,
  ArrowRight,
  Target,
  CheckCircle2,
  Circle,
  Plus,
  X,
  RotateCcw,
  BookOpen,
  Cpu,
  Activity,
  RotateCw,
  Battery,
  Thermometer,
  Grid,
  GraduationCap,
  Dna,
  Share2,
  Star,
  Youtube,
  Instagram,
  Twitter,
  Send,
  Bookmark,
} from"lucide-react";
import { useUser } from"../context/UserContext";
import Sidebar from"../components/Sidebar";
import { toast } from "sonner";

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Physics");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [rating, setRating] = useState(0);

  // Daily Goal State from Context
  const {
    dailyGoal,
    setDailyGoal,
    currentQs,
    setCurrentQs,
    dailyPoints,
    streak,
    setStreak,
    user,
    userRank,
    chapterProgress,
    tasks,
    setTasks,
    profilePic,
    field,
  } = useUser();

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoalValue, setNewGoalValue] = useState(dailyGoal.toString());

  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [overlay, setOverlay] = useState<"attendance" | "remarks" | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [groupTestSummary, setGroupTestSummary] = useState<{ total: number; avgScore: number; bestRank: number | null } | null>(null);
  const [lastAttempted, setLastAttempted] = useState<any | null>(null);
  const [weakChaptersList, setWeakChaptersList] = useState<any[]>([]);

  useEffect(() => {
    if (user?.uid && user?.examGroupId) {
      import("../services/groupTestsDB").then(({ listAttemptsForStudent }) => {
        listAttemptsForStudent(user.uid).then((attempts) => {
          if (attempts.length === 0) return;
          const avg = Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length);
          const ranks = attempts.map((a) => a.rank).filter((r): r is number => r !== null);
          setGroupTestSummary({ total: attempts.length, avgScore: avg, bestRank: ranks.length ? Math.min(...ranks) : null });
        }).catch(() => {});
      });
    }
  }, [user?.uid, user?.examGroupId]);

  useEffect(() => {
    const fetchReports = async () => {
      let currentReports = [];
      if (user && user.uid !== "demo") {
        const { syncTestReports } = await import("../utils/analysis");
        currentReports = await syncTestReports(user.uid);
      } else {
        const { getTestReports } = await import("../utils/analysis");
        currentReports = getTestReports();
      }
      setReports(currentReports);
      if (currentReports.length > 0) {
        setLastAttempted(currentReports[currentReports.length - 1]);
        const { chapterStats, weakChapters } = await import("../utils/analysis");
        const stats = chapterStats(currentReports);
        setWeakChaptersList(weakChapters(stats));
      }
    };
    fetchReports();
  }, [user]);

  const progressPercentage = dailyGoal > 0
    ? Math.min(100, Math.max(0, (currentQs / dailyGoal) * 100))
    : 0;
  const isTodayCompleted = currentQs >= dailyGoal;

  const handleSaveGoal = () => {
    const parsed = parseInt(newGoalValue);
    if (!isNaN(parsed) && parsed > 0) {
      setDailyGoal(parsed);
    }
    setIsEditingGoal(false);
  };

  const toggleTask = (taskId: number) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      ),
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks([
      ...tasks,
      { id: Date.now(), title: newTaskTitle.trim(), completed: false },
    ]);
    setNewTaskTitle("");
  };

  const handleDeleteTask = (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const exams =
    field ==="Medical"
      ? [
          { name:"NEET", color:"text-blue-400", bg:"bg-blue-400/10" },
          { name:"AIIMS", color:"text-rose-400", bg:"bg-rose-400/10" },
          {
            name:"JIPMER",
            color:"text-emerald-400",
            bg:"bg-emerald-400/10",
          },
          {
            name:"NEET NTA",
            color:"text-purple-400",
            bg:"bg-purple-400/10",
          },
          { name:"INI-CET", color:"text-amber-400", bg:"bg-amber-400/10" },
          {
            name:"MHT-CET (PCB)",
            color:"text-cyan-400",
            bg:"bg-cyan-400/10",
          },
          { name:"KCET (Med)", color:"text-pink-400", bg:"bg-pink-400/10" },
          {
            name:"AP EAMCET",
            color:"text-indigo-400",
            bg:"bg-indigo-400/10",
          },
        ]
      : [
          { name:"JEE Main", color:"text-blue-400", bg:"bg-blue-400/10" },
          {
            name:"JEE Advanced",
            color:"text-rose-400",
            bg:"bg-rose-400/10",
          },
          {
            name:"BITSAT",
            color:"text-emerald-400",
            bg:"bg-emerald-400/10",
          },
          { name:"MHT-CET", color:"text-purple-400", bg:"bg-purple-400/10" },
          { name:"NDA", color:"text-amber-400", bg:"bg-amber-400/10" },
          { name:"VITEEE", color:"text-cyan-400", bg:"bg-cyan-400/10" },
          { name:"NEST", color:"text-pink-400", bg:"bg-pink-400/10" },
          { name:"COMEDK", color:"text-indigo-400", bg:"bg-indigo-400/10" },
        ];

  const chapters =
    field ==="Medical"
      ? {
          Physics: [
            {
              title:"Current Electricity",
              qs: 6,
              color:"from-blue-500 to-blue-600",
              icon: <Zap size={20} />,
            },
            {
              title:"Semiconductors",
              qs: 2,
              color:"from-emerald-500 to-emerald-600",
              icon: <Cpu size={20} />,
            },
            {
              title:"Alternating Current",
              qs: 2,
              color:"from-rose-500 to-rose-600",
              icon: <Activity size={20} />,
            },
          ],
          Chemistry: [
            {
              title:"p Block Elements",
              qs: 2,
              color:"from-orange-500 to-orange-600",
              icon: <Beaker size={20} />,
            },
            {
              title:"Electrochemistry",
              qs: 2,
              color:"from-teal-500 to-teal-600",
              icon: <Battery size={20} />,
            },
          ],
          Biology: [
            {
              title:"Human Reproduction",
              qs: 5,
              color:"from-pink-500 to-pink-600",
              icon: <Dna size={20} />,
            },
            {
              title:"Genetics",
              qs: 4,
              color:"from-purple-500 to-purple-600",
              icon: <Dna size={20} />,
            },
          ],
        }
      : {
          Physics: [
            {
              title:"Current Electricity",
              qs: 6,
              color:"from-blue-500 to-blue-600",
              icon: <Zap size={20} />,
            },
            {
              title:"Semiconductors",
              qs: 2,
              color:"from-emerald-500 to-emerald-600",
              icon: <Cpu size={20} />,
            },
            {
              title:"Alternating Current",
              qs: 2,
              color:"from-rose-500 to-rose-600",
              icon: <Activity size={20} />,
            },
            {
              title:"Rotational Motion",
              qs: 2,
              color:"from-purple-500 to-purple-600",
              icon: <RotateCw size={20} />,
            },
          ],
          Chemistry: [
            {
              title:"p Block Elements",
              qs: 2,
              color:"from-orange-500 to-orange-600",
              icon: <Beaker size={20} />,
            },
            {
              title:"Electrochemistry",
              qs: 2,
              color:"from-teal-500 to-teal-600",
              icon: <Battery size={20} />,
            },
            {
              title:"Thermodynamics",
              qs: 1,
              color:"from-cyan-500 to-cyan-600",
              icon: <Thermometer size={20} />,
            },
            {
              title:"Chemical Kinetics",
              qs: 2,
              color:"from-pink-500 to-pink-600",
              icon: <Activity size={20} />,
            },
            {
              title:"Organic Chemistry",
              qs: 1,
              color:"from-orange-500 to-orange-600",
              icon: <Beaker size={20} />,
            },
            {
              title:"Chemical Bonding",
              qs: 1,
              color:"from-purple-500 to-purple-600",
              icon: <Beaker size={20} />,
            },
          ],
          Maths: [
            {
              title:"Calculus",
              qs: 3,
              color:"from-indigo-500 to-indigo-600",
              icon: <Calculator size={20} />,
            },
            {
              title:"Coordinate Geometry",
              qs: 2,
              color:"from-amber-500 to-amber-600",
              icon: <Grid size={20} />,
            },
            {
              title:"Algebra",
              qs: 1,
              color:"from-amber-500 to-amber-600",
              icon: <Calculator size={20} />,
            },
          ],
        };

  const tabs =
    field ==="Medical"
      ? ["Physics","Chemistry","Biology"]
      : ["Physics","Chemistry","Maths"];

  // Ensure active tab is valid for the current field
  useEffect(() => {
    if (field ==="Medical" && activeTab ==="Maths") {
      setActiveTab("Biology");
    } else if (field ==="Engineering" && activeTab ==="Biology") {
      setActiveTab("Maths");
    }
  }, [field, activeTab]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white pb-24">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-12 h-12 rounded-full border-2 border-brand p-0.5 overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-[#0f172a]"
          >
            <img
              src={
                profilePic ||
                `https://api.dicebear.com/9.x/adventurer/svg?seed=${user?.uid || "user"}`
              }
              alt="Avatar"
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Hey, {user?.name ||"Student"}
              </span>
              <div className="bg-brand/20 text-brand text-[10px] font-bold px-1.5 py-0.5 rounded border border-brand/30 uppercase tracking-wider">
                Premium
              </div>
            </div>
            <h1 className="text-lg font-bold">Ready to practice?</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20 shadow-inner overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite]" />
            <Flame
              size={16}
              className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]"
            />
            <span className="text-orange-500 font-bold text-sm">{streak}</span>
          </div>
          <Link
            to="/app/leaderboard"
            className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border border-amber-500/30 flex items-center justify-center text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 hover:scale-105 transition-all shadow-lg shadow-amber-500/10 relative group"
          >
            <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            <Trophy size={18} className="relative z-10" />
            {userRank <= 100 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-[#0f172a] rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                !
              </span>
            )}
          </Link>
          <Link
            to="/app/notebook"
            className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border border-slate-600 flex items-center justify-center text-brand hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 hover:scale-105 transition-all shadow-lg relative group"
          >
            <div className="absolute inset-0 bg-brand/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sparkles size={18} className="relative z-10" />
          </Link>
        </div>
      </header>

      <main className="px-6 space-y-8">
        {/* Daily Goal */}
        <section className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-[2rem] p-6 border border-slate-900/10 dark:border-white/10 shadow-2xl relative overflow-hidden">
          {/* Subtle glow orb */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                Your Daily Goal
                <button
                  onClick={() => {
                    setNewGoalValue(dailyGoal.toString());
                    setIsEditingGoal(true);
                  }}
                  className="text-xs text-brand bg-brand/10 px-2 py-1 rounded-md hover:bg-brand/20 transition-colors uppercase font-black"
                >
                  Edit
                </button>
              </h2>

              {isEditingGoal ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={newGoalValue}
                    onChange={(e) => setNewGoalValue(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-brand/30 rounded-lg px-3 py-1 w-24 text-slate-900 dark:text-white font-bold outline-none focus:border-brand shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveGoal}
                    className="bg-brand text-slate-900 px-3 py-1 rounded-lg text-sm font-bold shadow-md shadow-brand/20"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingGoal(false)}
                    className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white p-1.5 rounded-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand to-blue-400">
                    {currentQs}
                  </span>
                  {currentQs < dailyGoal && (
                    <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      +{dailyGoal - currentQs}
                    </span>
                  )}
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide text-xs">
                    / {dailyGoal} Qs
                  </span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-brand to-blue-600 rounded-[1rem] flex items-center justify-center text-white shadow-lg shadow-brand/30">
              <Target size={24} />
            </div>
          </div>

          <div className="relative h-12 flex items-center justify-between px-2 mb-4">
            <div className="absolute left-0 right-0 h-2 bg-slate-100/50 dark:bg-slate-700/50 rounded-full overflow-hidden border border-slate-900/5 dark:border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease:"easeOut" }}
                className="h-full bg-gradient-to-r from-brand to-blue-400 rounded-full relative"
              >
                <div className="absolute inset-0 bg-white/20 dark:bg-slate-900/20 w-full animate-[shimmer_2s_infinite]" />
              </motion.div>
            </div>

            {[
              { icon:"🚶", label:"Start", threshold: 0 },
              { icon:"🏃", label:"Running", threshold: 50 },
              { icon:"🏁", label:"Finish", threshold: 100 },
            ].map((step, i) => {
              const isActive = progressPercentage >= step.threshold;
              return (
                <div
                  key={i}
                  className="relative z-10 flex flex-col items-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.3 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-xl transition-all duration-500 ${isActive ?"bg-brand text-slate-900 border-2 border-[#0F172A] shadow-brand/30 scale-110" :"bg-slate-50 dark:bg-slate-800 border-2 border-slate-600/50 text-slate-500 dark:text-slate-400"}`}
                  >
                    {step.icon}
                  </motion.div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-900/5 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span className="text-slate-500 dark:text-slate-400">
                    Points Earned:
                  </span>
                  <span className="text-amber-400 flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 px-3 py-1 rounded-lg shadow-lg shadow-amber-500/10">
                    <Zap size={14} className="fill-amber-400" /> {dailyPoints}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400/80 dark:text-slate-500/80 font-bold uppercase tracking-wider mt-1">
                  Correct: +10 • Wrong: 0 • Re-attempt: +5
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Daily Tasks */}
        <section>
          <div className="flex justify-between items-center mb-4 border-b border-slate-900/5 dark:border-white/5 pb-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 size={16} />
              </span>
              Daily Tasks
            </h2>
            <div className="flex items-center gap-3">
              {tasks.some((t) => t.completed) && (
                <button
                  onClick={() => setTasks(tasks.filter((t) => !t.completed))}
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider"
                >
                  Clear Completed
                </button>
              )}
              <span className="text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-1 rounded-md tracking-wider">
                {tasks.filter((t) => t.completed).length}/{tasks.length} DONE
              </span>
            </div>
          </div>

          <form onSubmit={handleAddTask} className="mb-4 flex gap-2 relative">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done today?"
              className="flex-1 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-brand transition-all focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder:text-slate-500 dark:text-slate-400"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="bg-brand text-slate-900 p-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-blue-600 flex items-center justify-center shadow-lg shadow-brand/20 disabled:shadow-none"
            >
              <Plus size={20} />
            </button>
          </form>

          <div className="space-y-3">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleTask(task.id)}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all group ${
                  task.completed
                    ?"bg-emerald-500/10 border-emerald-500/20 shadow-inner"
                    :"bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-600 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-4">
                  {task.completed ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle2
                        size={20}
                        className="text-emerald-500 bg-emerald-500/20 rounded-full"
                      />
                    </motion.div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-600 group-hover:border-brand transition-colors" />
                  )}
                  <span
                    className={`font-medium transition-colors duration-300 ${task.completed ?"text-slate-500 dark:text-slate-400 line-through" :"text-slate-700 dark:text-slate-200"}`}
                  >
                    {task.title}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteTask(task.id, e)}
                  className="text-slate-500 dark:text-slate-400 hover:text-rose-500 bg-rose-500/0 hover:bg-rose-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all p-1.5"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-slate-500 dark:text-slate-400 text-sm py-8 bg-slate-50/30 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                You've cleared your schedule! Time to crush some PYQs.
              </div>
            )}
          </div>
        </section>


        {/* Continue where you left off */}
        {lastAttempted && (
          <section className="bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-900/5 dark:border-white/5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full blur-2xl" />
            <div className="flex justify-between items-center relative z-10">
              <div>
                <span className="text-[10px] font-black text-brand uppercase tracking-widest bg-brand/10 px-2 py-0.5 rounded border border-brand/20">
                  Continue where you left off
                </span>
                <h4 className="font-bold text-base text-slate-800 dark:text-white mt-3">{lastAttempted.subject}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{lastAttempted.chapter}</p>
              </div>
              <button
                onClick={() => navigate("/app/tests")}
                className="text-xs font-bold text-slate-900 bg-brand px-4 py-2 rounded-xl hover:bg-brand-light transition-all shadow-md shadow-brand/10 shrink-0"
              >
                Resume
              </button>
            </div>
          </section>
        )}


        {/* PYQ Bank */}
        <section>
          <div className="flex justify-between items-center mb-4 border-b border-slate-900/5 dark:border-white/5 pb-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                <BookOpen size={16} />
              </div>
              Chapter PYQ Bank
            </h2>
            <button className="text-indigo-400 text-xs font-bold uppercase tracking-wider hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
              View All
            </button>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-6 px-6 snap-x">
            <div className="grid grid-rows-2 grid-flow-col gap-4">
              {exams.map((exam, i) => {
                const examId = exam.name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g,"-")
                  .replace(/(^-|-$)/g,"");
                return (
                  <motion.div
                    key={i}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/app/exam/${examId}`)}
                    className="w-36 h-28 bg-slate-50/60 dark:bg-slate-800/60 backdrop-blur-md rounded-[1.5rem] p-4 border border-slate-200/50 dark:border-slate-700/50 flex flex-col justify-between snap-start hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 hover:border-slate-600 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
                  >
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/5 dark:bg-slate-900/5 rounded-full blur-xl group-hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" />
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${exam.bg} ${exam.color}`}
                    >
                      <BookOpen size={20} />
                    </div>
                    <span className="text-sm font-bold leading-tight relative z-10 text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:hover:text-white">
                      {exam.name}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* MARKS Tests */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold mb-4">MARKS Tests</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link
              to="/app/tests"
              state={{ initialView:"pyq-exam-list", selectedExam: field ==="Medical" ?"NEET" :"JEE Main" }}
            >
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="p-5 rounded-[2rem] border border-indigo-500/30 bg-gradient-to-br from-slate-100/80 to-indigo-50/40 dark:from-slate-800/80 dark:to-indigo-950/40 relative overflow-hidden group cursor-pointer shadow-xl shadow-indigo-900/20"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors duration-500" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="pr-4 tracking-wide w-full">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                        PYQ Mock Tests
                      </h3>
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-black rounded-lg uppercase shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                        NEW
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                      Real previous year questions in exam-simulated
                      environment.
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-indigo-400 to-blue-500" />
                        <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-purple-400 to-pink-500" />
                      </div>
                      <span className="text-[10px] font-medium text-indigo-400">
                        Full exam simulation
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[1rem] flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 ml-4">
                    <FileText size={24} />
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link to="/app/tests" state={{ initialView:"create-flow" }}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="p-5 rounded-[2rem] border border-emerald-500/30 bg-gradient-to-br from-emerald-50/80 to-emerald-100/40 dark:from-slate-800/80 dark:to-emerald-950/40 relative overflow-hidden group cursor-pointer shadow-xl shadow-emerald-900/20"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-500" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="pr-4 tracking-wide w-full">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                        Create Custom Test
                      </h3>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black rounded-lg uppercase shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        UPDATED
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                      Select subjects and set your own timer. Build practice
                      sessions.
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-emerald-400 to-teal-500" />
                        <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-cyan-400 to-blue-500" />
                      </div>
                      <span className="text-[10px] font-medium text-emerald-400">
                        Customizable practice
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-[1rem] flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ml-4">
                    <Calendar size={24} />
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>

          <Link to="/app/dpp" className="block mt-4">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="p-5 rounded-[2rem] border border-orange-500/30 bg-gradient-to-br from-orange-50/80 to-orange-100/40 dark:from-slate-800/80 dark:to-orange-950/40 relative overflow-hidden group cursor-pointer shadow-xl shadow-orange-900/20"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/20 transition-colors duration-500" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="pr-4 tracking-wide w-full">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-orange-400 transition-colors">
                      Solve DPPs
                    </h3>
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black rounded-lg uppercase shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                      HOT
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    Structured Daily Practice. 700+ curated problems by expert educators.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-orange-400 to-amber-500" />
                      <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-red-400 to-orange-500" />
                    </div>
                    <span className="text-[10px] font-medium text-orange-400">
                      Structured Daily Practice
                    </span>
                  </div>
                </div>
                <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-600 rounded-[1rem] flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ml-4">
                  <Flame size={24} />
                </div>
              </div>
            </motion.div>
          </Link>

          <Link
            to="/app/tests"
            state={{ initialView:"class-test-list" }}
            className="block mt-4 mb-4"
          >
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="p-5 rounded-[2rem] border border-purple-500/30 bg-gradient-to-br from-purple-50/80 to-purple-100/40 dark:from-slate-800/80 dark:to-purple-950/40 relative overflow-hidden group cursor-pointer shadow-xl shadow-purple-900/20"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-colors duration-500" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="pr-4 tracking-wide w-full">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-purple-400 transition-colors tracking-tight">
                      Class Tests
                    </h3>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-black rounded-lg uppercase shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                      ASSIGNED
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    Attempt structured tests officially assigned by your
                    teachers.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-purple-400 to-indigo-500" />
                      <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-pink-400 to-purple-500" />
                    </div>
                    <span className="text-[10px] font-medium text-purple-400">
                      Assigned by teachers
                    </span>
                  </div>
                </div>
                <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-[1rem] flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 ml-4">
                  <GraduationCap size={24} />
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Attendance + Remarks quick-access row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <motion.button
              onClick={() => setOverlay("attendance")}
              whileTap={{ scale: 0.97 }}
              className="p-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/80 to-teal-100/40 dark:from-slate-800/80 dark:to-emerald-950/40 text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-2">
                <Calendar size={16} className="text-white" />
              </div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">Attendance</p>
              <p className="text-xs text-slate-500 mt-0.5">Your records & trend</p>
            </motion.button>
            <motion.button
              onClick={() => setOverlay("remarks")}
              whileTap={{ scale: 0.97 }}
              className="p-4 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-50/80 to-purple-100/40 dark:from-slate-800/80 dark:to-violet-950/40 text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center mb-2">
                <Activity size={16} className="text-white" />
              </div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">Remarks</p>
              <p className="text-xs text-slate-500 mt-0.5">Feedback from teachers</p>
            </motion.button>
          </div>

          {/* Student Analytics quick-link */}
          <Link to="/app/analytics" className="block mb-3">
            <motion.div whileTap={{scale:0.97}} className="p-3.5 rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-50/80 to-blue-100/40 dark:from-slate-800/80 dark:to-sky-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center"><Activity size={16} className="text-white"/></div><div><p className="font-bold text-sm text-slate-900 dark:text-white">My Analytics</p><p className="text-xs text-slate-500">Score trends · subject accuracy</p></div></div>
              <ChevronRight size={16} className="text-slate-300"/>
            </motion.div>
          </Link>
          {/* Group test performance snapshot */}
          {groupTestSummary && (
            <Link to="/app/tests" state={{ initialView: "class-test-list" }} className="block mb-4">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-brand/20 bg-gradient-to-br from-orange-50/80 to-amber-100/40 dark:from-slate-800/80 dark:to-orange-950/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">Class Test Performance</p>
                    <p className="text-xs text-slate-500 mt-0.5">{groupTestSummary.total} test{groupTestSummary.total > 1 ? "s" : ""} attempted</p>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div>
                      <p className="text-lg font-extrabold text-brand">{groupTestSummary.avgScore}</p>
                      <p className="text-[10px] text-slate-400">Avg score</p>
                    </div>
                    {groupTestSummary.bestRank && (
                      <div>
                        <p className="text-lg font-extrabold text-amber-500">#{groupTestSummary.bestRank}</p>
                        <p className="text-[10px] text-slate-400">Best rank</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          )}
        </section>

        {/* Formula Cards */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="text-brand" />
              Formula Cards
            </h2>
            <Link
              to="/app/formulas"
              className="text-sm font-bold text-brand bg-brand/10 px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-brand/20 transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="flex bg-slate-50/50 dark:bg-slate-800/50 p-1.5 rounded-2xl mb-6 shadow-inner border border-slate-900/5 dark:border-white/5 mx-auto max-w-md">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-[1] py-2.5 rounded-xl text-sm font-bold transition-all relative z-10 ${activeTab === tab ?"text-slate-900 dark:text-white" :"text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="formulaTabIndicator"
                    className="absolute inset-0 bg-brand rounded-xl -z-10 shadow-lg shadow-brand/20"
                    transition={{ type:"spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {tab}
              </button>
            ))}
          </div>

          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-6 px-6 snap-x">
            <Link
              to={`/app/formulas/${activeTab}`}
              className="min-w-[160px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-[2rem] p-5 flex flex-col justify-center items-center h-48 snap-start shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-slate-900/5 dark:border-white/5 hover:border-brand/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-brand/5 group-hover:bg-brand/10 transition-colors" />
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-brand mb-4 shadow-inner border border-slate-900/5 dark:border-white/5 relative z-10">
                <FileText size={28} />
              </div>
              <h3 className="font-bold text-sm leading-tight text-center relative z-10">
                View All
                <br />
                {activeTab} Formulas
              </h3>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <ChevronRight size={16} className="text-brand" />
              </div>
            </Link>
            {(chapters[activeTab as keyof typeof chapters] || []).map(
              (chapter, i) => (
                <Link
                  key={i}
                  to={`/app/formulas/${activeTab}/${encodeURIComponent(chapter.title)}`}
                >
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className={`min-w-[160px] bg-gradient-to-br ${chapter.color} rounded-[2rem] p-6 flex flex-col justify-between h-48 snap-start shadow-[0_8px_30px_rgb(0,0,0,0.4)] cursor-pointer relative overflow-hidden group`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 dark:bg-slate-900/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" />
                    <div className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-slate-900/10 dark:border-white/10 shadow-inner relative z-10">
                      {chapter.icon}
                    </div>
                    <div className="relative z-10 mt-4">
                      <h3 className="font-black text-[15px] leading-tight mb-2 drop-shadow-md">
                        {chapter.title}
                      </h3>
                      <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-900/10 dark:border-white/10">
                        <FileText size={12} className="opacity-80" />
                        <p className="text-[10px] font-bold opacity-90 uppercase tracking-widest leading-none">
                          {chapter.qs} Cards
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ),
            )}
          </div>
        </section>

        {/* Social interactions */}
        <section className="mt-8 space-y-8 pb-10">
          {/* Study with your friends */}
          <div className="bg-slate-50/80 dark:bg-slate-800/80 p-5 rounded-3xl border border-slate-900/5 dark:border-white/5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand/20 blur-3xl rounded-full" />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <h3 className="text-[22px] font-bold">Study with your friends</h3>
              <button className="p-2 bg-white/5 dark:bg-slate-900/5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95 text-slate-600 dark:text-slate-300">
                <Share2 size={20} />
              </button>
            </div>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 mb-6 relative z-10 max-w-[85%] leading-relaxed">
              Invite your friends to Marks app
              <br />
              to learn together
            </p>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "MARKS - Crack JEE & NEET",
                    text: "Hey! I'm using MARKS app to prepare for competitive exams. Join me and practice PYQs, DPPs, and more!",
                    url: window.location.origin,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(`Hey! I'm using MARKS app to prepare for competitive exams. Join me! ${window.location.origin}`);
                  alert("Invite link copied to clipboard!");
                }
              }}
              className="w-full py-4 text-[15px] bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-[14px] hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors relative z-10 shadow-lg shadow-white/10 dark:shadow-none active:scale-[0.98]"
            >
              Invite Friends
            </button>
          </div>

          {/* Enjoying MARKS? */}
          <div className="text-center py-6">
            <h3 className="text-2xl font-bold mb-3">Enjoying MARKS?</h3>
            <p className="text-base text-slate-600 dark:text-slate-300 mb-8 max-w-[300px] mx-auto leading-relaxed">
              Take a minute to provide your review and rating on the Play Store.
            </p>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    setRating(star);
                    toast.success(`Thank you for rating us ${star} stars!`);
                  }}
                  className="text-[#fca311] hover:scale-110 transition-transform active:scale-95 p-1"
                >
                  <Star
                    size={42}
                    className={
                      star <= rating ? "fill-[#fca311]" : "fill-transparent"
                    }
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={() => toast.success("Thank you for your rating and support!")}
              className="text-[17px] font-bold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-700 dark:text-slate-200 transition-colors"
            >
              I have already rated
            </button>
          </div>

          {/* We're on Social Media */}
          <div>
            <h3 className="text-[22px] font-bold mb-3">
              We're on Social Media
            </h3>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Follow us & share with your friends. It motivates us to keep
              working hard for you to bring new features & keep the app FREE.
            </p>

            <div className="grid grid-cols-2 gap-3.5">
              <a
                href="#"
                className="flex items-center gap-3.5 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-900/5 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-[0.98]"
              >
                <Youtube size={26} className="text-[#ff0000]" />
                <span className="font-bold text-[17px]">Youtube</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-3.5 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-900/5 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-[0.98]"
              >
                <Instagram size={26} className="text-[#e1306c]" />
                <span className="font-bold text-[17px]">Instagram</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-3.5 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-900/5 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-[0.98]"
              >
                <Send size={26} className="text-[#2aabee] -rotate-12" />
                <span className="font-bold text-[17px]">Telegram</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-3.5 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-900/5 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-[0.98]"
              >
                <Twitter
                  size={26}
                  className="text-[#1da1f2]"
                  fill="currentColor"
                />
                <span className="font-bold text-[17px]">Twitter</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Full-screen overlays for student attendance/remarks */}
      <AnimatePresence>
        {overlay && (
          <motion.div
            key={overlay}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-0 z-[100] overflow-y-auto"
          >
            <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" /></div>}>
              {overlay === "attendance" && <StudentAttendance onBack={() => setOverlay(null)} />}
              {overlay === "remarks" && <StudentRemarks onBack={() => setOverlay(null)} />}
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
