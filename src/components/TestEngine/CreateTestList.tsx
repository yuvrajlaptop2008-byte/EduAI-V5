import React, { useState } from"react";
import { motion } from"motion/react";
import {
  ArrowLeft,
  Plus,
  Filter,
  Play,
  BarChart2,
  Clock,
  FileText,
} from"lucide-react";
import { CustomTest } from"./types";

interface CreateTestListProps {
  tests: CustomTest[];
  onBack: () => void;
  onCreateNew: () => void;
  onAttemptTest: (test: CustomTest) => void;
  onViewAnalysis: (test: CustomTest) => void;
}

const CreateTestList: React.FC<CreateTestListProps> = ({
  tests,
  onBack,
  onCreateNew,
  onAttemptTest,
  onViewAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<"All" |"Attempted" |"Not Attempted"
  >("All");

  const filteredTests = tests.filter((test) => {
    if (activeTab ==="All") return true;
    return test.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white pb-32">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-40 border-b border-slate-900/5 dark:border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-4 mb-6 relative">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 transition-all shadow-lg shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Custom Tests
          </h1>
        </div>

        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            <span className="text-brand font-black text-lg bg-brand/10 px-2 py-0.5 rounded-lg border border-brand/20 mr-1.5 shadow-inner">
              {tests.length}
            </span>
            Tests Generated
          </p>
          <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-2.5 rounded-xl border border-slate-900/10 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 transition-all shadow-sm">
            <Filter size={14} />
            Filter
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-900/10 dark:border-white/10 shadow-inner">
          {["All","Attempted","Not Attempted"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative z-10 ${
                activeTab === tab
                  ?"text-slate-900 dark:text-white"
                  :"text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeFilterTab"
                  className="absolute inset-0 bg-brand rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] -z-10"
                  transition={{ type:"spring", stiffness: 300, damping: 25 }}
                />
              )}
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 mt-6 space-y-4 relative z-10">
        {filteredTests.length > 0 ? (
          filteredTests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-50/40 dark:bg-slate-800/40 backdrop-blur-md p-6 rounded-[2rem] border border-slate-900/5 dark:border-white/5 shadow-xl hover:border-slate-900/10 dark:hover:border-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="px-2.5 py-1 bg-brand/10 text-brand text-[10px] font-black rounded-lg border border-brand/20 uppercase tracking-widest shadow-sm">
                      {test.exam}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-wide">
                      {new Date(test.createdAt).toLocaleDateString(undefined, {
                        month:"short",
                        day:"numeric",
                        year:"numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                    {test.name}
                  </h3>
                </div>
                {test.status ==="Attempted" && (
                  <div className="text-right shrink-0 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 shadow-inner">
                    <div className="text-lg font-black text-emerald-400 leading-none mb-1">
                      {test.score}{""}
                      <span className="text-sm font-bold text-emerald-500/50">
                        /{test.totalMarks}
                      </span>
                    </div>
                    <div className="text-[9px] text-emerald-500/80 font-black uppercase tracking-widest leading-none">
                      Score
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-5 mb-6 bg-white/5 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-900/5 dark:border-white/5 shadow-inner">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-bold flex-1 justify-center border-r border-slate-900/5 dark:border-white/5">
                  <FileText size={16} className="text-brand" />
                  {test.questionCount}{""}
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Qs
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-bold flex-1 justify-center">
                  <Clock size={16} className="text-amber-500" />
                  {test.duration}{""}
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Mins
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                {test.status ==="Attempted" ? (
                  <>
                    <button
                      onClick={() => onViewAnalysis(test)}
                      className="flex-1 py-3.5 bg-slate-100/50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm font-black rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 transition-all border border-slate-900/5 dark:border-white/5 shadow-sm"
                    >
                      <BarChart2 size={18} />
                      Analysis
                    </button>
                    <button
                      onClick={() => onAttemptTest(test)}
                      className="flex-1 py-3.5 bg-gradient-to-b from-brand to-blue-600 text-white text-sm font-black rounded-xl flex items-center justify-center gap-2 hover:from-blue-500 hover:to-blue-700 transition-all shadow-lg shadow-brand/20 border border-brand/50"
                    >
                      <Play size={18} fill="white" />
                      Retake
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onAttemptTest(test)}
                    className="w-full py-4 bg-gradient-to-b from-brand to-blue-600 text-white text-sm font-black rounded-xl flex items-center justify-center gap-2 hover:from-blue-500 hover:to-blue-700 transition-all shadow-lg shadow-brand/20 border border-brand/50"
                  >
                    <Play size={18} fill="white" />
                    Resume Test
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-24 text-center px-4">
            <div className="w-24 h-24 bg-slate-50/50 dark:bg-slate-800/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-500 dark:text-slate-400 shadow-inner border border-slate-900/5 dark:border-white/5">
              <FileText size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              No tests found
            </h3>
            <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400 max-w-[250px] mx-auto">
              Create your first highly customized mock test to get started
            </p>
          </div>
        )}
      </main>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-6 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/95 to-transparent z-40 pointer-events-none">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onCreateNew}
          className="w-full py-4.5 bg-gradient-to-b from-brand to-blue-600 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(37,99,235,0.4)] border border-brand/40 pointer-events-auto hover:brightness-110 transition-all"
        >
          <Plus size={24} strokeWidth={3} />
          Create New Custom Test
        </motion.button>
      </div>
    </div>
  );
};

export default CreateTestList;
