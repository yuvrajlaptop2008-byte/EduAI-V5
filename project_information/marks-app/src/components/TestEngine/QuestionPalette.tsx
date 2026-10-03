import React from "react";
import { QuestionPaletteStatus } from "../../types/exam";

interface QuestionPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  getStatus: (index: number) => QuestionPaletteStatus;
  onSelectQuestion: (index: number) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  totalQuestions,
  currentIndex,
  getStatus,
  onSelectQuestion,
}) => {
  const getButtonStyles = (status: QuestionPaletteStatus, isCurrent: boolean) => {
    let base = "w-9 h-9 rounded-lg font-mono text-xs font-bold transition-all relative flex items-center justify-center ";

    if (isCurrent) {
      base += "ring-2 ring-white ring-offset-2 ring-offset-slate-900 ";
    }

    switch (status) {
      case "answered":
        return base + "bg-emerald-600 text-white hover:bg-emerald-500";
      case "not_answered":
        return base + "bg-rose-600 text-white hover:bg-rose-500";
      case "marked_review":
        return base + "bg-purple-600 text-white hover:bg-purple-500";
      case "ans_marked_review":
        return base + "bg-purple-600 text-white hover:bg-purple-500 after:content-[''] after:w-2 after:h-2 after:bg-emerald-400 after:rounded-full after:absolute after:bottom-1 after:right-1";
      case "not_visited":
      default:
        return base + "bg-slate-700/60 text-slate-300 border border-slate-600/40 hover:bg-slate-700";
    }
  };

  return (
    <div className="glass rounded-2xl p-4 border border-white/10">
      <h3 className="text-sm font-semibold text-slate-200 mb-3 uppercase tracking-wider">
        Question Palette
      </h3>

      <div className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto pr-1">
        {Array.from({ length: totalQuestions }).map((_, i) => {
          const status = getStatus(i);
          const isCurrent = i === currentIndex;
          return (
            <button
              key={i}
              type="button"
              className={getButtonStyles(status, isCurrent)}
              onClick={() => onSelectQuestion(i)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Palette Legend */}
      <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-emerald-600" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-rose-600" />
          <span>Not Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-purple-600" />
          <span>Marked for Review</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-purple-600 relative after:w-1.5 after:h-1.5 after:bg-emerald-400 after:rounded-full after:absolute after:bottom-0.5 after:right-0.5" />
          <span>Answered & Marked (Evaluated)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-slate-700 border border-slate-600" />
          <span>Not Visited</span>
        </div>
      </div>
    </div>
  );
};
