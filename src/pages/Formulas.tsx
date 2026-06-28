import { Link } from"react-router-dom";
import { motion } from"motion/react";
import { Zap, Beaker, Calculator, ChevronRight, PenTool } from"lucide-react";

export default function Formulas() {
  const subjects = [
    {
      name:"Physics",
      icon: Zap,
      color:"text-orange-500",
      shadow:"shadow-orange-500/20",
      bg:"bg-orange-500/10",
      glow:"bg-orange-500/5",
    },
    {
      name:"Chemistry",
      icon: Beaker,
      color:"text-emerald-500",
      shadow:"shadow-emerald-500/20",
      bg:"bg-emerald-500/10",
      glow:"bg-emerald-500/5",
    },
    {
      name:"Mathematics",
      icon: Calculator,
      color:"text-blue-500",
      shadow:"shadow-blue-500/20",
      bg:"bg-blue-500/10",
      glow:"bg-blue-500/5",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 pb-24 relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="pt-8 pb-8 flex flex-col relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-1 select-none">
              Formula<span className="text-brand">Sheet</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide">
              Master your formulas for JEE & NEET
            </p>
          </div>
          <Link
            to="/app/formulas/create"
            className="group relative bg-brand text-slate-900 px-4 py-2.5 rounded-[1rem] font-black text-sm uppercase tracking-wider flex items-center gap-2 hover:bg-blue-600 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] hover:-translate-y-0.5"
          >
            <PenTool size={16} />
            <span className="hidden sm:inline">Create Custom</span>
            <span className="sm:hidden">Create</span>
          </Link>
        </div>
      </header>

      <div className="space-y-5 relative z-10">
        {subjects.map((subject, index) => {
          const Icon = subject.icon;
          return (
            <Link
              key={subject.name}
              to={`/app/formulas/${subject.name.toLowerCase()}`}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
                className="relative bg-slate-50/60 dark:bg-slate-800/60 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 group overflow-hidden shadow-lg"
              >
                {/* Background Hover Glow */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${subject.glow}`}
                />

                <div className="flex items-center gap-5 relative z-10">
                  <div
                    className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-inner ${subject.bg} ${subject.color} group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}
                  >
                    <Icon size={28} className="drop-shadow-md" />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight">
                      {subject.name}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase mt-0.5 group-hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                      View Chapters
                    </p>
                  </div>
                </div>

                <div
                  className={`w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-brand group-hover:border-brand transition-all duration-300 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:hover:text-white relative z-10 ${subject.shadow}`}
                >
                  <ChevronRight
                    size={20}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
