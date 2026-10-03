import React, { useState } from "react";
import { Question } from "../../types/exam";
import { useExamEngine } from "../../hooks/useExamEngine";
import { QuestionViewer } from "../../components/TestEngine/QuestionViewer";
import { QuestionPalette } from "../../components/TestEngine/QuestionPalette";
import { ExamTimer } from "../../components/TestEngine/ExamTimer";
import { calculateExamScore } from "../../utils/scoringEngine";

const sampleQuestions: Question[] = [
  {
    id: 1,
    subject: "Physics",
    chapter: "Electrostatics",
    topic: "Electric Dipole",
    difficulty: "Medium",
    text: "An electric dipole of moment $\\vec{p}$ is placed in a uniform electric field $\\vec{E}$. The torque acting on the dipole is given by:",
    options: [
      "$\\vec{\\tau} = \\vec{p} \\times \\vec{E}$",
      "$\\vec{\\tau} = \\vec{p} \\cdot \\vec{E}$",
      "$\\vec{\\tau} = -\\vec{p} \\times \\vec{E}$",
      "$\\vec{\\tau} = 0$"
    ],
    correctAnswer: 0,
    solution: "By definition, the torque on a dipole in a uniform electric field is $\\vec{\\tau} = \\vec{p} \\times \\vec{E}$.",
    exam: "JEE Main",
    language: "en",
    tags: ["PYQ", "2024"]
  },
  {
    id: 2,
    subject: "Mathematics",
    chapter: "Calculus",
    topic: "Definite Integrals",
    difficulty: "Medium",
    text: "Evaluate the definite integral: $$\\int_{0}^{\\pi/2} \\frac{\\sin x}{\\sin x + \\cos x} dx$$",
    options: [
      "$\\frac{\\pi}{4}$",
      "$\\frac{\\pi}{2}$",
      "$\\pi$",
      "$0$"
    ],
    correctAnswer: 0,
    solution: "Using property $\\int_0^a f(x)dx = \\int_0^a f(a-x)dx$, $2I = \\int_0^{\\pi/2} 1 dx = \\pi/2 \\implies I = \\pi/4$.",
    exam: "JEE Main",
    language: "en",
    tags: ["PYQ", "2023"]
  }
];

export const TestInterface: React.FC = () => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [scoreResult, setScoreResult] = useState<any>(null);

  const handleAutoSubmit = (answers: Record<string, string | null>) => {
    const result = calculateExamScore(answers, sampleQuestions);
    setScoreResult(result);
    setShowSubmitModal(true);
  };

  const {
    currentIndex,
    currentQuestion,
    answers,
    secondsRemaining,
    selectOption,
    clearResponse,
    toggleMarkForReview,
    navigateToQuestion,
    getQuestionStatus,
  } = useExamEngine({
    testId: "demo-test-01",
    durationMinutes: 180,
    questions: sampleQuestions,
    onAutoSubmit: handleAutoSubmit,
  });

  const handleSubmitClick = () => {
    const result = calculateExamScore(answers, sampleQuestions);
    setScoreResult(result);
    setShowSubmitModal(true);
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-slate-100 flex flex-col p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Test Engine Top Bar */}
      <header className="glass rounded-2xl px-6 py-4 mb-6 flex items-center justify-between border border-white/10">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">JEE Main Full Mock Test 01</h1>
          <p className="text-xs text-slate-400">Total 75 Questions • 300 Marks</p>
        </div>

        <div className="flex items-center gap-4">
          <ExamTimer secondsRemaining={secondsRemaining} />
          <button
            type="button"
            onClick={handleSubmitClick}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Dual-Column Testing Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Question Viewer (Left 8 cols) */}
        <div className="lg:col-span-8">
          {currentQuestion ? (
            <QuestionViewer
              questionNumber={currentIndex + 1}
              question={currentQuestion}
              selectedOption={answers[String(currentQuestion.id)] || null}
              isMarkedForReview={getQuestionStatus(currentIndex).includes("marked")}
              onSelectOption={selectOption}
              onClearResponse={clearResponse}
              onToggleMarkForReview={toggleMarkForReview}
              onSaveAndNext={() => navigateToQuestion(currentIndex + 1)}
            />
          ) : (
            <div className="glass rounded-2xl p-12 text-center text-slate-400">
              No questions found.
            </div>
          )}
        </div>

        {/* Question Palette (Right 4 cols) */}
        <div className="lg:col-span-4">
          <QuestionPalette
            totalQuestions={sampleQuestions.length}
            currentIndex={currentIndex}
            getStatus={getQuestionStatus}
            onSelectQuestion={navigateToQuestion}
          />
        </div>
      </div>

      {/* Submission Result Modal */}
      {showSubmitModal && scoreResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-6 lg:p-8 max-w-md w-full border border-white/20 shadow-2xl">
            <h2 className="text-xl font-bold text-white text-center mb-2">Test Submitted! 🎉</h2>
            <p className="text-xs text-slate-400 text-center mb-6">
              Your performance scorecard has been generated.
            </p>

            <div className="space-y-3 mb-6 font-mono text-sm">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">Total Questions:</span>
                <span className="text-white font-bold">{scoreResult.totalQuestions}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">Attempted:</span>
                <span className="text-white font-bold">{scoreResult.attempted}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">Correct Answers:</span>
                <span className="text-emerald-400 font-bold">{scoreResult.correct}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">Incorrect Answers:</span>
                <span className="text-rose-400 font-bold">{scoreResult.incorrect}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">Accuracy:</span>
                <span className="text-indigo-400 font-bold">{scoreResult.accuracy}%</span>
              </div>
              <div className="flex justify-between py-3 border-t border-white/20 text-base">
                <span className="text-white font-bold">Net Score:</span>
                <span className="text-emerald-400 font-bold text-lg">{scoreResult.netScore} / {scoreResult.maxMarks}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => (window.location.href = "/app")}
              className="w-full py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
