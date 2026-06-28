import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import {
  X,
  Bookmark,
  ThumbsDown,
  ThumbsUp,
  List,
  Zap,
  ChevronLeft,
  BookMarked as BookMarkedIcon,
  Flag,
  MessageSquareWarning,
} from "lucide-react";
import { formulasData } from "../data/formulas";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import { addNote } from "../utils/firestoreNotesDB";
import { getCustomFormulas, getFormulaStatuses, updateFormulaStatus } from "../utils/firestoreFormulasDB";
import { useUser } from "../context/UserContext";
import { toast } from "sonner";
import { useEffect } from "react";
import { FormulaCard } from "../components/FormulaCard";

const FormulaViewer = () => {
  const navigate = useNavigate();
  const { subjectId, chapterId, topicId } = useParams();
  const { user } = useUser();

  const [customFormulas, setCustomFormulas] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<string, any>>({});
  const [loadingData, setLoadingData] = useState(true);

  const subjectKey = useMemo(() => {
    if (!subjectId) return "Physics";
    const normalized = subjectId.toLowerCase();
    if (normalized === "physics") return "Physics";
    if (normalized === "chemistry") return "Chemistry";
    if (normalized === "maths" || normalized === "mathematics")
      return "Mathematics";
    if (normalized === "biology") return "Biology";
    return "Physics";
  }, [subjectId]);

  const chapterKey = decodeURIComponent(chapterId || "");
  const topicKey = decodeURIComponent(topicId || "");

  const subjectData = formulasData[subjectKey] || { chapters: {} };

  useEffect(() => {
    if (user?.uid) {
      setLoadingData(true);
      Promise.all([
        getCustomFormulas(user.uid),
        getFormulaStatuses(user.uid)
      ]).then(([fetchedCustom, fetchedStatuses]) => {
        setCustomFormulas(fetchedCustom);
        setStatuses(fetchedStatuses || {});
        setLoadingData(false);
      }).catch(err => {
        console.error(err);
        setLoadingData(false);
      });
    }
  }, [user?.uid]);

  const cards = useMemo(() => {
    let allCards: any[] = [];

    if (chapterKey === "all") {
      Object.values(subjectData.chapters).forEach((chapter) => {
        Object.values(chapter.topics).forEach((topic) => {
          allCards = [...allCards, ...topic.cards];
        });
      });
      const subjectCustomFormulas = customFormulas.filter(
        (f) => f.subjectKey === subjectKey,
      );
      allCards = [...allCards, ...subjectCustomFormulas];
    } else if (topicKey === "all") {
      const chapterData = subjectData.chapters[chapterKey] || { topics: {} };
      Object.values(chapterData.topics).forEach((topic) => {
        allCards = [...allCards, ...topic.cards];
      });
      const chapterCustomFormulas = customFormulas.filter(
        (f) => f.subjectKey === subjectKey && f.chapterKey === chapterKey,
      );
      allCards = [...allCards, ...chapterCustomFormulas];
    } else {
      const chapterData = subjectData.chapters[chapterKey] || { topics: {} };
      const topicData = chapterData.topics[topicKey] || {
        cards: [],
        total_cards: 0,
      };
      allCards = [...topicData.cards];
      const topicCustomFormulas = customFormulas.filter(
        (f) =>
          f.subjectKey === subjectKey &&
          f.chapterKey === chapterKey &&
          f.topicKey === topicKey,
      );
      allCards = [...allCards, ...topicCustomFormulas];
    }

    return allCards.map((card) => {
      const cardStatus = statuses[card.id] || card.status || {
        not_seen: true,
        memorized: false,
        bookmarked: false,
        need_revision: false,
      };
      return { ...card, status: cardStatus };
    });
  }, [subjectData, chapterKey, topicKey, subjectKey, customFormulas, statuses]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [localCards, setLocalCards] = useState<any[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [savedToNotebook, setSavedToNotebook] = useState<
    Record<number, boolean>
  >({});
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  React.useEffect(() => {
    if (!loadingData) {
      setLocalCards(cards);
      setCurrentIndex(0);
      setIsFinished(false);
    }
  }, [cards, loadingData]);

  if (loadingData) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!localCards || localCards.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-slate-900 dark:text-slate-200 p-6">
        <h2 className="text-2xl font-bold mb-4">No Formula Cards Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-center">
          There are currently no formula cards available for {topicKey}.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="bg-brand text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-brand/90 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-slate-800 dark:text-slate-200 p-6">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
          <ThumbsUp size={48} />
        </div>
        <h2 className="text-3xl font-black mb-4 text-center">Great Job!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-center max-w-xs">
          You've reviewed all formula cards for {topicKey}.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsFinished(false);
            }}
            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            Review Again
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-brand text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-brand/90 transition-colors"
          >
            Back to Topics
          </button>
        </div>
      </div>
    );
  }

  const currentCard = localCards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < localCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const updateStatus = (
    statusKey: "memorized" | "need_revision" | "bookmarked",
  ) => {
    setLocalCards((prev) => {
      const newCards = [...prev];
      const card = { ...newCards[currentIndex] };
      card.status = { ...card.status };

      if (statusKey === "memorized") {
        card.status.memorized = true;
        card.status.need_revision = false;
        card.status.not_seen = false;
      } else if (statusKey === "need_revision") {
        card.status.need_revision = true;
        card.status.memorized = false;
        card.status.not_seen = false;
      } else if (statusKey === "bookmarked") {
        card.status.bookmarked = !card.status.bookmarked;
      }

      newCards[currentIndex] = card;

      if (user?.uid) {
        updateFormulaStatus(user.uid, card.id, card.status).catch(console.error);
      }

      return newCards;
    });
  };

  const handleThumbsUp = () => {
    updateStatus("memorized");
    handleNext();
  };

  const handleThumbsDown = () => {
    updateStatus("need_revision");
    handleNext();
  };

  const toggleBookmark = () => {
    updateStatus("bookmarked");
  };

  const handleSaveToNotebook = () => {
    if (savedToNotebook[currentIndex]) return;
    if (!user?.uid) return;

    addNote(user.uid, {
      subject: subjectKey,
      chapter: chapterKey,
      title: `Formula: ${currentCard.title}`,
      content: `Definition:\n${currentCard.definition}\n\nFormula:\n${currentCard.formula}\n\nVariables:\n${Object.entries(
        currentCard.variables,
      )
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")}`,
      tags: [],
    }).then(() => {
      setSavedToNotebook((prev) => ({ ...prev, [currentIndex]: true }));
      toast.success("Saved to your notebook!");
    }).catch((err) => {
      console.error(err);
      toast.error("Failed to save to notebook.");
    });
  };

  const handleReportSubmit = () => {
    if (!reportReason.trim()) {
      toast.error("Please select or enter a reason for reporting");
      return;
    }

    setIsSubmittingReport(true);

    // Simulate network request
    setTimeout(() => {
      setIsSubmittingReport(false);
      setShowReportModal(false);
      setReportReason("");
      toast.success("Report submitted successfully. Thank you for helping improve our community content!",
      );
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-40 border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-brand uppercase tracking-widest bg-brand/10 px-2 py-0.5 rounded">
              {subjectKey}
            </span>
            <span className="text-slate-600 dark:text-slate-300 text-xs">
              •
            </span>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide line-clamp-1">
              {chapterKey === "all" ? "All Chapters" : chapterKey} •{""}
              {topicKey === "all" ? "All Topics" : topicKey}
            </p>
          </div>
          <h1 className="text-xl font-semibold leading-tight line-clamp-1 text-slate-800 dark:text-slate-200">
            {currentCard.title}
          </h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all ml-4 shadow-sm"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </header>

      {/* Progress Bar & Badges */}
      <div className="px-5 py-3 flex items-center justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-md z-30 relative border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-1.5 rounded flex items-center gap-2 text-xs font-semibold shadow-sm">
            <List size={14} />
            <span className="tracking-widest">
              {currentIndex + 1} <span className="opacity-50">/</span>{""}
              {localCards.length}
            </span>
          </div>
          {currentCard.status.memorized && (
            <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded text-xs font-semibold border border-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Memorized
            </div>
          )}
          {currentCard.status.need_revision && (
            <div className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded text-xs font-semibold border border-rose-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              Review
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFlashcardMode(!isFlashcardMode)}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition-all shadow-sm border ${isFlashcardMode
                ? "bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
                : "bg-white text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:hover:text-white"
              }`}
          >
            Flashcard View
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1"></div>
          <button
            onClick={handleSaveToNotebook}
            disabled={savedToNotebook[currentIndex]}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all border ${savedToNotebook[currentIndex]
                ? "bg-emerald-50 border-emerald-100 text-emerald-500"
                : "bg-white border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 shadow-sm"
              }`}
            title="Save to Notebook"
          >
            <BookMarkedIcon
              size={16}
              className={savedToNotebook[currentIndex] ? "fill-current" : ""}
            />
          </button>
          <button
            onClick={toggleBookmark}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all border ${currentCard.status.bookmarked
                ? "bg-blue-50 border-blue-100 text-blue-500"
                : "bg-white border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 shadow-sm"
              }`}
            title="Bookmark"
          >
            <Bookmark
              size={16}
              className={currentCard.status.bookmarked ? "fill-current" : ""}
            />
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="w-8 h-8 rounded bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm border border-slate-200 dark:border-slate-700 ml-1"
            title="Report Issue"
          >
            <Flag size={14} />
          </button>
        </div>
      </div>

      {/* Card Content Area */}
      <main
        className="flex-1 relative overflow-y-auto px-4 py-6 pb-32 cursor-pointer"
        onClick={(e) => {
          // Ignore clicks on buttons or links
          if ((e.target as HTMLElement).closest("button, a")) return;

          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const width = rect.width;

          // Ignore clicks on the scrollbar (roughly 20px on the right edge)
          if (x > width - 20) return;

          if (x < width * 0.3) {
            handlePrev();
          } else if (x > width * 0.7) {
            handleNext();
          } else if (isFlashcardMode) {
            setIsFlipped(!isFlipped);
          }
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-md mx-auto"
          >
            {isFlashcardMode ? (
              <div
                className="w-full h-[65vh]"
                style={{ perspective: "1000px" }}
              >
                <motion.div
                  className="w-full h-full relative"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{
                    duration: 0.6,
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                >
                  {/* Front */}
                  <div
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/60 p-8 flex flex-col justify-center items-center text-center backdrop-blur-xl"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="w-full flex-1 flex flex-col items-center justify-center">
                      <div className="bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 mb-6 inline-flex">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          {subjectKey} Formula
                        </span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 dark:text-white tracking-tight leading-tight mb-8 font-serif">
                        {currentCard.title}
                      </h2>
                      <div className="w-16 h-1 bg-brand/30 rounded-full mb-8"></div>
                      <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
                        {currentCard.definition}
                      </p>
                    </div>
                    <div className="mt-auto flex flex-col items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                          <polyline points="3.29 7 12 12 20.71 7"></polyline>
                          <line x1="12" y1="22" x2="12" y2="12"></line>
                        </svg>
                      </span>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
                        Tap to reveal
                      </p>
                    </div>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/60 p-6 flex flex-col overflow-y-auto custom-scrollbar"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {/* Formula Display */}
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 shadow-md flex items-center justify-center relative overflow-hidden mb-6 shrink-0 border border-slate-200 dark:border-slate-700">
                      <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                          backgroundSize: "20px 20px",
                        }}
                      />
                      <div className="relative z-10 text-2xl md:text-3xl text-slate-900 dark:text-white font-medium drop-shadow-sm px-6 py-4">
                        <BlockMath math={currentCard.formula} />
                      </div>
                    </div>

                    {/* Variables & Units */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 mb-6 shrink-0 shadow-sm">
                      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        Parameters & Units
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(currentCard.variables).map(
                          ([symbol, meaning]) => (
                            <div
                              key={symbol}
                              className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded shrink-0 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-800 dark:text-white font-medium border border-slate-100 dark:border-slate-800">
                                  <InlineMath math={symbol} />
                                </div>
                                <span className="font-medium text-slate-600 dark:text-slate-400 text-sm">
                                  {String(meaning)}
                                </span>
                              </div>
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-100">
                                {currentCard.units[symbol] || "-"}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Important Notes */}
                    {currentCard.important_notes &&
                      currentCard.important_notes.length > 0 && (
                        <div className="mb-6 shrink-0">
                          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Zap size={14} className="text-amber-500" /> Key
                            Insights
                          </h3>
                          <ul className="space-y-2 bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100">
                            {currentCard.important_notes.map(
                              (note: string, i: number) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed"
                                >
                                  <span className="block w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                                  {note}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                    {/* Common Mistakes */}
                    {currentCard.common_mistakes &&
                      currentCard.common_mistakes.length > 0 && (
                        <div className="mb-6 shrink-0">
                          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <MessageSquareWarning
                              size={14}
                              className="text-rose-500"
                            />{""}
                            Watch Out
                          </h3>
                          <ul className="space-y-2 bg-rose-50/50 rounded-xl p-4 border border-rose-100/50">
                            {currentCard.common_mistakes.map(
                              (mistake: string, i: number) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed"
                                >
                                  <span className="block w-1.5 h-1.5 rounded bg-rose-400 mt-1.5 shrink-0 rotate-45"></span>
                                  {mistake}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                    {/* Example */}
                    {currentCard.example && (
                      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand/40"></div>
                        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 pl-2">
                          Practical Scenario
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 italic text-sm pl-2 leading-relaxed">
                          {currentCard.example}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="pt-4">
                <FormulaCard card={currentCard} subjectKey={subjectKey} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 z-50 flex justify-center pb-8">
        <div className="flex items-center gap-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-10 py-4 rounded-full shadow-lg border border-slate-200/50 dark:border-slate-800/50">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            title="Previous Card"
          >
            <ChevronLeft size={28} strokeWidth={2} />
          </button>

          <div className="w-px h-8 bg-slate-200/50"></div>

          <button
            onClick={handleThumbsDown}
            className="group flex flex-col items-center gap-2"
            title="Needs Revision"
          >
            <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-rose-100 flex items-center justify-center text-rose-400 group-hover:bg-rose-50 group-hover:text-rose-500 group-hover:scale-110 transition-all shadow-sm">
              <ThumbsDown size={28} strokeWidth={2} />
            </div>
          </button>

          <button
            onClick={handleThumbsUp}
            className="group flex flex-col items-center gap-2"
            title="Memorized"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white group-hover:bg-emerald-400 group-hover:scale-110 transition-all shadow-md shadow-emerald-500/20">
              <ThumbsUp size={28} strokeWidth={2} />
            </div>
          </button>
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReportModal(false)}
              className="fixed inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm z-50 pointer-events-auto"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl z-50 p-6 pointer-events-auto shadow-2xl"
              style={{ maxHeight: "85vh", overflowY: "auto" }}
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                  <MessageSquareWarning size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Report Solution</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Help us maintain quality community content.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  What's wrong with this formula?
                </p>

                {["Incorrect formula or definition", "Variables or units are wrong", "Other",
                ].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setReportReason(reason)}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-colors ${reportReason === reason
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : "bg-white border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
                      }`}
                  >
                    <span className="font-medium">{reason}</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${reportReason === reason
                          ? "border-rose-500 bg-rose-500"
                          : "border-slate-300 dark:border-slate-600"
                        }`}
                    >
                      {reportReason === reason && (
                        <div className="w-2 h-2 bg-white dark:bg-slate-900 rounded-full" />
                      )}
                    </div>
                  </button>
                ))}

                {reportReason === "Other" && (
                  <textarea
                    placeholder="Please specify..."
                    className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl mt-2 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all resize-none h-24"
                    onChange={(e) => setReportReason(e.target.value)}
                  />
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmittingReport || !reportReason}
                  onClick={handleReportSubmit}
                  className="flex-1 py-3.5 bg-rose-500 text-slate-900 dark:text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmittingReport ? (
                    <div className="w-5 h-5 border-2 border-slate-900/30 dark:border-white/30 border-t-white rounded-full animate-spin" />
                  ) : ("Submit Report"
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormulaViewer;
