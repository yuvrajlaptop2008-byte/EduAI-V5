import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Menu,
  Play,
  PenTool,
} from "lucide-react";
import { SubjectType, Question } from "./types";
import Scratchpad from "../Scratchpad";
import { syllabusData } from "../../data/syllabus";
import { getQuestionsForChapter } from "../../utils/questionBank";

interface TestInterfaceProps {
  testData: any;
  onExit: () => void;
  onSubmit: (results: any) => void;
  isCountdownActive?: boolean;
}

const TestInterface: React.FC<TestInterfaceProps> = ({
  testData,
  onExit,
  onSubmit,
  isCountdownActive = false,
}) => {
  const defaultSubjects =
    testData.exam ==="NEET"
      ? ["Physics","Chemistry","Biology"]
      : ["Physics","Chemistry","Mathematics"];
  const subjects = testData.subjects || defaultSubjects;
  const duration = testData.duration || (testData.exam ==="NEET" ? 200 : 180);
  const questionCount =
    testData.questionCount || (testData.exam ==="NEET" ? 200 : 90);

  const [currentSubject, setCurrentSubject] = useState<SubjectType>(
    subjects[0],
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);
  const [showNavModal, setShowNavModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);

  // Dynamic questions generation using questionBank
  const questions: Question[] = React.useMemo(() => {
    // Teacher-assigned exam-group tests carry their exact picked questions —
    // skip chapter-based generation entirely and use them as-is.
    if (testData.explicitQuestions && Array.isArray(testData.explicitQuestions)) {
      return testData.explicitQuestions as Question[];
    }

    const qCount = questionCount;
    const subCount = subjects.length;
    const qPerSub = Math.floor(qCount / subCount);
    const remainder = qCount % subCount;

    return subjects.flatMap((sub: SubjectType, subIdx: number) => {
      const count = qPerSub + (subIdx < remainder ? 1 : 0);
      
      // Determine which chapters to fetch questions from
      let subChapters = testData.chapters || [];
      if (subChapters.length === 0) {
        // Fallback to first few chapters of this subject in syllabusData
        const exam = testData.exam || "JEE Main";
        const examData = (syllabusData as any)[exam] || (syllabusData as any)["JEE Main"];
        const syllabusChapters = examData[sub] || [];
        subChapters = syllabusChapters.slice(0, 3);
      }
      if (subChapters.length === 0) {
        subChapters = ["General Concepts"];
      }

      // Collect real questions from all selected chapters
      let realQs: any[] = [];
      subChapters.forEach((ch: string) => {
        try {
          let chName = ch;
          if (ch.includes("-")) {
            const exam = testData.exam || "JEE Main";
            const examData = (syllabusData as any)[exam] || (syllabusData as any)["JEE Main"];
            const chaptersList = examData[sub] || [];
            const parts = ch.split("-");
            const index = parseInt(parts[parts.length - 1]) - 1;
            if (index >= 0 && index < chaptersList.length) {
              chName = chaptersList[index];
            }
          }
          const qs = getQuestionsForChapter(sub, chName);
          realQs = [...realQs, ...qs];
        } catch (e) {
          console.error(e);
        }
      });

      if (realQs.length === 0) {
        realQs = getQuestionsForChapter(sub, "General Concepts");
      }

      return Array.from({ length: count }).map((_, i) => {
        const sourceQ = realQs[i % realQs.length];
        
        let year = testData.year;
        if (!year) {
          if (
            testData.yearFilter === "Specific" &&
            testData.specificYears?.length > 0
          ) {
            year =
              testData.specificYears[
                Math.floor(Math.random() * testData.specificYears.length)
              ];
          } else if (testData.yearFilter === "Last 5 Years") {
            year = 2020 + Math.floor(Math.random() * 6);
          } else {
            year = 2010 + Math.floor(Math.random() * 16);
          }
        }

        const source =
          testData.isPYQ || testData.year
            ? "PYQ"
            : testData.source || "Practice";

        const text = `[${source} ${year}] ${sourceQ.text}`;
        const isNumerical = sourceQ.type ? sourceQ.type === "Numerical" : (i % 5 === 0);

        return {
          id: `${sub}-${i}`,
          type: isNumerical ? ("Numerical" as const) : ("MCQ" as const),
          subject: sub,
          text: text,
          options: isNumerical ? undefined : sourceQ.options,
          correctAnswer: isNumerical 
            ? (sourceQ.type ? sourceQ.correctAnswer : (sourceQ.correctAnswer === 2 ? 3 : 42))
            : (sourceQ.options && sourceQ.options[sourceQ.correctAnswer] !== undefined ? sourceQ.options[sourceQ.correctAnswer] : (sourceQ.options ? sourceQ.options[0] : "")),
          explanation: sourceQ.solution || "Step by step explanation goes here...",
          points: 4,
        };
      });
    });
  }, [testData, questionCount, subjects]);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (isPaused || isCountdownActive || showSubmitModal || showExitModal) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, isCountdownActive, showSubmitModal, showExitModal]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h +":" :""}${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  };

  const handleAnswer = (answer: string | number) => {
    setAnswers({ ...answers, [currentQuestion.id]: answer });
  };

  const toggleMarkForReview = () => {
    if (markedForReview.includes(currentQuestion.id)) {
      setMarkedForReview(
        markedForReview.filter((id) => id !== currentQuestion.id),
      );
    } else {
      setMarkedForReview([...markedForReview, currentQuestion.id]);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentSubject(questions[currentQuestionIndex + 1].subject);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentSubject(questions[currentQuestionIndex - 1].subject);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      answers,
      markedForReview,
      timeSpent: duration * 60 - timeLeft,
      questions,
    });
  };

  const getQuestionStatus = (index: number) => {
    const qId = questions[index].id;
    if (index === currentQuestionIndex) return"current";
    if (markedForReview.includes(qId)) return"marked";
    if (answers[qId] !== undefined) return"answered";
    return"unvisited";
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col z-50 overflow-hidden">
      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-bottom border-slate-900/5 dark:border-white/5 bg-white/5 dark:bg-slate-900/50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowExitModal(true)}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold truncate max-w-[120px]">
              {testData.name}
            </h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                Live Test
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScratchpad(!showScratchpad)}
            className={`p-2 rounded-xl border transition-colors ${showScratchpad ?"bg-brand/20 border-brand/50 text-brand" :"bg-slate-50 dark:bg-slate-800 border-slate-900/5 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-brand"}`}
            title="Scratchpad"
          >
            <PenTool size={18} />
          </button>
          <button
            onClick={() => setIsPaused(true)}
            className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-900/5 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-brand transition-colors"
          >
            <Clock size={18} />
          </button>
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-900/5 dark:border-white/5">
            <span className="font-mono font-bold text-lg tabular-nums text-brand">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-6 py-2 bg-brand text-slate-900 font-bold rounded-xl shadow-lg shadow-brand/20"
        >
          Submit
        </button>
      </header>

      {/* Scratchpad Overlay */}
      <AnimatePresence>
        {showScratchpad && (
          <Scratchpad onClose={() => setShowScratchpad(false)} />
        )}
      </AnimatePresence>

      {/* Subject Tabs */}
      <div className="flex px-4 bg-white/3 dark:bg-slate-900/30 border-b border-slate-900/5 dark:border-white/5 overflow-x-auto no-scrollbar">
        {subjects.map((sub: SubjectType) => (
          <button
            key={sub}
            onClick={() => {
              const firstQIndex = questions.findIndex((q) => q.subject === sub);
              setCurrentQuestionIndex(firstQIndex);
              setCurrentSubject(sub);
            }}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all relative ${
              currentSubject === sub
                ?"text-brand"
                :"text-slate-500 dark:text-slate-400"
            }`}
          >
            {sub}
            {currentSubject === sub && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-brand rounded-t-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Question Navigation Bar */}
      <div className="px-4 py-3 bg-white/20 dark:bg-slate-900/20 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-900/5 dark:border-white/5">
        {questions.map((q, i) => {
          const status = getQuestionStatus(i);
          return (
            <button
              key={q.id}
              onClick={() => {
                setCurrentQuestionIndex(i);
                setCurrentSubject(q.subject);
              }}
              className={`min-w-[40px] h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all border ${
                status ==="current"
                  ?"bg-brand border-brand text-slate-900 scale-110"
                  : status ==="marked"
                    ?"bg-orange-500 border-orange-500 text-white"
                    : status ==="answered"
                      ?"bg-emerald-500 border-emerald-500 text-white"
                      :"bg-slate-50 dark:bg-slate-800 border-slate-900/5 dark:border-white/5 text-slate-500 dark:text-slate-400"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Question Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-brand">
              Q{currentQuestionIndex + 1}
            </span>
            <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded uppercase tracking-wider">
              {currentQuestion.type}
            </span>
          </div>
          <div className="text-sm font-bold text-emerald-500">
            +{currentQuestion.points} Marks
          </div>
        </div>

        <div className="text-lg leading-relaxed text-slate-700 dark:text-slate-200">
          {currentQuestion.text}
        </div>

        {/* Question Image Attachment */}
        {currentQuestion.imageUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-slate-900/10 dark:border-white/10 bg-slate-955/40 p-2 max-h-[300px] flex items-center justify-center cursor-zoom-in group relative shadow-inner">
            <img
              src={currentQuestion.imageUrl}
              alt="Question Diagram"
              className="max-h-[280px] max-w-full object-contain rounded-xl"
            />
          </div>
        )}

        {/* Answer Input */}
        <div className="space-y-4 pt-4">
          {currentQuestion.type ==="MCQ" ? (
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options?.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(option)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                    answers[currentQuestion.id] === option
                      ?"bg-brand/10 border-brand shadow-lg shadow-brand/10"
                      :"bg-slate-50/40 dark:bg-slate-800/40 border-slate-900/5 dark:border-white/5 hover:border-slate-900/10 dark:hover:border-white/10"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                      answers[currentQuestion.id] === option
                        ?"bg-brand border-brand text-slate-900"
                        :"border-slate-600 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span
                    className={
                      answers[currentQuestion.id] === option
                        ?"text-slate-900 dark:text-white font-bold"
                        :"text-slate-500 dark:text-slate-400"
                    }
                  >
                    {option}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Enter your answer
              </p>
              <input
                type="number"
                placeholder="0.00"
                value={answers[currentQuestion.id] ||""}
                onChange={(e) => handleAnswer(e.target.value)}
                className="w-full p-6 bg-slate-50/40 dark:bg-slate-800/40 border-2 border-slate-900/5 dark:border-white/5 rounded-3xl text-2xl font-bold text-brand focus:border-brand outline-none transition-all"
              />
            </div>
          )}
        </div>
      </main>

      {/* Action Buttons */}
      <footer className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-900/5 dark:border-white/5">
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => {
              const newAnswers = { ...answers };
              delete newAnswers[currentQuestion.id];
              setAnswers(newAnswers);
            }}
            className="flex-1 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 border border-slate-900/5 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Clear
          </button>
          <button
            onClick={toggleMarkForReview}
            className={`flex-1 py-3 text-sm font-bold rounded-xl border transition-all ${
              markedForReview.includes(currentQuestion.id)
                ?"bg-orange-500/10 border-orange-500 text-orange-500"
                :"text-slate-500 dark:text-slate-400 border-slate-900/5 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {markedForReview.includes(currentQuestion.id)
              ?"Marked"
              :"Mark for Review"}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${
              currentQuestionIndex === 0
                ?"opacity-30 cursor-not-allowed"
                :"bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            }`}
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          <button
            onClick={handleNext}
            className="flex-[2] py-4 bg-brand text-slate-900 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-xl shadow-brand/30"
          >
            {currentQuestionIndex === questions.length - 1
              ?"Finish Section"
              :"Save & Next"}
            <ChevronRight size={20} />
          </button>
        </div>

        <button
          onClick={() => setShowNavModal(true)}
          className="w-full mt-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2"
        >
          <LayoutGrid size={14} />
          View All Questions
        </button>
      </footer>

      {/* Navigation Modal */}
      <AnimatePresence>
        {showNavModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] p-6 flex items-end"
          >
            <motion.div
              initial={{ y:"100%" }}
              animate={{ y: 0 }}
              exit={{ y:"100%" }}
              className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Question Paper</h3>
                <button
                  onClick={() => setShowNavModal(false)}
                  className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                {subjects.map((sub: SubjectType) => (
                  <div key={sub} className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {sub}
                    </h4>
                    <div className="grid grid-cols-5 gap-3">
                      {questions
                        .filter((q) => q.subject === sub)
                        .map((q) => {
                          const index = questions.findIndex(
                            (item) => item.id === q.id,
                          );
                          const status = getQuestionStatus(index);
                          return (
                            <button
                              key={q.id}
                              onClick={() => {
                                setCurrentQuestionIndex(index);
                                setCurrentSubject(sub);
                                setShowNavModal(false);
                              }}
                              className={`h-12 rounded-xl flex items-center justify-center text-sm font-bold border transition-all ${
                                status ==="current"
                                  ?"bg-brand border-brand text-slate-900"
                                  : status ==="marked"
                                    ?"bg-orange-500 border-orange-500 text-white"
                                    : status ==="answered"
                                      ?"bg-emerald-500 border-emerald-500 text-white"
                                      :"bg-slate-50 dark:bg-slate-800 border-slate-900/5 dark:border-white/5 text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              {index + 1}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-emerald-500 rounded-md" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    Answered
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-orange-500 rounded-md" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    Marked
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-slate-50 dark:bg-slate-800 border border-slate-900/5 dark:border-white/5 rounded-md" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    Unvisited
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-brand rounded-md" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    Current
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Modal */}
      <AnimatePresence>
        {isPaused && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[80] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 text-center border border-slate-900/5 dark:border-white/5"
            >
              <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center text-brand mx-auto mb-6">
                <Clock size={40} className="animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Test Paused</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                Take a breath. Your progress is saved. The timer is stopped.
              </p>
              <button
                onClick={() => setIsPaused(false)}
                className="w-full py-4 bg-brand text-slate-900 font-bold rounded-2xl shadow-xl shadow-brand/30 flex items-center justify-center gap-2"
              >
                <Play size={20} fill="white" />
                Resume Test
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exit Modal */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 text-center"
            >
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-6">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Pause and Exit?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                Are you sure you want to pause and exit the test? Your progress will be saved.
              </p>
              <div className="space-y-3">
                <button
                  onClick={onExit}
                  className="w-full py-4 bg-amber-500 text-white font-bold rounded-2xl shadow-xl shadow-amber-500/20"
                >
                  Confirm Exit
                </button>
                <button
                  onClick={() => setShowExitModal(false)}
                  className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl"
                >
                  Go Back to Test
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 text-center"
            >
              <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center text-brand mx-auto mb-6">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Submit Test?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                You have answered {Object.keys(answers).length} out of{""}
                {questions.length} questions. Are you sure you want to submit?
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  className="w-full py-4 bg-red-500 text-white font-bold rounded-2xl shadow-xl shadow-red-500/20"
                >
                  Submit Test
                </button>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl"
                >
                  Go Back to Test
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestInterface;
