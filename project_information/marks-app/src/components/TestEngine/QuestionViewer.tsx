import React from "react";
import { Question } from "../../types/exam";
import { KaTeXRenderer } from "../Shared/KaTeXRenderer";

interface QuestionViewerProps {
  questionNumber: number;
  question: Question;
  selectedOption: string | null;
  isMarkedForReview: boolean;
  onSelectOption: (index: number) => void;
  onClearResponse: () => void;
  onToggleMarkForReview: () => void;
  onSaveAndNext: () => void;
}

export const QuestionViewer: React.FC<QuestionViewerProps> = ({
  questionNumber,
  question,
  selectedOption,
  isMarkedForReview,
  onSelectOption,
  onClearResponse,
  onToggleMarkForReview,
  onSaveAndNext,
}) => {
  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between min-h-[500px]">
      <div>
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white">Question {questionNumber}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {question.subject}
            </span>
            <span className="text-xs text-slate-400">
              {question.chapter} • {question.difficulty}
            </span>
          </div>
          <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
            +4 / -1 Marks
          </div>
        </div>

        {/* Question Text */}
        <div className="text-slate-100 text-base mb-6 font-normal leading-relaxed">
          <KaTeXRenderer content={question.text} />
        </div>

        {/* Diagram Attachment if present */}
        {question.diagramUrl && (
          <div className="mb-6 flex justify-center">
            <img
              src={question.diagramUrl}
              alt="Question Diagram"
              className="max-h-64 rounded-xl border border-white/10 object-contain"
            />
          </div>
        )}

        {/* Options Grid */}
        <div className="space-y-3 mb-6">
          {question.options.map((optText, idx) => {
            const isSelected = selectedOption === String(idx);
            return (
              <label
                key={idx}
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500 text-white shadow-sm"
                    : "bg-slate-800/40 border-white/5 text-slate-300 hover:bg-slate-800/80 hover:border-white/10"
                }`}
                onClick={() => onSelectOption(idx)}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "border-slate-500 text-slate-400"
                  }`}
                >
                  {optionLabels[idx]}
                </div>
                <div className="flex-1 text-sm pt-0.5">
                  <KaTeXRenderer content={optText} />
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMarkForReview}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isMarkedForReview
                ? "bg-purple-600/30 text-purple-300 border-purple-500"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            {isMarkedForReview ? "Marked for Review" : "Mark for Review & Next"}
          </button>
          <button
            type="button"
            onClick={onClearResponse}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 hover:bg-slate-700 transition-all"
          >
            Clear Response
          </button>
        </div>

        <button
          type="button"
          onClick={onSaveAndNext}
          className="px-6 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
        >
          Save & Next ➔
        </button>
      </div>
    </div>
  );
};
