import React from"react";
import { motion } from"motion/react";
import { ArrowLeft, FileText, ChevronRight, CheckCircle2 } from"lucide-react";

interface PYQHomeProps {
  onBack: () => void;
  onSelectExam: (exam:"JEE Main" |"NEET") => void;
}

const PYQHome: React.FC<PYQHomeProps> = ({ onBack, onSelectExam }) => {
  const exams = [
    {
      id:"jee",
      name:"JEE Main" as const,
      range:"2019 - 2026",
      logo:"https://api.dicebear.com/9.x/glass/svg?seed=jee_logo",
    },
    {
      id:"neet",
      name:"NEET" as const,
      range:"2002 - 2025",
      logo:"https://api.dicebear.com/9.x/glass/svg?seed=neet_logo",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Header with Gradient */}
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#450a0a] via-[#800000] to-[#0F172A]" />

        {/* Abstract shapes for design */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute right-10 top-10 w-32 h-32 border border-slate-900/5 dark:border-white/5 rounded-full" />
        <div className="absolute right-20 top-20 w-48 h-48 border border-slate-900/5 dark:border-white/5 rounded-full" />

        <header className="relative z-10 px-6 pt-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
            <FileText size={20} className="text-white" />
          </div>
        </header>

        <div className="relative z-10 px-8 pt-12 text-white">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-4xl font-black tracking-tight">PYQ</h1>
            <span className="px-2 py-0.5 bg-brand text-slate-900 text-[10px] font-bold rounded-full uppercase tracking-wider">
              NEW
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white/90">Mock Tests</h2>
        </div>
      </div>

      {/* Exam Selection Cards */}
      <main className="px-6 -mt-12 relative z-20 space-y-4">
        {exams.map((exam) => (
          <motion.div
            key={exam.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectExam(exam.name)}
            className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-900/5 dark:border-white/5 flex items-center justify-between cursor-pointer group shadow-xl"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-brand/10" />
                <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand/20">
                  <CheckCircle2 size={20} fill="white" className="text-brand" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">{exam.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {exam.range}
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-brand group-hover:text-slate-900 transition-all">
              <ChevronRight size={20} />
            </div>
          </motion.div>
        ))}
      </main>
    </div>
  );
};

export default PYQHome;
