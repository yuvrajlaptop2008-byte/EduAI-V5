import React, { useState, useEffect } from"react";
import { motion, AnimatePresence } from"motion/react";
import {
  ArrowLeft,
  ChevronRight,
  Check,
  Zap,
  Atom,
  FlaskConical,
  Calculator,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  HelpCircle,
  Calendar,
  SlidersHorizontal,
  BookOpen,
} from"lucide-react";
import { ExamType, SubjectType, Chapter } from"./types";
import { getChaptersForExam, syllabusData } from"../../data/syllabus";

interface CreateTestFlowProps {
  onBack: () => void;
  onFinish: (testData: any) => void;
}

const CreateTestFlow: React.FC<CreateTestFlowProps> = ({
  onBack,
  onFinish,
}) => {
  const [step, setStep] = useState(1);
  const [testName, setTestName] = useState("");
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectType[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [outOfSyllabus, setOutOfSyllabus] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState<SubjectType | null>(
    null,
  );
  const [mockChapters, setMockChapters] = useState<Chapter[]>([]);

  // Settings
  const [questionSource, setQuestionSource] = useState<"PYQ" |"Practice" |"Mixed"
  >("PYQ");
  const [questionsPerSubject, setQuestionsPerSubject] = useState(10);
  const [testDuration, setTestDuration] = useState(60);
  const [yearFilter, setYearFilter] = useState<"All" |"Last 5 Years" |"Specific"
  >("All");
  const [specificYears, setSpecificYears] = useState<number[]>([]);

  useEffect(() => {
    if (selectedExam) {
      setMockChapters(getChaptersForExam(selectedExam));
    } else {
      setMockChapters([]);
    }
  }, [selectedExam]);

  const getSubjectsByExam = () => {
    if (!selectedExam) return [];
    const examData = syllabusData[selectedExam];
    if (!examData) return [];

    return Object.keys(examData).map((subject) => {
      let icon = BookOpen;
      let color ="text-slate-500 dark:text-slate-400";

      if (subject ==="Physics") {
        icon = Atom;
        color ="text-blue-400";
      } else if (subject ==="Chemistry") {
        icon = FlaskConical;
        color ="text-emerald-400";
      } else if (subject ==="Mathematics") {
        icon = Calculator;
        color ="text-orange-400";
      } else if (subject ==="Biology") {
        icon = Zap;
        color ="text-rose-400";
      }

      return { type: subject as SubjectType, icon, color };
    });
  };

  const currentSubjects = getSubjectsByExam();

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handleFinish = (startNow: boolean) => {
    onFinish({
      name: testName || `${selectedExam} Custom Test`,
      exam: selectedExam,
      subjects: selectedSubjects,
      chapters: selectedChapters,
      questionCount: selectedSubjects.length * questionsPerSubject,
      duration: testDuration,
      source: questionSource,
      yearFilter,
      specificYears,
      startNow,
    });
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  const toggleSubject = (subject: SubjectType) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
      // Remove chapters associated with the unselected subject
      const subjectChapterIds = mockChapters
        .filter((c) => c.subject === subject)
        .map((c) => c.id);
      setSelectedChapters(
        selectedChapters.filter((id) => !subjectChapterIds.includes(id)),
      );
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const toggleChapter = (chapterId: string) => {
    if (selectedChapters.includes(chapterId)) {
      setSelectedChapters(selectedChapters.filter((id) => id !== chapterId));
    } else {
      setSelectedChapters([...selectedChapters, chapterId]);
    }
  };

  const handleExamSelect = (exam: ExamType) => {
    if (exam !== selectedExam) {
      setSelectedExam(exam);
      setSelectedSubjects([]);
      setSelectedChapters([]);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="mb-8 relative z-10 w-full">
        <h2 className="text-3xl font-black mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
          Test Details
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Give your custom test a name and choose an exam
        </p>
      </div>

      <div className="space-y-3 mb-8 w-full group">
        <label className="text-[11px] font-black text-brand uppercase tracking-widest pl-1">
          Test Name
        </label>
        <input
          type="text"
          placeholder="e.g. Physics Mechanics Practice"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          className="w-full p-5 bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-900/10 dark:border-white/10 rounded-2xl text-lg font-bold text-slate-900 dark:text-white focus:border-brand/60 focus:bg-slate-50/80 dark:focus:bg-slate-800/80 outline-none transition-all shadow-inner group-hover:border-slate-900/20 dark:hover:border-white/20"
        />
      </div>

      <div className="space-y-4 w-full">
        <label className="text-[11px] font-black text-brand uppercase tracking-widest pl-1">
          Choose Exam Type
        </label>
        <div className="grid grid-cols-1 gap-4">
          {(Object.keys(syllabusData) as ExamType[]).map((exam) => (
            <motion.div
              key={exam}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleExamSelect(exam)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between shadow-xl ${
                selectedExam === exam
                  ?"bg-gradient-to-br from-brand/20 to-blue-900/20 border-brand/50 shadow-brand/10"
                  :"bg-slate-50/40 dark:bg-slate-800/40 border-slate-900/5 dark:border-white/5 hover:border-slate-900/10 dark:hover:border-white/10 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 shadow-black/20"
              }`}
            >
              <div className="flex items-center gap-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-inner ${selectedExam === exam ?"bg-gradient-to-br from-brand to-blue-600 text-slate-900 dark:text-white" :"bg-white/5 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border border-slate-900/5 dark:border-white/5"}`}
                >
                  <Zap
                    size={24}
                    className={selectedExam === exam ?"drop-shadow-md" :""}
                  />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight block text-slate-900 dark:text-white">
                    {exam}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Standard curriculum
                  </span>
                </div>
              </div>
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${selectedExam === exam ?"border-brand bg-brand text-slate-900" :"border-slate-200 dark:border-slate-700 text-transparent"}`}
              >
                <Check size={16} strokeWidth={3} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="mb-8 relative z-10">
        <h2 className="text-3xl font-black mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
          Subject Selection
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Choose one or more subjects
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 w-full">
        {currentSubjects.map(({ type, icon: Icon, color }) => (
          <motion.div
            key={type}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleSubject(type)}
            className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between shadow-xl ${
              selectedSubjects.includes(type)
                ?"bg-gradient-to-br from-brand/20 to-blue-900/20 border-brand/50 shadow-brand/10"
                :"bg-slate-50/40 dark:bg-slate-800/40 border-slate-900/5 dark:border-white/5 hover:border-slate-900/10 dark:hover:border-white/10 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 shadow-black/20"
            }`}
          >
            <div className="flex items-center gap-5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-inner ${selectedSubjects.includes(type) ?"bg-gradient-to-br from-brand to-blue-600 text-slate-900 dark:text-white" :"bg-white/5 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border border-slate-900/5 dark:border-white/5"}`}
              >
                <Icon
                  size={24}
                  className={
                    selectedSubjects.includes(type)
                      ?"drop-shadow-md text-slate-900 dark:text-white"
                      : color
                  }
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {type}
              </span>
            </div>
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${selectedSubjects.includes(type) ?"border-brand bg-brand text-slate-900" :"border-slate-200 dark:border-slate-700 text-transparent"}`}
            >
              <Check size={16} strokeWidth={3} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="mb-8 relative z-10">
        <h2 className="text-3xl font-black mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
          Add Chapters
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Select specific chapters for your test
        </p>
      </div>

      <div className="flex items-center justify-between p-5 bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-900/10 dark:border-white/10 rounded-2xl shadow-inner mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 shadow-inner">
            <Info size={20} />
          </div>
          <div>
            <p className="text-[15px] font-black tracking-wide text-slate-900 dark:text-white">
              Include out of syllabus Qs
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Questions from removed topics
            </p>
          </div>
        </div>
        <button
          onClick={() => setOutOfSyllabus(!outOfSyllabus)}
          className={`w-14 h-7 rounded-full transition-all relative shadow-inner ${outOfSyllabus ?"bg-brand shadow-brand/50" :"bg-slate-100 dark:bg-slate-700"}`}
        >
          <div
            className={`absolute top-1 w-5 h-5 bg-white dark:bg-slate-900 rounded-full transition-all shadow-md ${outOfSyllabus ?"left-8" :"left-1"}`}
          />
        </button>
      </div>

      <div className="space-y-5">
        {selectedSubjects.map((subject) => (
          <div
            key={subject}
            className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-900/10 dark:border-white/10 overflow-hidden shadow-xl"
          >
            <div
              onClick={() =>
                setExpandedSubject(expandedSubject === subject ? null : subject)
              }
              className="w-full p-5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-inner group-hover:text-brand transition-colors">
                  {(() => {
                    const s = currentSubjects.find((s) => s.type === subject);
                    const Icon = s?.icon || Atom;
                    return <Icon size={24} />;
                  })()}
                </div>
                <div className="text-left">
                  <h4 className="text-[17px] font-black text-slate-900 dark:text-white">
                    {subject}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span className="text-brand font-bold">
                        {
                          mockChapters.filter(
                            (c) =>
                              c.subject === subject &&
                              selectedChapters.includes(c.id),
                          ).length
                        }
                      </span>{""}
                      /{""}
                      {mockChapters.filter((c) => c.subject === subject).length}{""}
                      Chapters
                    </p>
                    <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const subjectChapters = mockChapters
                          .filter((c) => c.subject === subject)
                          .map((c) => c.id);
                        const allSelected = subjectChapters.every((id) =>
                          selectedChapters.includes(id),
                        );
                        if (allSelected) {
                          setSelectedChapters(
                            selectedChapters.filter(
                              (id) => !subjectChapters.includes(id),
                            ),
                          );
                        } else {
                          setSelectedChapters([
                            ...new Set([
                              ...selectedChapters,
                              ...subjectChapters,
                            ]),
                          ]);
                        }
                      }}
                      className="text-[11px] font-black text-brand hover:underline tracking-wider uppercase"
                    >
                      {mockChapters
                        .filter((c) => c.subject === subject)
                        .every((c) => selectedChapters.includes(c.id))
                        ?"Deselect All"
                        :"Select All"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 group-hover:text-slate-900 dark:hover:text-white transition-colors">
                {expandedSubject === subject ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>
            </div>

            <AnimatePresence>
              {expandedSubject === subject && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height:"auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-slate-50/30 dark:bg-slate-800/30 border-t border-slate-900/5 dark:border-white/5"
                >
                  <div className="p-6 flex flex-wrap gap-2.5">
                    {mockChapters
                      .filter((c) => c.subject === subject)
                      .map((chapter) => {
                        const isVisible = outOfSyllabus || !chapter.isRemoved;
                        if (!isVisible) return null;

                        return (
                          <button
                            key={chapter.id}
                            onClick={() => toggleChapter(chapter.id)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 shadow-sm ${
                              selectedChapters.includes(chapter.id)
                                ?"bg-brand border-brand text-slate-900 shadow-brand/20"
                                :"bg-white/80 dark:bg-slate-900/80 border-slate-900/5 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-900/20 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white"
                            }`}
                          >
                            {chapter.name}
                            {chapter.isReduced && (
                              <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-500 rounded text-[9px] uppercase tracking-wider font-black">
                                Reduced
                              </span>
                            )}
                            {chapter.isRemoved && (
                              <span className="px-1.5 py-0.5 bg-red-500/20 text-red-500 rounded text-[9px] uppercase tracking-wider font-black">
                                Removed
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="mb-8 relative z-10">
        <h2 className="text-3xl font-black mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
          Question Settings
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Configure your test parameters
        </p>
      </div>

      <div className="space-y-8">
        {/* Source */}
        <div className="space-y-4">
          <label className="text-[11px] font-black text-brand uppercase tracking-widest pl-1">
            Question Source
          </label>
          <div className="flex gap-3">
            {(["PYQ","Practice","Mixed"] as const).map((source) => (
              <button
                key={source}
                onClick={() => setQuestionSource(source)}
                className={`flex-1 py-4 rounded-2xl text-sm font-bold border transition-all shadow-md ${
                  questionSource === source
                    ?"bg-gradient-to-b from-brand to-blue-600 border-brand text-slate-900 dark:text-white shadow-brand/20"
                    :"bg-white/5 dark:bg-slate-900/50 border-slate-900/5 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-900/20 dark:hover:border-white/20 hover:bg-slate-50/80 dark:hover:bg-slate-800/80"
                }`}
              >
                {source}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="space-y-4 p-5 bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-900/10 dark:border-white/10 rounded-3xl shadow-inner">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Questions per Subject
            </label>
            <span className="text-xl font-black text-brand">
              {questionsPerSubject} Qs
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="5"
            value={questionsPerSubject}
            onChange={(e) => setQuestionsPerSubject(parseInt(e.target.value))}
            className="w-full h-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand"
          />
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold tracking-widest">
            <span>5 QS</span>
            <span>15 QS</span>
            <span>30 QS</span>
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-4 p-5 bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-900/10 dark:border-white/10 rounded-3xl shadow-inner">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Test Duration
            </label>
            <span className="text-xl font-black text-brand">
              {testDuration} Mins
            </span>
          </div>
          <input
            type="range"
            min="15"
            max="180"
            step="15"
            value={testDuration}
            onChange={(e) => setTestDuration(parseInt(e.target.value))}
            className="w-full h-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand"
          />
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase">
            <span>15m</span>
            <span>90m</span>
            <span>180m</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-brand/10 to-blue-900/10 p-6 rounded-3xl border border-brand/20 flex items-center gap-5 shadow-lg">
        <div className="w-14 h-14 bg-brand/20 rounded-2xl flex items-center justify-center text-brand border border-brand/20 shadow-inner">
          <HelpCircle size={28} />
        </div>
        <div>
          <p className="text-lg font-black text-slate-900 dark:text-white tracking-wide">
            Total Questions:{""}
            <span className="text-brand">
              {selectedSubjects.length * questionsPerSubject}
            </span>
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Based on your selected subjects
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="mb-8 relative z-10">
        <h2 className="text-3xl font-black mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
          Year Filter
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Select the year range for questions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {(["All","Last 5 Years","Specific"] as const).map((filter) => (
          <motion.div
            key={filter}
            whileTap={{ scale: 0.98 }}
            onClick={() => setYearFilter(filter)}
            className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between shadow-xl ${
              yearFilter === filter
                ?"bg-gradient-to-br from-brand/20 to-blue-900/20 border-brand/50 shadow-brand/10"
                :"bg-slate-50/40 dark:bg-slate-800/40 border-slate-900/5 dark:border-white/5 hover:border-slate-900/10 dark:hover:border-white/10 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 shadow-black/20"
            }`}
          >
            <div className="flex items-center gap-5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-inner ${yearFilter === filter ?"bg-gradient-to-br from-brand to-blue-600 text-slate-900 dark:text-white" :"bg-white/5 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border border-slate-900/5 dark:border-white/5"}`}
              >
                <Calendar
                  size={24}
                  className={yearFilter === filter ?"drop-shadow-md" :""}
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {filter}
              </span>
            </div>
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${yearFilter === filter ?"border-brand bg-brand text-slate-900" :"border-slate-200 dark:border-slate-700 text-transparent"}`}
            >
              <Check size={16} strokeWidth={3} />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {yearFilter ==="Specific" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height:"auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-6 bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-slate-900/10 dark:border-white/10 shadow-inner">
              <h3 className="text-[11px] font-black text-brand uppercase tracking-widest mb-4">
                Select Years
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {Array.from(
                  { length: 15 },
                  (_, i) => new Date().getFullYear() - i,
                ).map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      if (specificYears.includes(year)) {
                        setSpecificYears(
                          specificYears.filter((y) => y !== year),
                        );
                      } else {
                        setSpecificYears([...specificYears, year]);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all shadow-sm ${
                      specificYears.includes(year)
                        ?"bg-brand text-slate-900 border-brand shadow-brand/20"
                        :"bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderStep6 = () => {
    const totalQuestions = selectedSubjects.length * questionsPerSubject;
    const selectedChaptersList = mockChapters.filter((c) =>
      selectedChapters.includes(c.id),
    );

    let yearText ="All Years";
    if (yearFilter ==="Last 5 Years") yearText ="Last 5 Years";
    else if (yearFilter ==="Specific") {
      yearText =
        specificYears.length > 0
          ? specificYears.sort((a, b) => b - a).join(",")
          :"No specific years selected";
    }

    return (
      <div className="space-y-6">
        <div className="mb-4 relative z-10 w-full overflow-hidden">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white break-words">
            {testName || `${selectedExam} Custom Test`}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2.5 mb-6">
          <span className="px-4 py-1.5 bg-brand/10 text-brand text-xs font-black rounded-xl border border-brand/20 flex items-center gap-1.5 shadow-sm">
            <Check size={14} /> {selectedExam}
          </span>
          {selectedSubjects.map((s) => (
            <span
              key={s}
              className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-black rounded-xl border border-emerald-500/20 flex items-center gap-1.5 shadow-sm"
            >
              <FlaskConical size={14} /> {s}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-6 bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-900/10 dark:border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-inner group transition-colors hover:border-slate-900/20 dark:hover:border-white/20">
            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3 group-hover:text-slate-900 dark:hover:text-white transition-colors shadow-inner">
              <HelpCircle size={24} />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalQuestions}{""}
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Qs
              </span>
            </span>
          </div>
          <div className="p-6 bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-900/10 dark:border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-inner group transition-colors hover:border-slate-900/20 dark:hover:border-white/20">
            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3 group-hover:text-slate-900 dark:hover:text-white transition-colors shadow-inner">
              <Clock size={24} />
            </div>
            <span className="text-2xl font-black text-brand">
              {testDuration}{""}
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Mins
              </span>
            </span>
          </div>
        </div>

        <div className="p-6 bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-900/10 dark:border-white/10 rounded-[2rem] mb-8 shadow-inner relative overflow-hidden">
          <div className="flex justify-between items-center mb-4 relative z-10">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-wide">
              Previous years (
              {yearFilter ==="All"
                ?"All"
                : yearFilter ==="Last 5 Years"
                  ?"5 Years"
                  : `${specificYears.length} Years`}
              )
            </h3>
            <button className="text-[11px] font-black text-brand uppercase tracking-widest hover:text-blue-400 transition-colors">
              Edit
            </button>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-[15px] font-medium leading-relaxed relative z-10">
            {yearText}
          </p>
          <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
            <Calendar size={120} />
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">
            Syllabus Overview
          </h3>
          {selectedSubjects.map((subject) => {
            const subjectChapters = selectedChaptersList.filter(
              (c) => c.subject === subject,
            );
            if (subjectChapters.length === 0) return null;

            let icon = BookOpen;
            let color ="text-slate-500 dark:text-slate-400";
            let bgColor ="bg-slate-50/50 dark:bg-slate-800/50";

            if (subject ==="Physics") {
              icon = Atom;
              color ="text-blue-400";
              bgColor ="bg-blue-900/20 border border-blue-500/20";
            } else if (subject ==="Chemistry") {
              icon = FlaskConical;
              color ="text-emerald-400";
              bgColor ="bg-emerald-900/20 border border-emerald-500/20";
            } else if (subject ==="Mathematics") {
              icon = Calculator;
              color ="text-orange-400";
              bgColor ="bg-orange-900/20 border border-orange-500/20";
            } else if (subject ==="Biology") {
              icon = Zap;
              color ="text-rose-400";
              bgColor ="bg-rose-900/20 border border-rose-500/20";
            }

            const Icon = icon;

            return (
              <div
                key={subject}
                className="p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2rem] border border-slate-900/10 dark:border-white/10 mb-4 shadow-xl"
              >
                <div className="flex justify-between items-center mb-5 border-b border-slate-900/5 dark:border-white/5 pb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${bgColor} ${color}`}
                    >
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {subject}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {subjectChapters.length} chapter
                        {subjectChapters.length > 1 ?"s" :""} selected
                      </p>
                    </div>
                  </div>
                </div>
                <ul className="space-y-3 px-2">
                  {subjectChapters.map((chapter) => (
                    <li
                      key={chapter.id}
                      className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-[15px] font-medium leading-relaxed group"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-600 mt-2 shrink-0 group-hover:bg-brand transition-colors" />
                      <span className="group-hover:text-slate-900 dark:hover:text-white transition-colors">
                        {chapter.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const canGoNext = () => {
    if (step === 1) return selectedExam !== null;
    if (step === 2) return selectedSubjects.length > 0;
    if (step === 3) {
      // Ensure at least one chapter is selected for EACH selected subject
      return selectedSubjects.every((subject) =>
        mockChapters.some(
          (c) => c.subject === subject && selectedChapters.includes(c.id),
        ),
      );
    }
    if (step === 4) return true;
    if (step === 5) {
      if (yearFilter ==="Specific" && specificYears.length === 0) return false;
      return true;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">
            {step <= 2
              ?"Create Your Own Test"
              : step === 3
                ? expandedSubject ||"Select Chapters"
                : step === 4
                  ?"Test Settings"
                  : step === 5
                    ?"Year Filter"
                    :"Test preview"}
          </h1>
        </div>
        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-900/5 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400">
          {step <= 2 ? (
            <Calendar size={20} />
          ) : step === 3 ? (
            <Info size={20} />
          ) : step === 4 ? (
            <SlidersHorizontal size={20} />
          ) : step === 5 ? (
            <Calendar size={20} />
          ) : (
            <BookOpen size={20} />
          )}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-6 py-2">
        <div className="h-1 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand"
            initial={{ width:"0%" }}
            animate={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      <main className="flex-1 px-6 pt-6 pb-40 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
            {step === 6 && renderStep6()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/95 to-transparent z-40 pointer-events-none">
        {step < 6 ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={!canGoNext()}
            onClick={handleNext}
            className={`w-full py-4.5 rounded-2xl flex items-center justify-center gap-3 font-black text-lg transition-all shadow-xl pointer-events-auto ${
              canGoNext()
                ?"bg-gradient-to-b from-brand to-blue-600 text-white shadow-[0_10px_40px_rgba(37,99,235,0.4)] border border-brand/40 hover:brightness-110"
                :"bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed border border-slate-900/5 dark:border-white/5 shadow-inner"
            }`}
          >
            Continue
            <ChevronRight size={24} strokeWidth={3} />
          </motion.button>
        ) : (
          <div className="flex flex-col gap-3 pointer-events-auto">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFinish(true)}
              className="w-full py-4.5 rounded-2xl flex items-center justify-center gap-3 font-black text-lg transition-all shadow-[0_10px_40px_rgba(37,99,235,0.4)] bg-gradient-to-b from-brand to-blue-600 text-white border border-brand/40 hover:brightness-110"
            >
              Attempt test now
              <ArrowLeft size={24} strokeWidth={3} className="rotate-180" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFinish(false)}
              className="w-full py-4.5 rounded-2xl flex items-center justify-center gap-3 font-black text-lg transition-all shadow-xl bg-slate-50 text-slate-600 dark:text-slate-300 border border-slate-900/10 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
            >
              Save for later
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTestFlow;
