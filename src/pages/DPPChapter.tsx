import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Play,
  FileText,
  X,
  CheckCircle2,
  Clock,
  Lock,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { getChapterDppProgress } from "../utils/firestoreDppDB";

const MOCK_DPPS = [
  {
    id: "dpp1",
    title: "DPP 1",
    difficulty: "Easy",
    questions: 10,
    status: "completed",
    score: 8,
  },
  {
    id: "dpp2",
    title: "DPP 2",
    difficulty: "Easy",
    questions: 10,
    status: "not_attempted",
  },
  {
    id: "dpp3",
    title: "DPP 3",
    difficulty: "Moderate",
    questions: 15,
    status: "not_attempted",
  },
  {
    id: "dpp4",
    title: "DPP 4",
    difficulty: "Moderate",
    questions: 15,
    status: "locked",
  },
  {
    id: "dpp5",
    title: "DPP 5",
    difficulty: "Tough",
    questions: 20,
    status: "locked",
  },
];

export default function DPPChapter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subject, chapterId } = useParams<{ subject: string; chapterId: string }>();
  const { user } = useUser();
  const chapterName = location.state?.chapterName || "Chapter Name";

  const [selectedDpp, setSelectedDpp] = useState<string | null>(null);
  const [showModeModal, setShowModeModal] = useState(false);
  const [dppList, setDppList] = useState(MOCK_DPPS);

  useEffect(() => {
    const fetchProgress = async () => {
      let list = [...MOCK_DPPS];

      if (user && user.uid !== "demo" && chapterId) {
        const progress = await getChapterDppProgress(user.uid, chapterId);
        if (progress && progress.completedDpps) {
          list = list.map((dpp) => {
            const completedInfo = progress.completedDpps[dpp.id];
            if (completedInfo) {
              return {
                ...dpp,
                status: completedInfo.status,
                score: completedInfo.score,
              };
            }
            return dpp;
          });
        }
      }

      // Sequentially unlock: Index 0 is always unlocked; subsequent indexes are unlocked if the previous is completed.
      const unlockedList = list.map((dpp, idx) => {
        if (idx === 0) {
          if (dpp.status === "locked") {
            return { ...dpp, status: "not_attempted" };
          }
          return dpp;
        }

        const prevDpp = list[idx - 1];
        if (prevDpp.status === "completed") {
          if (dpp.status === "locked") {
            return { ...dpp, status: "not_attempted" };
          }
        }
        return dpp;
      });

      setDppList(unlockedList);
    };
    fetchProgress();
  }, [user, chapterId]);

  const handleDppClick = (dppId: string, status: string) => {
    if (status === "locked") {
      alert("This DPP is locked. Upgrade to premium to access.");
      return;
    }
    setSelectedDpp(dppId);
    setShowModeModal(true);
  };

  const handleModeSelect = (mode: "quiz" | "assignment") => {
    setShowModeModal(false);
    if (mode === "quiz") {
      navigate("/app/practice", {
        state: { source: "dpp_quiz", dppId: selectedDpp, chapterName, subject, chapterId },
      });
    } else {
      navigate("/app/practice", {
        state: { source: "dpp_assignment", dppId: selectedDpp, chapterName, subject, chapterId },
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans flex flex-col pb-20 relative overflow-hidden">
      {/* Superior Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="px-6 py-6 pt-10 flex flex-col gap-3 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-20 border-b border-slate-200/60 shadow-sm relative">
        <div
          className="flex items-center gap-4 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer w-max"
          onClick={() => navigate(-1)}
        >
          <button className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <span className="font-semibold text-sm uppercase tracking-widest">
            Back to Modules
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight font-serif text-slate-800 dark:text-white line-clamp-1">
            {chapterName}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              1 Problem Set Attempted
            </p>
          </div>
        </div>
      </div>

      {/* DPP List */}
      <div className="p-6 space-y-8 relative z-10">
        {["Easy","Moderate","Tough"].map((difficulty) => {
          const dpps = dppList.filter((d) => d.difficulty === difficulty);
          if (dpps.length === 0) return null;

          return (
            <div key={difficulty} className="space-y-4">
              <h2
                className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
                  difficulty ==="Easy"
                    ?"text-emerald-600"
                    : difficulty ==="Moderate"
                      ?"text-amber-600"
                      :"text-rose-600"
                }`}
              >
                {difficulty} Stage
                <div className="h-px flex-1 bg-slate-200 ml-2"></div>
              </h2>

              <div className="grid gap-4">
                {dpps.map((dpp) => (
                  <motion.div
                    key={dpp.id}
                    whileTap={{ scale: dpp.status ==="locked" ? 1 : 0.98 }}
                    onClick={() => handleDppClick(dpp.id, dpp.status)}
                    className={`p-5 rounded-[1.5rem] border flex items-center justify-between transition-all ${
                      dpp.status ==="locked"
                        ?"bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-80 cursor-not-allowed"
                        :"bg-white dark:bg-slate-900 border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 dark:border-slate-600 cursor-pointer group"
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ${
                          dpp.status ==="completed"
                            ?"bg-emerald-50 text-emerald-600 border-emerald-100"
                            : dpp.status ==="locked"
                              ?"bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                              :"bg-blue-50 text-brand border-blue-100 group-hover:bg-brand group-hover:text-slate-900 dark:hover:text-white transition-colors"
                        }`}
                      >
                        {dpp.status ==="completed" ? (
                          <CheckCircle2 size={24} strokeWidth={2} />
                        ) : dpp.status ==="locked" ? (
                          <Lock
                            size={20}
                            strokeWidth={2}
                            className="opacity-70"
                          />
                        ) : (
                          <FileText size={24} strokeWidth={2} />
                        )}
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-bold tracking-tight mb-1 ${dpp.status ==="locked" ?"text-slate-500 dark:text-slate-400" :"text-slate-800 dark:text-slate-200"}`}
                        >
                          {dpp.title}
                        </h3>
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 ${dpp.status ==="locked" ?"text-slate-500 dark:text-slate-400" :"text-slate-500 dark:text-slate-400"}`}
                          >
                            <FileText size={12} strokeWidth={2.5} />{""}
                            {dpp.questions} Qs
                          </span>
                          {dpp.status ==="completed" && (
                            <span className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              Score: {dpp.score}{""}
                              <span className="opacity-50">/</span>{""}
                              {dpp.questions}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {dpp.status !=="locked" && (
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-brand group-hover:text-slate-900 group-hover:border-brand transition-all">
                        <Play size={18} strokeWidth={2.5} className="ml-1" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mode Selection Modal */}
      <AnimatePresence>
        {showModeModal && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowModeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y:"100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y:"100%" }}
              transition={{ type:"spring", damping: 25, stiffness: 300 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 w-full max-w-md shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-serif font-semibold text-slate-800 dark:text-white">
                    Select Mode
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest mt-1">
                    Configure practice environment
                  </p>
                </div>
                <button
                  onClick={() => setShowModeModal(false)}
                  className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleModeSelect("assignment")}
                  className="w-full p-5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 focus:border-brand/50 rounded-2xl flex items-center gap-5 transition-all text-left shadow-sm hover:shadow-md group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-slate-900 group-hover:border-brand transition-all">
                    <FileText size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-1">
                      Assignment Mode
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
                      Solve problems at your own pace without pressure.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleModeSelect("quiz")}
                  className="w-full p-5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 focus:border-brand/50 rounded-2xl flex items-center gap-5 transition-all text-left shadow-sm hover:shadow-md group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-900 dark:hover:text-white group-hover:border-amber-500 transition-all">
                    <Clock size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-1">
                      Quiz Mode
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
                      Timed examination parameters for real simulation.
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
