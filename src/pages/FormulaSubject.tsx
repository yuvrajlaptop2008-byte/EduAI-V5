import React, { useMemo, useState } from"react";
import { motion, AnimatePresence } from"motion/react";
import { Link, useNavigate, useParams } from"react-router-dom";
import {
  ChevronLeft,
  Search,
  EyeOff,
  Bookmark,
  ThumbsDown,
  ThumbsUp,
  Zap,
  Beaker,
  Calculator,
  FileText,
  X,
  TrendingUp,
} from"lucide-react";
import { formulasData } from"../data/formulas";
import { getCustomFormulas, getFormulaStatuses } from "../utils/firestoreFormulasDB";
import { useUser } from "../context/UserContext";
import { useEffect } from "react";

const FormulaSubject = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useUser();
  const [customFormulas, setCustomFormulas] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<string, any>>({});

  // Normalize subjectId to match keys in formulasData
  const subjectKey = useMemo(() => {
    if (!subjectId) return"Physics";
    const normalized = subjectId.toLowerCase();
    if (normalized ==="physics") return"Physics";
    if (normalized ==="chemistry") return"Chemistry";
    if (normalized ==="maths" || normalized ==="mathematics")
      return"Mathematics";
    return"Physics";
  }, [subjectId]);

  useEffect(() => {
    if (user?.uid) {
      getCustomFormulas(user.uid).then((fetched) => {
        setCustomFormulas(fetched.filter((f) => f.subjectKey === subjectKey));
      });
      getFormulaStatuses(user.uid).then((fetched) => {
        setStatuses(fetched || {});
      });
    }
  }, [user?.uid, subjectKey]);

  const subjectData = useMemo(() => {
    const data = JSON.parse(
      JSON.stringify(formulasData[subjectKey] || { chapters: {} }),
    );

    // Merge standard formula statuses
    Object.keys(data.chapters).forEach((chapter) => {
      const topics = data.chapters[chapter].topics;
      Object.values(topics).forEach((topic: any) => {
        topic.cards.forEach((card: any) => {
          if (statuses[card.id]) {
            card.status = { ...card.status, ...statuses[card.id] };
          }
        });
      });
    });

    customFormulas.forEach((f) => {
      const cardStatus = statuses[f.id] || f.status || {
        not_seen: true,
        memorized: false,
        bookmarked: false,
        need_revision: false,
      };
      const cardWithStatus = {
        ...f,
        status: cardStatus,
      };

      if (!data.chapters[f.chapterKey]) {
        data.chapters[f.chapterKey] = { topics: {} };
      }
      if (!data.chapters[f.chapterKey].topics[f.topicKey]) {
        data.chapters[f.chapterKey].topics[f.topicKey] = {
          total_cards: 0,
          cards: [],
        };
      }
      data.chapters[f.chapterKey].topics[f.topicKey].cards.push(cardWithStatus);
      data.chapters[f.chapterKey].topics[f.topicKey].total_cards += 1;
    });

    return data;
  }, [subjectKey, customFormulas, statuses]);

  const chapters = Object.keys(subjectData.chapters);

  // Calculate stats
  let totalCards = 0;
  let notSeen = 0;
  let bookmarked = 0;
  let needRevision = 0;
  let memorized = 0;

  chapters.forEach((chapter) => {
    const topics = subjectData.chapters[chapter].topics;
    Object.values(topics).forEach((topic: any) => {
      totalCards += topic.cards.length;
      topic.cards.forEach((card: any) => {
        if (card.status.not_seen) notSeen++;
        if (card.status.bookmarked) bookmarked++;
        if (card.status.need_revision) needRevision++;
        if (card.status.memorized) memorized++;
      });
    });
  });

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const results: { chapter: string; topic: string; card: any }[] = [];

    chapters.forEach((chapter) => {
      const topics = subjectData.chapters[chapter].topics;
      Object.entries(topics).forEach(
        ([topicName, topicData]: [string, any]) => {
          topicData.cards.forEach((card: any) => {
            if (
              card.title.toLowerCase().includes(query) ||
              card.definition.toLowerCase().includes(query) ||
              card.formula.toLowerCase().includes(query)
            ) {
              results.push({ chapter, topic: topicName, card });
            }
          });
        },
      );
    });

    return results;
  }, [searchQuery, subjectData, chapters]);

  const getSubjectIcon = () => {
    if (subjectKey ==="Physics")
      return (
        <Zap
          size={24}
          className="text-slate-900 dark:text-white drop-shadow-md"
        />
      );
    if (subjectKey ==="Chemistry")
      return (
        <Beaker
          size={24}
          className="text-slate-900 dark:text-white drop-shadow-md"
        />
      );
    return (
      <Calculator
        size={24}
        className="text-slate-900 dark:text-white drop-shadow-md"
      />
    );
  };

  const getSubjectColor = () => {
    if (subjectKey ==="Physics") return"bg-orange-500 shadow-orange-500/30";
    if (subjectKey ==="Chemistry")
      return"bg-emerald-500 shadow-emerald-500/30";
    return"bg-blue-500 shadow-blue-500/30";
  };

  const getSubjectTextGlow = () => {
    if (subjectKey ==="Physics")
      return"text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]";
    if (subjectKey ==="Chemistry")
      return"text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]";
    return"text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]";
  };

  const getChapterColor = (index: number) => {
    const colors = ["from-blue-600 to-indigo-800 border-indigo-500/30 shadow-indigo-900/20","from-emerald-600 to-teal-800 border-teal-500/30 shadow-teal-900/20","from-rose-600 to-pink-800 border-pink-500/30 shadow-pink-900/20","from-violet-600 to-purple-800 border-purple-500/30 shadow-purple-900/20","from-orange-500 to-red-700 border-red-500/30 shadow-red-900/20","from-cyan-600 to-blue-800 border-blue-500/30 shadow-blue-900/20",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white pb-24 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div
        className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20 ${subjectKey ==="Physics" ?"bg-orange-500" : subjectKey ==="Chemistry" ?"bg-emerald-500" :"bg-blue-500"}`}
      />

      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-40 border-b border-slate-900/5 dark:border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 transition-all shadow-md"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-[1rem] flex items-center justify-center shadow-lg ${getSubjectColor()}`}
            >
              {getSubjectIcon()}
            </div>
            <div>
              <h1
                className={`text-2xl font-black leading-tight tracking-tight uppercase ${getSubjectTextGlow()}`}
              >
                {subjectKey}
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                {totalCards} Formula Cards
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsSearching(!isSearching)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${isSearching ?"bg-brand text-slate-900 border-brand" :"bg-slate-50/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 border"}`}
        >
          {isSearching ? <X size={20} /> : <Search size={20} />}
        </button>
      </header>

      <main className="px-6 py-6 space-y-8 relative z-10">
        {/* Search Bar */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height:"auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search
                    size={20}
                    className="text-slate-500 dark:text-slate-400"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search formulas, definitions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur text-slate-900 dark:text-white rounded-[1.25rem] py-4 pl-12 pr-12 border border-slate-900/10 dark:border-white/10 focus:outline-none focus:border-brand transition-colors font-medium placeholder:text-slate-500 dark:text-slate-400 shadow-inner"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {searchResults ? (
          <section>
            <h2 className="text-xs font-bold mb-4 text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
              Search Results ({searchResults.length})
            </h2>
            <div className="space-y-4">
              {searchResults.length > 0 ? (
                searchResults.map((result, idx) => (
                  <Link
                    key={result.card.id || idx}
                    to={`/formulas/${subjectKey}/${encodeURIComponent(result.chapter)}/${encodeURIComponent(result.topic)}`}
                    className="block bg-slate-50/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-[1.5rem] p-5 border border-slate-900/5 dark:border-white/5 hover:border-brand/50 transition-all shadow-md group hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors text-lg leading-tight">
                        {result.card.title}
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/10 border border-brand/20 px-2 py-1 rounded-md">
                        {result.chapter}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {result.card.definition}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="text-center py-16 text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-800/30 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="font-medium text-lg mb-2">No formulas found</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Try a different search term.
                  </p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            {/* Stats Overview */}
            <section>
              <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-4">
                Your Progress
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-slate-100/80 to-white/90 dark:from-slate-800/80 dark:to-slate-900/90 backdrop-blur-sm rounded-[1.5rem] p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-lg relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-slate-100/20 dark:bg-slate-700/20 rounded-full blur-xl group-hover:bg-slate-200/30 dark:hover:bg-slate-600/30 transition-colors" />
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-600">
                      <EyeOff
                        size={16}
                        className="text-slate-600 dark:text-slate-300"
                      />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Not Seen
                    </p>
                  </div>
                  <div className="flex items-baseline gap-2 relative z-10">
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {notSeen}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {((notSeen / totalCards) * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-100/40 to-indigo-50/90 dark:from-indigo-900/40 dark:to-slate-900/90 backdrop-blur-sm rounded-[1.5rem] p-5 border border-indigo-200 dark:border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)] relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/30 transition-colors" />
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                      <Bookmark size={16} className="text-indigo-400" />
                    </div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      Saved
                    </p>
                  </div>
                  <div className="flex items-baseline gap-2 relative z-10">
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {bookmarked}
                    </span>
                    <span className="text-xs font-bold text-indigo-500/50">
                      {((bookmarked / totalCards) * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-rose-100/40 to-rose-50/90 dark:from-rose-900/40 dark:to-slate-900/90 backdrop-blur-sm rounded-[1.5rem] p-5 border border-rose-200 dark:border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)] relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-500/20 rounded-full blur-xl group-hover:bg-rose-500/30 transition-colors" />
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                      <ThumbsDown size={16} className="text-rose-400 -mt-1" />
                    </div>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                      Revise
                    </p>
                  </div>
                  <div className="flex items-baseline gap-2 relative z-10">
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {needRevision}
                    </span>
                    <span className="text-xs font-bold text-rose-500/50">
                      {((needRevision / totalCards) * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-100/40 to-emerald-50/90 dark:from-emerald-900/40 dark:to-slate-900/90 backdrop-blur-sm rounded-[1.5rem] p-5 border border-emerald-200 dark:border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)] relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-500/30 transition-colors" />
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <ThumbsUp size={16} className="text-emerald-400 -mt-1" />
                    </div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                      Mastered
                    </p>
                  </div>
                  <div className="flex items-baseline gap-2 relative z-10">
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {memorized}
                    </span>
                    <span className="text-xs font-bold text-emerald-500/50">
                      {((memorized / totalCards) * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* All Chapters */}
            <section>
              <div className="flex items-center justify-between mb-4 pl-1 pr-2">
                <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Chapters
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  <TrendingUp size={12} />
                  {chapters.length} Total
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {chapters.map((chapter, index) => {
                  const topics = subjectData.chapters[chapter].topics;
                  const topicCount = Object.keys(topics).length;
                  let chapterCards = 0;
                  Object.values(topics).forEach(
                    (t: any) => (chapterCards += t.cards.length),
                  );

                  return (
                    <Link
                      key={chapter}
                      to={`/app/formulas/${subjectId}/${encodeURIComponent(chapter)}`}
                    >
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        className={`bg-gradient-to-br ${getChapterColor(index)} rounded-[2rem] p-6 h-56 flex flex-col justify-between relative overflow-hidden group border`}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50" />
                        <div className="absolute -bottom-8 -right-8 text-black/10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 pointer-events-none">
                          <FileText size={160} />
                        </div>

                        <div className="relative z-10 basis-full flex flex-col">
                          <h3 className="font-black text-xl leading-tight mb-1 inline-block drop-shadow-md">
                            {chapter}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-900 dark:text-white/70 uppercase tracking-widest drop-shadow-sm mt-auto mb-2">
                            {topicCount} Topics
                          </p>
                        </div>

                        <div className="relative z-10 flex items-center justify-between mt-auto bg-black/10 backdrop-blur-sm py-2 px-3 rounded-xl border border-slate-900/10 dark:border-white/10">
                          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white/90 font-black">
                            <FileText size={14} className="opacity-80" />
                            <span>{chapterCards}</span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/20 dark:bg-slate-900/20 flex items-center justify-center shadow-inner group-hover:bg-white group-hover:text-black transition-colors duration-300">
                            <ChevronLeft size={16} className="rotate-180" />
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default FormulaSubject;
