import React from"react";
import { motion } from"motion/react";
import {
  ArrowLeft,
  Calendar,
  FileText,
  ChevronRight,
  Star,
  Settings2,
  Flame,
  GraduationCap,
} from"lucide-react";

interface TestsHomeProps {
  onBack: () => void;
  onCreateTest: () => void;
  onViewPYQs: () => void;
  onSolveDPPs: () => void;
  onViewTestSeries: (id: string) => void;
  onViewClassTests: () => void;
}

const TestsHome: React.FC<TestsHomeProps> = ({
  onBack,
  onCreateTest,
  onViewPYQs,
  onSolveDPPs,
  onViewTestSeries,
  onViewClassTests,
}) => {
  const testSeries = [
    {
      id: "1",
      title: "JEE Main 2024 Full Mock Series",
      subtitle: "15 Full Length Tests with detailed analysis",
      image: "https://api.dicebear.com/9.x/glass/svg?seed=jee1",
      students: "12k+",
    },
    {
      id: "2",
      title: "Chapter-wise PYQ Series (2019-2023)",
      subtitle: "Topic-wise sorted previous year questions",
      image: "https://api.dicebear.com/9.x/glass/svg?seed=pyq1",
      students: "45k+",
    },
    {
      id: "3",
      title: "Advanced Level Problem Set",
      subtitle: "Challenging problems for JEE Advanced prep",
      image: "https://api.dicebear.com/9.x/glass/svg?seed=adv1",
      students: "8k+",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white pb-24">
      {/* Top App Bar */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">MARKS Tests</h1>
            <div className="w-5 h-5 bg-brand rounded-md flex items-center justify-center">
              <Star
                size={12}
                fill="white"
                className="text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-6 mt-4">
        {/* Primary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: PYQ Mock Tests */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={onViewPYQs}
            className="p-6 rounded-[2rem] border border-indigo-500/30 bg-gradient-to-br from-slate-100/80 to-indigo-50/40 dark:from-slate-800/80 dark:to-indigo-950/40 relative overflow-hidden cursor-pointer group shadow-xl shadow-indigo-900/20 flex flex-col justify-between"
          >
            {/* Glowing background effects */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors duration-500" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="pr-6">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                    PYQ Mock Tests
                  </h2>
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-black rounded-lg uppercase tracking-widest shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                    NEW
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  Real previous year questions in exam-simulated environment.
                </p>

                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex items-center -space-x-2">
                    <img
                      src="https://api.dicebear.com/9.x/adventurer/svg?seed=p1"
                      className="w-6 h-6 rounded-full border-2 border-slate-100 dark:border-slate-800"
                      alt="user"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      src="https://api.dicebear.com/9.x/adventurer/svg?seed=p2"
                      className="w-6 h-6 rounded-full border-2 border-slate-100 dark:border-slate-800"
                      alt="user"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      src="https://api.dicebear.com/9.x/adventurer/svg?seed=p3"
                      className="w-6 h-6 rounded-full border-2 border-slate-100 dark:border-slate-800"
                      alt="user"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-xs font-medium text-indigo-400">
                    Full exam simulation
                  </span>
                </div>
              </div>

              <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                <FileText size={28} />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Create Custom Test */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={onCreateTest}
            className="p-6 rounded-[2rem] border border-emerald-500/30 bg-gradient-to-br from-emerald-50/80 to-emerald-100/40 dark:from-slate-800/80 dark:to-emerald-950/40 relative overflow-hidden cursor-pointer group shadow-xl shadow-emerald-900/20 flex flex-col justify-between"
          >
            {/* Glowing background effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="pr-6">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                    Create Custom Test
                  </h2>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black rounded-lg uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                    UPDATED
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  Select subjects and set your own timer. Build practice sessions.
                </p>

                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex items-center -space-x-2">
                    <img
                      src="https://api.dicebear.com/9.x/adventurer/svg?seed=u1"
                      className="w-6 h-6 rounded-full border-2 border-slate-100 dark:border-slate-800"
                      alt="user"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      src="https://api.dicebear.com/9.x/adventurer/svg?seed=u2"
                      className="w-6 h-6 rounded-full border-2 border-slate-100 dark:border-slate-800"
                      alt="user"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      src="https://api.dicebear.com/9.x/adventurer/svg?seed=u3"
                      className="w-6 h-6 rounded-full border-2 border-slate-100 dark:border-slate-800"
                      alt="user"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-xs font-medium text-emerald-400">
                    Customizable practice
                  </span>
                </div>
              </div>

              <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Settings2 size={28} />
              </div>
            </div>
          </motion.div>

          {/* Card 3: Solve DPPs */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={onSolveDPPs}
            className="p-6 rounded-[2rem] border border-orange-500/30 bg-gradient-to-br from-orange-50/80 to-orange-100/40 dark:from-slate-800/80 dark:to-orange-950/40 relative overflow-hidden cursor-pointer group shadow-xl shadow-orange-900/20 flex flex-col justify-between"
          >
            {/* Glowing background effects */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 group-hover:bg-orange-500/20 transition-colors duration-500" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="pr-6">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-400 transition-colors">
                    Solve DPPs
                  </h2>
                  <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black rounded-lg uppercase tracking-widest shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                    HOT
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  Structured Daily Practice. 700+ curated problems by expert educators.
                </p>

                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex items-center -space-x-2">
                    <img
                      src="https://api.dicebear.com/9.x/adventurer/svg?seed=d1"
                      className="w-6 h-6 rounded-full border-2 border-slate-100 dark:border-slate-800"
                      alt="user"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      src="https://api.dicebear.com/9.x/adventurer/svg?seed=d2"
                      className="w-6 h-6 rounded-full border-2 border-slate-100 dark:border-slate-800"
                      alt="user"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      src="https://api.dicebear.com/9.x/adventurer/svg?seed=d3"
                      className="w-6 h-6 rounded-full border-2 border-slate-100 dark:border-slate-800"
                      alt="user"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-xs font-medium text-orange-400">
                    Structured Daily Practice
                  </span>
                </div>
              </div>

              <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-orange-500/30 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                <Flame size={28} />
              </div>
            </div>
          </motion.div>

          {/* Card 4: Class Tests */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={onViewClassTests}
            className="p-6 rounded-[2rem] border border-purple-500/30 bg-gradient-to-br from-purple-50/80 to-purple-100/40 dark:from-slate-800/80 dark:to-purple-950/40 relative overflow-hidden cursor-pointer group shadow-xl shadow-purple-900/20 flex flex-col justify-between"
          >
            {/* Glowing background effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="pr-6">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-400 transition-colors">
                    Class Tests
                  </h2>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-black rounded-lg uppercase tracking-widest shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                    ASSIGNED
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  Attempt structured tests officially assigned by your teachers.
                </p>

                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex items-center -space-x-2">
                    <img
                      src="https://api.dicebear.com/9.x/adventurer/svg?seed=c1"
                      className="w-6 h-6 rounded-full border-2 border-slate-100 dark:border-slate-800"
                      alt="user"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      src="https://api.dicebear.com/9.x/adventurer/svg?seed=c2"
                      className="w-6 h-6 rounded-full border-2 border-slate-100 dark:border-slate-800"
                      alt="user"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      src="https://api.dicebear.com/9.x/adventurer/svg?seed=c3"
                      className="w-6 h-6 rounded-full border-2 border-slate-100 dark:border-slate-800"
                      alt="user"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-xs font-medium text-purple-400">
                    Assigned by teachers
                  </span>
                </div>
              </div>

              <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-purple-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <GraduationCap size={28} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section: Test Series */}
        <div className="pt-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="bg-brand/10 px-3 py-1 rounded-full border border-brand/20 inline-flex mb-3">
                <span className="text-[10px] font-bold text-brand uppercase tracking-widest">
                  Premium Selection
                </span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
                Elite Test Series
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Curated by top-tier educators for maximum yield.
              </p>
            </div>
            <div className="hidden sm:block">
              <button className="text-brand text-xs font-bold uppercase tracking-wider hover:text-blue-400 transition-colors bg-brand/5 px-4 py-2 rounded-full border border-brand/20 hover:bg-brand/10">
                View All
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar -mx-6 px-6 snap-x">
            {testSeries.map((series) => (
              <motion.div
                key={series.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewTestSeries(series.id)}
                className="min-w-[320px] sm:min-w-[360px] bg-slate-50/40 dark:bg-slate-800/40 backdrop-blur-md rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700/50 overflow-hidden cursor-pointer group hover:bg-slate-50/80 dark:hover:bg-slate-800/80 hover:border-slate-600 transition-all duration-300 shadow-xl snap-start flex flex-col"
              >
                <div className="h-44 relative overflow-hidden">
                  <div className="absolute inset-0 bg-brand/20 group-hover:bg-transparent transition-colors z-10 mix-blend-overlay"></div>
                  <img
                    src={series.image}
                    alt={series.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-100 dark:from-slate-900 via-slate-100/40 dark:via-slate-900/40 to-transparent z-10" />
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1.5 bg-white/10 dark:bg-slate-900/10 backdrop-blur-md rounded-full text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest border border-slate-900/20 dark:border-white/20 shadow-sm">
                      {series.students} Active
                    </span>
                  </div>
                </div>
                <div className="p-6 relative z-20 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-2 leading-snug group-hover:text-brand transition-colors limit-line-2">
                      {series.title}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed line-clamp-2">
                      {series.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Full Access
                    </span>
                    <button className="w-10 h-10 rounded-full bg-slate-100/50 dark:bg-slate-700/50 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-brand group-hover:text-slate-900 group-hover:shadow-lg group-hover:shadow-brand/20 transition-all duration-300">
                      <ChevronRight
                        size={18}
                        strokeWidth={2.5}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestsHome;
