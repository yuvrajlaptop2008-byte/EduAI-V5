import React, { useState } from"react";
import { motion, AnimatePresence } from"motion/react";
import {
  ArrowLeft,
  Flag,
  Bookmark,
  Settings,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Edit3,
  X,
  Image as ImageIcon,
} from"lucide-react";
import Scratchpad from"../../Scratchpad";

import { useUser } from "../../../context/UserContext";
import { addBookmark, removeBookmark, getBookmarks } from "../../../utils/firestoreBookmarksDB";
import { getQuestionsForChapter } from "../../../utils/questionBank";
import { useEffect } from "react";

interface PYQQuestionViewerProps {
  questionId: string;
  subject: string;
  chapter: string;
  onBack: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

const PYQQuestionViewer: React.FC<PYQQuestionViewerProps> = ({
  questionId,
  subject,
  chapter,
  onBack,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const { user } = useUser();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Admin Question Edit Modal States
  const [refreshKey, setRefreshKey] = useState(0);

  const question = React.useMemo(() => {
    const list = getQuestionsForChapter(subject, chapter);
    const q = list.find((item: any) => item.id.toString() === questionId) || list[0] || {
      id: 0,
      subject,
      chapter,
      difficulty: "Medium",
      text: "Sample question",
      options: ["A", "B", "C", "D"],
      correctAnswer: 0,
      solution: "Explanation",
    };
    
    return {
      id: q.id.toString(),
      subject: q.subject,
      topic: q.chapter,
      difficulty: q.difficulty,
      text: q.text,
      options: q.options ? q.options.map((opt: string, i: number) => ({
        id: String.fromCharCode(65 + i),
        text: opt
      })) : [],
      correctId: q.options ? String.fromCharCode(65 + q.correctAnswer) : "A",
      explanation: q.solution || "Step-by-step explanation is not available.",
      imageUrl: (q as any).imageUrl,
    };
  }, [questionId, subject, chapter, refreshKey]);

  useEffect(() => {
    setSelectedOption(null);
    setIsSubmitted(false);
  }, [questionId]);

  useEffect(() => {
    if (!user || user.uid === "demo") return;
    getBookmarks(user.uid).then((list) => {
      setIsBookmarked(list.some((b) => b.questionId.toString() === questionId.toString()));
    });
  }, [user, questionId]);

  const handleToggleBookmark = async () => {
    if (!user || user.uid === "demo") {
      alert("Please login to bookmark questions.");
      return;
    }
    try {
      const bookmarkDocId = `PYQ-${questionId}`;
      if (isBookmarked) {
        await removeBookmark(user.uid, bookmarkDocId);
        setIsBookmarked(false);
      } else {
        await addBookmark(user.uid, {
          id: bookmarkDocId,
          questionId: parseInt(questionId),
          subject,
          chapter,
          difficulty: question.difficulty || "Medium",
          text: question.text,
          options: question.options.map(o => o.text),
          correctAnswer: question.options.findIndex(o => o.id === question.correctId),
          solution: question.explanation,
          source: "PYQ"
        });
        setIsBookmarked(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-900/5 dark:border-white/5 shadow-sm relative z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="font-bold text-sm tracking-wide text-slate-900 dark:text-white">
            Q1 / 102
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleBookmark}
            className={`p-2 rounded-xl border transition-colors ${isBookmarked ? "bg-orange-500/10 border-orange-500 text-orange-500" : "text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            title="Bookmark"
          >
            <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
          <button
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Report Issue"
          >
            <Flag size={18} />
          </button>
          {/* Removed admin question edit button */}
          <button
            onClick={() => setShowScratchpad(!showScratchpad)}
            className={`p-2 rounded-xl border transition-colors ${showScratchpad ?"bg-brand/20 border-brand/50 text-brand" :"text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
            title="Scratchpad"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-30">
        <div className="max-w-3xl mx-auto w-full p-5 sm:p-8 space-y-6 pb-32">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-900/5 dark:border-white/5">
              {question.subject}
            </span>
            <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-brand text-xs font-bold uppercase tracking-wider rounded-lg border border-brand/10">
              {question.topic}
            </span>
            <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-yellow-500 text-xs font-bold uppercase tracking-wider rounded-lg border border-yellow-500/10">
              {question.difficulty}
            </span>
          </div>

          {/* Question Text */}
          <div className="prose prose-invert max-w-none">
            <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
              {question.text}
            </p>
          </div>

          {/* Question Diagram */}
          {question.imageUrl && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-slate-900/10 dark:border-white/10 bg-slate-950/40 p-2 max-h-[300px] flex items-center justify-center cursor-zoom-in group relative shadow-inner">
              <img
                src={question.imageUrl}
                alt="Question Diagram"
                className="max-h-[280px] max-w-full object-contain rounded-xl"
              />
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 pt-4">
            {question.options.map((opt) => {
              const isSelected = selectedOption === opt.id;

              let stateClass ="bg-slate-50 dark:bg-slate-800 border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-600";
              if (isSelected && !isSubmitted) {
                stateClass ="bg-brand/10 border-brand text-slate-900 dark:text-white shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-brand/50";
              } else if (isSubmitted) {
                if (opt.id === question.correctId) {
                  stateClass ="bg-emerald-500/10 border-emerald-500 text-white ring-1 ring-emerald-500/50";
                } else if (isSelected && opt.id !== question.correctId) {
                  stateClass ="bg-rose-500/10 border-rose-500 text-slate-900 dark:text-white ring-1 ring-rose-500/50 opacity-80";
                } else {
                  stateClass ="bg-slate-50 dark:bg-slate-800 border-slate-200/30 dark:border-slate-700/30 text-slate-500 dark:text-slate-400 opacity-50";
                }
              }

              return (
                <button
                  key={opt.id}
                  disabled={isSubmitted}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center gap-4 group ${stateClass}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                      isSelected && !isSubmitted
                        ?"bg-brand text-slate-900 shadow-lg shadow-brand/30"
                        : isSubmitted && opt.id === question.correctId
                          ?"bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                          : isSubmitted &&
                              isSelected &&
                              opt.id !== question.correctId
                            ?"bg-rose-500 text-slate-900 dark:text-white"
                            :"bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 group-hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {opt.id}
                  </div>
                  <div className="flex-1 text-[15px] sm:text-base font-medium">
                    {opt.text}
                  </div>
                  {isSubmitted && opt.id === question.correctId && (
                    <CheckCircle2
                      size={24}
                      className="text-emerald-500 shrink-0"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation/Solution Card */}
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-900/5 dark:border-white/5 rounded-3xl p-6 mt-6 space-y-3"
            >
              <h4 className="font-bold text-sm text-emerald-500 uppercase tracking-wider">
                Step-by-Step Explanation
              </h4>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium">
                {question.explanation}
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-900/10 dark:border-white/10 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 border border-slate-900/5 dark:border-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} /> Previous
          </button>

          {!isSubmitted ? (
            <button
              onClick={() => setIsSubmitted(true)}
              disabled={!selectedOption}
              className="flex-1 max-w-[200px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-900 bg-brand shadow-lg shadow-brand/20 hover:bg-blue-600 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              Submit Answer
            </button>
          ) : (
            <button className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-xl shadow-black/20 hover:scale-[1.02] transition-transform">
              Explanation
            </button>
          )}

          <button
            onClick={onNext}
            disabled={!hasNext}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 border border-slate-900/5 dark:border-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Scratchpad Overlay */}
      <AnimatePresence>
        {showScratchpad && (
          <Scratchpad onClose={() => setShowScratchpad(false)} />
        )}
      </AnimatePresence>

      {/* Removed admin question edit modal */}
    </div>
  );
};

export default PYQQuestionViewer;
