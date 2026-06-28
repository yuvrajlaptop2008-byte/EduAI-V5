import React, { useState, useEffect } from"react";
import { motion, AnimatePresence } from"motion/react";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  CheckCircle2,
  ChevronRight,
  FileText,
} from"lucide-react";
import { PYQPaper } from"../types";

interface PYQExamListProps {
  exam:"JEE Main" |"NEET";
  papers: PYQPaper[];
  setPapers: (papers: PYQPaper[]) => void;
  onBack: () => void;
  onSelectPaper: (paper: PYQPaper) => void;
  onViewAnalysis: (paper: PYQPaper) => void;
}

const PYQExamList: React.FC<PYQExamListProps> = ({
  exam,
  papers,
  setPapers,
  onBack,
  onSelectPaper,
  onViewAnalysis,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [expandedYears, setExpandedYears] = useState<number[]>([]);
  const [sortOrder, setSortOrder] = useState<"desc" |"asc">("desc");

  const years = React.useMemo(
    () =>
      exam ==="JEE Main"
        ? [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019]
        : [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018],
    [exam],
  );

  // Initialize papers if they don't exist for this exam
  React.useEffect(() => {
    if (papers.length === 0) {
      const initialPapers: PYQPaper[] = years.flatMap((year) => {
        if (exam ==="JEE Main") {
          // Generate realistic JEE Main shifts
          const dates = ["24 Jan","25 Jan","27 Jan","29 Jan","30 Jan","31 Jan","1 Feb","4 Apr","5 Apr","6 Apr","8 Apr","9 Apr",
          ];
          // Pick a random subset of 4-6 dates for each year to make it look realistic
          const yearDates = [...dates]
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 3) + 4);

          return yearDates.flatMap((date, i) => [
            {
              id: `${exam}-${year}-${i}-1`,
              name: `${exam} ${year} (${date} Shift 1)`,
              year,
              exam: exam as"JEE Main" |"NEET",
              status:"Not Started" as const,
            },
            {
              id: `${exam}-${year}-${i}-2`,
              name: `${exam} ${year} (${date} Shift 2)`,
              year,
              exam: exam as"JEE Main" |"NEET",
              status:"Not Started" as const,
            },
          ]);
        } else {
          // NEET usually has one paper per year, maybe a re-exam
          return [
            {
              id: `${exam}-${year}-1`,
              name: `${exam} ${year}`,
              year,
              exam: exam as"JEE Main" |"NEET",
              status:"Not Started" as const,
            },
          ];
        }
      });
      setPapers(initialPapers);
    }
  }, [exam, papers.length, setPapers, years]);

  const toggleYear = (year: number) => {
    if (expandedYears.includes(year)) {
      setExpandedYears(expandedYears.filter((y) => y !== year));
    } else {
      setExpandedYears([...expandedYears, year]);
    }
  };

  const filteredYears =
    selectedYear ==="All" ? years : [parseInt(selectedYear)];

  const sortedYears = [...filteredYears].sort((a, b) =>
    sortOrder ==="desc" ? b - a : a - b,
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white pb-12">
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
              <div className="w-10 h-10 bg-brand/20 rounded-xl flex items-center justify-center text-brand">
                <CheckCircle2
                  size={24}
                  fill="currentColor"
                  className="text-brand"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight">{exam}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  {exam ==="JEE Main" ?"2019 - 2026" :"2002 - 2025"} |{""}
                  {papers.length} PYQ Tests
                </p>
              </div>
            </div>
          </div>
          <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-900/5 dark:border-white/5">
            <FileText
              size={20}
              className="text-slate-500 dark:text-slate-400"
            />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          <button className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-900/5 dark:border-white/5 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
            <SlidersHorizontal size={16} />
            Filter
          </button>
          {["All", ...years].map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year.toString())}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all border whitespace-nowrap ${
                selectedYear === year.toString()
                  ?"bg-brand border-brand text-slate-900 shadow-lg shadow-brand/20"
                  :"bg-slate-50 dark:bg-slate-800 border-slate-900/5 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 mt-6">
        {/* List Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Showing All PYQ mock tests ({papers.length})
          </p>
          <button
            onClick={() => setSortOrder(sortOrder ==="desc" ?"asc" :"desc")}
            className="flex items-center gap-2 text-sm font-bold text-brand"
          >
            <ArrowUpDown size={16} />
            Sort
          </button>
        </div>

        {/* Year Group List */}
        <div className="space-y-4">
          {sortedYears.map((year) => {
            const yearPapers = papers.filter((p) => p.year === year);
            const isExpanded = expandedYears.includes(year);

            return (
              <div key={year} className="space-y-3">
                <button
                  onClick={() => toggleYear(year)}
                  className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all border ${
                    isExpanded
                      ?"bg-slate-50/80 dark:bg-slate-800/80 border-brand/30"
                      :"bg-slate-50/40 dark:bg-slate-800/40 border-slate-900/5 dark:border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{year}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      ({yearPapers.length} Papers)
                    </span>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full bg-slate-100/50 dark:bg-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-transform duration-300 ${isExpanded ?"rotate-180 text-brand" :""}`}
                  >
                    <ChevronDown size={20} />
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height:"auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-3 pl-2"
                    >
                      {yearPapers.map((paper) => (
                        <motion.div
                          key={paper.id}
                          whileTap={{ scale: 0.98 }}
                          className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-900/5 dark:border-white/5 flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex-1 pr-4">
                            <h4 className="font-bold text-sm mb-1 group-hover:text-brand transition-colors">
                              {paper.name}
                            </h4>
                            <div className="flex items-center gap-2">
                              {paper.status ==="Attempted" ? (
                                <>
                                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                                    Attempted on {paper.attemptDate}
                                  </span>
                                </>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                  Not Started
                                </span>
                              )}
                            </div>
                          </div>

                          {paper.status ==="Attempted" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewAnalysis(paper);
                                }}
                                className="px-3 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-lg border border-emerald-500/20"
                              >
                                Analysis
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectPaper(paper);
                                }}
                                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-[10px] font-bold rounded-lg border border-slate-900/5 dark:border-white/5"
                              >
                                Retake
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => onSelectPaper(paper)}
                              className="px-4 py-2 bg-brand text-slate-900 text-xs font-bold rounded-lg shadow-lg shadow-brand/20 hover:bg-brand-dark transition-all"
                            >
                              Attempt Now
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default PYQExamList;
