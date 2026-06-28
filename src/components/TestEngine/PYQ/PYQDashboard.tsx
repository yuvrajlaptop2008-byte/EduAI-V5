import React from"react";
import { ArrowLeft, ChevronRight, CheckCircle2 } from"lucide-react";

interface PYQDashboardProps {
  exam:"JEE Main" |"NEET";
  onBack: () => void;
  onSelectChapter: (subject: string, chapter: string) => void;
  onOpenFullPapers: () => void;
}

const PYQDashboard: React.FC<PYQDashboardProps> = ({
  exam,
  onBack,
  onOpenFullPapers,
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white pb-24">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg z-40 border-b border-slate-900/5 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand/20 rounded-xl flex items-center justify-center text-brand border border-brand/30">
                <CheckCircle2
                  size={24}
                  fill="currentColor"
                  className="text-brand"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight">{exam}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  {exam ==="JEE Main" ?"2019 - 2026" :"2012 - 2025"} | 39
                  Papers | 4037 Qs
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 mt-6">
        <div className="p-6 bg-slate-50/40 dark:bg-slate-800/40 border border-slate-900/10 dark:border-white/10 rounded-3xl text-center space-y-4">
          <h3 className="text-2xl font-bold">Mock Exams</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Take full length previous year papers to test your preparation in a
            real exam environment.
          </p>
          <button
            onClick={onOpenFullPapers}
            className="px-6 py-3 bg-brand text-slate-900 font-bold rounded-xl shadow-lg shadow-brand/20 mt-4 inline-flex items-center gap-2"
          >
            View All Full Papers <ChevronRight size={18} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default PYQDashboard;
