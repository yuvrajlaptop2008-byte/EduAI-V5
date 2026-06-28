import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Filter,
  MoreVertical,
  PlayCircle,
  BookOpen,
  ArrowUpDown,
  SlidersHorizontal,
  Bookmark,
  Video,
  ChevronRight,
  X,
  Asterisk,
  List,
  CheckSquare,
  Calendar,
  Minus,
  Calculator,
  Check,
  AlertCircle,
  History,
  ListOrdered,
} from "lucide-react";
import { getQuestionsForChapter } from "../../../utils/questionBank";
import { useUser } from "../../../context/UserContext";

interface PYQChapterViewProps {
  exam: "JEE Main" | "NEET";
  subject: string;
  chapter: string;
  onBack: () => void;
  onSelectQuestion: (questionId: string) => void;
}

const PYQChapterView: React.FC<PYQChapterViewProps> = ({
  exam,
  subject,
  chapter,
  onBack,
  onSelectQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<"All PYQs" | "Topic-Wise PYQs">(
    "All PYQs",
  );

  const { getQuestionAttemptsToday } = useUser();

  // Filter States
  const [hideOutOfSyllabus, setHideOutOfSyllabus] = useState(false);
  const [showOnlyOutOfSyllabus, setShowOnlyOutOfSyllabus] = useState(false);
  const [pyqSortBy, setPyqSortBy] = useState("Default");
  const [pyqDifficulty, setPyqDifficulty] = useState<string[]>([]);
  const [pyqQuestionType, setPyqQuestionType] = useState<string[]>([]);
  const [pyqEvaluationStatus, setPyqEvaluationStatus] = useState<string[]>([]);
  const [pyqYears, setPyqYears] = useState<string[]>([]);
  const [pyqExam, setPyqExam] = useState("All");

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Filter Modal UI states
  const [showPyqFilterModal, setShowPyqFilterModal] = useState(false);
  const [activePyqFilterTab, setActivePyqFilterTab] = useState<
    "Sort By" | "Exam" | "Difficulty" | "Question Type" | "Evaluation Status" | "Years"
  >("Sort By");

  // Temporary/Draft values inside modal (applied on click "Show Results")
  const [tempPyqSortBy, setTempPyqSortBy] = useState(pyqSortBy);
  const [tempPyqExam, setTempPyqExam] = useState(pyqExam);
  const [tempHideOutOfSyllabus, setTempHideOutOfSyllabus] = useState(hideOutOfSyllabus);
  const [tempShowOnlyOutOfSyllabus, setTempShowOnlyOutOfSyllabus] = useState(showOnlyOutOfSyllabus);
  const [tempPyqDifficulty, setTempPyqDifficulty] = useState<string[]>([]);
  const [tempPyqQuestionType, setTempPyqQuestionType] = useState<string[]>([]);
  const [tempPyqEvaluationStatus, setTempPyqEvaluationStatus] = useState<string[]>([]);
  const [tempPyqYears, setTempPyqYears] = useState<string[]>([]);

  // Load real questions from the question bank for the active chapter
  const chapterQuestions = useMemo(() => {
    const rawQuestions = getQuestionsForChapter(subject, chapter);
    return rawQuestions.map((q, i) => {
      const types = ["Single Correct", "Multiple Correct", "Numerical"];
      const qType = (q as any).type || types[q.id % 3];

      const attemptsToday = getQuestionAttemptsToday(q.id.toString());
      let status: "Correct" | "Wrong" | "Unattempted" = "Unattempted";
      if (attemptsToday && attemptsToday.length > 0) {
        status = attemptsToday[attemptsToday.length - 1] ? "Correct" : "Wrong";
      }

      const yearVal = (q as any).year || (2026 - (q.id % 6));
      const yearStr = typeof yearVal === "number" ? `${exam} ${yearVal}` : yearVal;
      const isOutOfSyllabus = q.id % 5 === 0;

      return {
        ...q,
        id: q.id.toString(),
        qNumber: `Q${i + 1}`,
        type: qType,
        status,
        year: yearStr,
        exam: (q as any).exam || exam,
        isOutOfSyllabus,
      };
    });
  }, [subject, chapter, exam, getQuestionAttemptsToday]);

  // Comprehensive filter logic for PYQs
  const filteredQuestions = useMemo(() => {
    let result = [...chapterQuestions];

    if (hideOutOfSyllabus) {
      result = result.filter((q) => !q.isOutOfSyllabus);
    }
    if (showOnlyOutOfSyllabus) {
      result = result.filter((q) => q.isOutOfSyllabus);
    }

    if (pyqDifficulty.length > 0) {
      result = result.filter((q) => {
        const diffMap = q.difficulty === "Hard" ? "Tough" : q.difficulty;
        return pyqDifficulty.includes(diffMap);
      });
    }

    if (pyqQuestionType.length > 0) {
      result = result.filter((q) => pyqQuestionType.includes(q.type));
    }

    if (pyqEvaluationStatus.length > 0) {
      result = result.filter((q) => {
        const statusMap = q.status === "Wrong" ? "Incorrect" : q.status;
        return pyqEvaluationStatus.includes(statusMap) || pyqEvaluationStatus.includes(q.status);
      });
    }

    if (pyqYears.length > 0) {
      result = result.filter((q) => pyqYears.includes(q.year));
    }

    if (pyqExam !== "All") {
      result = result.filter((q) => q.exam === pyqExam);
    }

    if (activeTab === "Topic-Wise PYQs" && selectedTopic) {
      if (selectedTopic === "Core Concepts") {
        result = result.filter((q) => Number(q.id) % 2 === 0);
      } else if (selectedTopic === "Advanced Applications") {
        result = result.filter((q) => Number(q.id) % 2 !== 0);
      }
    }

    if (pyqSortBy === "Latest to Oldest") {
      result.sort((a, b) => b.year.localeCompare(a.year));
    } else if (pyqSortBy === "Oldest to Latest") {
      result.sort((a, b) => a.year.localeCompare(b.year));
    }

    return result;
  }, [
    chapterQuestions,
    hideOutOfSyllabus,
    showOnlyOutOfSyllabus,
    pyqDifficulty,
    pyqQuestionType,
    pyqEvaluationStatus,
    pyqYears,
    pyqExam,
    activeTab,
    selectedTopic,
    pyqSortBy,
  ]);

  const openFilterModal = () => {
    setTempPyqSortBy(pyqSortBy);
    setTempPyqExam(pyqExam);
    setTempHideOutOfSyllabus(hideOutOfSyllabus);
    setTempShowOnlyOutOfSyllabus(showOnlyOutOfSyllabus);
    setTempPyqDifficulty(pyqDifficulty);
    setTempPyqQuestionType(pyqQuestionType);
    setTempPyqEvaluationStatus(pyqEvaluationStatus);
    setTempPyqYears(pyqYears);
    setShowPyqFilterModal(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white pb-24">
      {/* Header */}
      <header className="px-5 pt-8 pb-4 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg z-40 border-b border-slate-900/5 dark:border-white/5 shadow-sm">
        <div className="flex items-start gap-4 mb-5">
          <button
            onClick={onBack}
            className="p-2 -ml-2 -mt-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold leading-tight mb-1">{chapter}</h1>
            <p className="text-xs text-brand font-bold uppercase tracking-wider flex items-center gap-2">
              {exam}{""}
              <span className="text-slate-500 dark:text-slate-400">»</span> {chapterQuestions.length}
              PYQs <span className="text-slate-500 dark:text-slate-400">|</span>{""}
              2 Topics
            </p>
          </div>
        </div>

        {/* Top Tabs */}
        <div className="flex gap-4 border-b border-slate-100/80 dark:border-slate-800/80 -px-5">
          {["All PYQs", "Topic-Wise PYQs"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab as any);
                setSelectedTopic(null);
              }}
              className={`pb-3 text-sm font-bold transition-all relative outline-none ${
                activeTab === tab
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="chapterTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-brand rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="flex items-center justify-between pt-4 gap-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 w-full">
            <button
              onClick={openFilterModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-900/5 dark:border-white/5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap shrink-0 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Filter size={14} /> Filter & Sorting
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0 self-center" />
            <button
              onClick={() => {
                setHideOutOfSyllabus(!hideOutOfSyllabus);
                if (!hideOutOfSyllabus) setShowOnlyOutOfSyllabus(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors border ${
                hideOutOfSyllabus
                  ? "bg-brand text-slate-900 border-brand/20 shadow-md shadow-brand/20"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-900/5 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-855"
              }`}
            >
              As per syllabus
            </button>
            <button
              onClick={() => {
                setShowOnlyOutOfSyllabus(!showOnlyOutOfSyllabus);
                if (!showOnlyOutOfSyllabus) setHideOutOfSyllabus(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors border ${
                showOnlyOutOfSyllabus
                  ? "bg-brand text-slate-900 border-brand/20 shadow-md shadow-brand/20"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-900/5 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-855"
              }`}
            >
              Removed
            </button>
            <button
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-900/5 dark:border-white/5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap shrink-0 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Reduced
            </button>
          </div>
        </div>
      </header>

      {/* Main List / Topic Selector */}
      <main className="p-4 space-y-4">
        {activeTab === "Topic-Wise PYQs" && !selectedTopic ? (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedTopic("Core Concepts")}
              className="w-full bg-slate-50/40 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-900/5 dark:border-white/5 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-855 transition-colors text-left"
            >
              <div>
                <div className="font-bold text-lg mb-1">Core Concepts</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {filteredQuestions.filter((q) => Number(q.id) % 2 === 0).length} Questions
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-500 dark:text-slate-400" />
            </button>

            <button
              onClick={() => setSelectedTopic("Advanced Applications")}
              className="w-full bg-slate-50/40 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-900/5 dark:border-white/5 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-855 transition-colors text-left"
            >
              <div>
                <div className="font-bold text-lg mb-1">Advanced Applications</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-3">
                  {filteredQuestions.filter((q) => Number(q.id) % 2 !== 0).length} Questions
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/50 text-rose-400 bg-rose-500/10">
                    MUST DO
                  </span>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === "Topic-Wise PYQs" && selectedTopic && (
              <div className="flex items-center gap-2 mb-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-900/5 dark:border-white/5">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Topic: {selectedTopic} ({filteredQuestions.length} Qs)
                </span>
              </div>
            )}

            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <p>No questions match the selected filters.</p>
              </div>
            ) : (
              filteredQuestions.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => onSelectQuestion(q.id)}
                  className="bg-slate-50/40 dark:bg-slate-800/40 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-5 cursor-pointer hover:border-brand/40 hover:bg-slate-100/20 dark:hover:bg-slate-800/60 transition-all shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${
                          q.status === "Correct"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                            : q.status === "Wrong"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/20"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-900/10 dark:border-white/10"
                        }`}
                      >
                        {q.qNumber}
                      </div>
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-md border border-slate-900/5 dark:border-white/5">
                        {q.year}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded border ${
                          q.difficulty === "Easy"
                            ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                            : q.difficulty === "Medium"
                              ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/10"
                              : "text-red-400 border-red-500/20 bg-red-500/10"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                    <button className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1">
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  <p className="text-slate-700 dark:text-slate-200 text-[15px] leading-relaxed mb-5 font-medium">
                    {q.text}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-200/40 dark:border-slate-700/40">
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-brand px-2 py-1 rounded border border-brand/10">
                        {chapter}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded border border-slate-900/5 dark:border-white/5">
                        {q.type}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectQuestion(q.id);
                      }}
                      className="flex items-center gap-2 text-xs font-bold text-slate-900 bg-brand/10 hover:bg-brand/20 border border-brand/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <PlayCircle size={14} /> Attempt Option
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </main>

      {/* PYQ Filter & Sorting Modal */}
      <AnimatePresence>
        {showPyqFilterModal && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPyqFilterModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="bg-slate-55 dark:bg-slate-800 border border-slate-900/10 dark:border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl max-h-[85vh] flex flex-col overflow-hidden text-left"
            >
              <div className="flex justify-between items-center p-4 border-b border-slate-900/10 dark:border-white/10">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Filter & Sorting
                </h3>
                <button
                  onClick={() => {
                    setTempPyqSortBy("Default");
                    setTempPyqExam("All");
                    setTempHideOutOfSyllabus(false);
                    setTempShowOnlyOutOfSyllabus(false);
                    setTempPyqDifficulty([]);
                    setTempPyqQuestionType([]);
                    setTempPyqEvaluationStatus([]);
                    setTempPyqYears([]);
                  }}
                  className="text-red-400 font-medium hover:text-red-350 transition-colors"
                >
                  Clear Filters
                </button>
              </div>

              <div className="flex flex-1 overflow-hidden h-[60vh]">
                {/* Sidebar */}
                <div className="w-24 bg-slate-50 dark:bg-slate-850 border-r border-slate-900/10 dark:border-white/10 flex flex-col overflow-y-auto no-scrollbar">
                  {[
                    { id: "Sort By", icon: ArrowUpDown },
                    { id: "Exam", icon: BookOpen },
                    { id: "Difficulty", icon: Asterisk },
                    { id: "Question Type", icon: List },
                    { id: "Evaluation Status", icon: CheckSquare },
                    { id: "Years", icon: Calendar },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activePyqFilterTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActivePyqFilterTab(tab.id as any)}
                        className={`flex flex-col items-center justify-center py-4 gap-2 transition-colors relative outline-none ${
                          isActive
                            ? "text-blue-405 bg-blue-500/10"
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r" />
                        )}
                        <Icon size={20} />
                        <span className="text-[10px] text-center font-medium px-1 leading-tight">
                          {tab.id}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white dark:bg-slate-900 overflow-y-auto p-4 space-y-6">
                  {activePyqFilterTab === "Sort By" && (
                    <>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-900/5 dark:border-white/5">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            SORT BY
                          </h4>
                        </div>
                        <div className="flex flex-col gap-4">
                          {["Default", "Latest to Oldest", "Oldest to Latest"].map((sortOption) => (
                            <label
                              key={sortOption}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  tempPyqSortBy === sortOption ? "border-blue-500" : "border-slate-500 group-hover:border-slate-400"
                                }`}
                              >
                                {tempPyqSortBy === sortOption && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                )}
                              </div>
                              <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">
                                {sortOption}
                              </span>
                              <input
                                type="radio"
                                name="sort-by"
                                className="hidden"
                                checked={tempPyqSortBy === sortOption}
                                onChange={() => setTempPyqSortBy(sortOption)}
                              />
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-900/5 dark:border-white/5 flex justify-between items-center">
                        <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">
                          Hide out of syllabus Qs
                        </span>
                        <button
                          onClick={() => {
                            setTempHideOutOfSyllabus(!tempHideOutOfSyllabus);
                            if (!tempHideOutOfSyllabus) setTempShowOnlyOutOfSyllabus(false);
                          }}
                          className={`w-10 h-6 rounded-full transition-colors relative ${
                            tempHideOutOfSyllabus ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-600"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white dark:bg-slate-900 absolute top-1 transition-all ${
                              tempHideOutOfSyllabus ? "left-5" : "left-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-900/5 dark:border-white/5 flex justify-between items-center mt-4">
                        <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">
                          Show only out of syllabus Qs
                        </span>
                        <button
                          onClick={() => {
                            setTempShowOnlyOutOfSyllabus(!tempShowOnlyOutOfSyllabus);
                            if (!tempShowOnlyOutOfSyllabus) setTempHideOutOfSyllabus(false);
                          }}
                          className={`w-10 h-6 rounded-full transition-colors relative ${
                            tempShowOnlyOutOfSyllabus ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-600"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white dark:bg-slate-900 absolute top-1 transition-all ${
                              tempShowOnlyOutOfSyllabus ? "left-5" : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                    </>
                  )}

                  {activePyqFilterTab === "Exam" && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-900/5 dark:border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          EXAM
                        </h4>
                        <button
                          onClick={() => setTempPyqExam("All")}
                          className="text-xs text-red-400 font-medium"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-col gap-4">
                        {["All", "JEE Main", "NEET"].map((examOpt) => (
                          <label
                            key={examOpt}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                tempPyqExam === examOpt ? "border-blue-500" : "border-slate-500 group-hover:border-slate-400"
                              }`}
                            >
                              {tempPyqExam === examOpt && (
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                              )}
                            </div>
                            <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">
                              {examOpt}
                            </span>
                            <input
                              type="radio"
                              name="exam-filter"
                              className="hidden"
                              checked={tempPyqExam === examOpt}
                              onChange={() => setTempPyqExam(examOpt)}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {activePyqFilterTab === "Difficulty" && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-900/5 dark:border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          DIFFICULTY
                        </h4>
                        <button
                          onClick={() => setTempPyqDifficulty([])}
                          className="text-xs text-red-400 font-medium"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {["Easy", "Medium", "Tough"].map((diff) => {
                          const isSelected = tempPyqDifficulty.includes(diff);
                          return (
                            <button
                              key={diff}
                              onClick={() =>
                                setTempPyqDifficulty((prev) =>
                                  prev.includes(diff)
                                    ? prev.filter((d) => d !== diff)
                                    : [...prev, diff],
                                )
                              }
                              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-colors ${
                                isSelected
                                  ? "bg-blue-500/20 border-blue-500 text-blue-450"
                                  : "bg-white dark:bg-slate-900 border-slate-900/5 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                              }`}
                            >
                              <div className="flex items-end gap-0.5 h-4">
                                <div
                                  className={`w-1 rounded-t-sm ${diff === "Easy" ? "h-2 bg-emerald-500" : "h-2 bg-slate-200 dark:bg-slate-600"}`}
                                />
                                <div
                                  className={`w-1 rounded-t-sm ${diff === "Medium" ? "h-3 bg-yellow-500" : "h-3 bg-slate-200 dark:bg-slate-600"}`}
                                />
                                <div
                                  className={`w-1 rounded-t-sm ${diff === "Tough" ? "h-4 bg-red-500" : "h-4 bg-slate-200 dark:bg-slate-600"}`}
                                />
                              </div>
                              <span className="text-sm font-medium">{diff}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activePyqFilterTab === "Question Type" && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-900/5 dark:border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          QUESTION TYPE
                        </h4>
                        <button
                          onClick={() => setTempPyqQuestionType([])}
                          className="text-xs text-red-400 font-medium"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: "Single Correct", icon: List },
                          { id: "Multiple Correct", icon: CheckSquare },
                          { id: "Numerical", icon: Calculator },
                        ].map((type) => {
                          const Icon = type.icon;
                          const isSelected = tempPyqQuestionType.includes(type.id);
                          return (
                            <button
                              key={type.id}
                              onClick={() =>
                                setTempPyqQuestionType((prev) =>
                                  prev.includes(type.id)
                                    ? prev.filter((t) => t !== type.id)
                                    : [...prev, type.id],
                                )
                              }
                              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-colors ${
                                isSelected
                                  ? "bg-blue-500/20 border-blue-500 text-blue-450"
                                  : "bg-white dark:bg-slate-900 border-slate-900/5 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                              }`}
                            >
                              <Icon size={20} />
                              <span className="text-sm font-medium text-center leading-tight">
                                {type.id}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activePyqFilterTab === "Evaluation Status" && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-900/5 dark:border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          EVALUATION STATUS
                        </h4>
                        <button
                          onClick={() => setTempPyqEvaluationStatus([])}
                          className="text-xs text-red-400 font-medium"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: "Correct", icon: Check },
                          { id: "Incorrect", icon: X },
                          { id: "Unattempted", icon: AlertCircle },
                        ].map((statusOpt) => {
                          const Icon = statusOpt.icon;
                          const isSelected = tempPyqEvaluationStatus.includes(statusOpt.id);
                          return (
                            <button
                              key={statusOpt.id}
                              onClick={() =>
                                setTempPyqEvaluationStatus((prev) =>
                                  prev.includes(statusOpt.id)
                                    ? prev.filter((s) => s !== statusOpt.id)
                                    : [...prev, statusOpt.id],
                                )
                              }
                              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-colors ${
                                isSelected
                                  ? "bg-blue-500/20 border-blue-500 text-blue-450"
                                  : "bg-white dark:bg-slate-900 border-slate-900/5 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                              }`}
                            >
                              <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center">
                                <Icon size={14} />
                              </div>
                              <span className="text-sm font-medium text-center leading-tight">
                                {statusOpt.id}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activePyqFilterTab === "Years" && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-900/5 dark:border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          YEARS
                        </h4>
                        <button
                          onClick={() => setTempPyqYears([])}
                          className="text-xs text-red-400 font-medium"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-col gap-4">
                        {[`${exam} 2026`, `${exam} 2025`, `${exam} 2024`, `${exam} 2023`, `${exam} 2022`, `${exam} 2021`].map(
                          (yearVal) => (
                            <label
                              key={yearVal}
                              className="flex items-center justify-between cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                    tempPyqYears.includes(yearVal) ? "bg-blue-500 border-blue-500" : "border-slate-500 group-hover:border-slate-400"
                                  }`}
                                >
                                  {tempPyqYears.includes(yearVal) && (
                                    <Check size={14} className="text-white dark:text-slate-900" />
                                  )}
                                </div>
                                <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">
                                  {yearVal}
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={tempPyqYears.includes(yearVal)}
                                onChange={() =>
                                  setTempPyqYears((prev) =>
                                    prev.includes(yearVal)
                                      ? prev.filter((y) => y !== yearVal)
                                      : [...prev, yearVal],
                                  )
                                }
                              />
                            </label>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 p-4 border-t border-slate-900/10 dark:border-white/10 bg-slate-50 dark:bg-slate-800">
                <button
                  onClick={() => setShowPyqFilterModal(false)}
                  className="flex-1 py-3.5 bg-transparent border border-slate-900/20 dark:border-white/20 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setPyqSortBy(tempPyqSortBy);
                    setPyqExam(tempPyqExam);
                    setHideOutOfSyllabus(tempHideOutOfSyllabus);
                    setShowOnlyOutOfSyllabus(tempShowOnlyOutOfSyllabus);
                    setPyqDifficulty(tempPyqDifficulty);
                    setPyqQuestionType(tempPyqQuestionType);
                    setPyqEvaluationStatus(tempPyqEvaluationStatus);
                    setPyqYears(tempPyqYears);
                    setShowPyqFilterModal(false);
                  }}
                  className="flex-1 py-3.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button for bulk attempt */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-30 flex justify-center pointer-events-none">
        <button
          onClick={() => {
            if (filteredQuestions.length > 0) {
              onSelectQuestion(filteredQuestions[0].id);
            }
          }}
          className="pointer-events-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-full px-6 py-3.5 font-bold shadow-xl shadow-black/20 flex items-center gap-2 hover:scale-105 transition-all border border-slate-900/10 dark:border-white/10"
        >
          <BookOpen size={18} /> Take Chapter Test ({filteredQuestions.length} Qs)
        </button>
      </div>
    </div>
  );
};

export default PYQChapterView;
