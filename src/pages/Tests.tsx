import React, { useState, useEffect } from"react";
import { useLocation, useNavigate } from"react-router-dom";
import TestsHome from"../components/TestEngine/TestsHome";
import CreateTestList from"../components/TestEngine/CreateTestList";
import CreateTestFlow from"../components/TestEngine/CreateTestFlow";
import TestInterface from"../components/TestEngine/TestInterface";
import TestReport from"../components/TestEngine/TestReport";
import GroupTestRankBanner from "../components/TestEngine/GroupTestRankBanner";
import SolutionViewer from"../components/TestEngine/SolutionViewer";
import PYQHome from"../components/TestEngine/PYQ/PYQHome";
import PYQDashboard from"../components/TestEngine/PYQ/PYQDashboard";
import PYQChapterView from"../components/TestEngine/PYQ/PYQChapterView";
import PYQQuestionViewer from"../components/TestEngine/PYQ/PYQQuestionViewer";
import PYQExamList from"../components/TestEngine/PYQ/PYQExamList";
import ClassTestList from"../components/TestEngine/ClassTestList";
import { CustomTest, PYQPaper } from"../components/TestEngine/types";
import TestCountdown from"../components/TestEngine/TestCountdown";
import ErrorBoundary from "../components/ErrorBoundary";
import TestSeriesView from "../components/TestEngine/TestSeriesView";
import { useUser } from "../context/UserContext";

type ViewState =
  |"home"
  |"create-list"
  |"create-flow"
  |"test-interface"
  |"test-report"
  |"solution-viewer"
  |"pyq-home"
  |"pyq-dashboard"
  |"pyq-chapter-view"
  | "pyq-question-viewer"
  | "pyq-exam-list"
  | "class-test-list"
  | "test-series-view";

export default function Tests() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const queryParams = new URLSearchParams(location.search);
  const viewParam = queryParams.get("view") as ViewState | null;

  const [view, setView] = useState<ViewState>(
    viewParam || location.state?.initialView || "home",
  );
  const [tests, setTests] = useState<CustomTest[]>([]);
  const [activeTestData, setActiveTestData] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [selectedExam, setSelectedExam] = useState<"JEE Main" |"NEET" | null>(
    location.state?.selectedExam || null,
  );
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );
  const [pyqPapers, setPyqPapers] = useState<PYQPaper[]>([]);
  const [showCountdown, setShowCountdown] = useState(false);
  const [pyqQuestions, setPyqQuestions] = useState<any[]>([]);
  const [pyqActiveIndex, setPyqActiveIndex] = useState<number>(0);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.initialView) {
      setView(location.state.initialView);
      if (location.state.selectedExam) {
        setSelectedExam(location.state.selectedExam);
      }
      // Clear the state so it doesn't re-trigger on subsequent renders if not intended
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const currentParams = new URLSearchParams(window.location.search);
    if (view === "home") {
      currentParams.delete("view");
    } else {
      currentParams.set("view", view);
    }
    const newSearch = currentParams.toString();
    navigate({
      pathname: window.location.pathname,
      search: newSearch ? `?${newSearch}` : ""
    }, { replace: true });
  }, [view, navigate]);

  useEffect(() => {
    const bottomNav = document.getElementById("bottom-nav");
    if (bottomNav) {
      if (view ==="home") {
        bottomNav.style.display ="block";
      } else {
        bottomNav.style.display ="none";
      }
    }
    return () => {
      if (bottomNav) bottomNav.style.display ="block";
    };
  }, [view]);

  const handleBack = () => {
    setView("home");
  };

  const handleFinishTest = (results: any) => {
    setTestResults(results);

    // Calculate stats for saving
    const attempted = results.questions.filter(
      (q: any) => results.answers[q.id] !== undefined,
    ).length;
    const correct = results.questions.filter(
      (q: any) => String(results.answers[q.id]) === String(q.correctAnswer),
    ).length;
    const incorrect = attempted - correct;
    const marksPerQ = activeTestData?._marksPerQ ?? 4;
    const negMarks = activeTestData?._negativeMarks ?? 1;
    const score = correct * marksPerQ - incorrect * negMarks;

    // Save the report with user info for Firestore sync
    import("../utils/analysis").then(({ saveTestReport }) => {
      const userEmail = (window as any).__MARKS_USER_EMAIL || "user@example.com";
      const userUid = (window as any).__MARKS_USER_UID;
      saveTestReport({
        email: userEmail,
        testId: activeTestData?.id ||"unknown",
        subject: activeTestData?.subjects?.[0] ||"Mixed",
        chapter: activeTestData?.chapters?.[0] ||"Mixed",
        correct,
        wrong: incorrect,
        skipped: results.questions.length - attempted,
        total: results.questions.length,
        score,
        timeTaken: results.timeSpent,
        date: new Date().toISOString(),
      }, userUid);
    });

    if (activeTestData?._isGroupTest && user) {
      import("../services/groupTestsDB").then(({ submitAttempt }) => {
        submitAttempt({
          testId: activeTestData._groupTestId,
          studentId: user.uid,
          studentName: user.name,
          instituteId: user.instituteId || "default",
          examGroupId: activeTestData._examGroupId || user.examGroupId || "",
          answers: results.answers || {},
          markedForReview: results.markedForReview || [],
          score,
          totalMarks: activeTestData.totalMarks || results.questions.length * 4,
          timeTakenSec: results.timeSpent || 0,
        }).catch((e) => console.warn("Failed to record group-test attempt:", e));
      });
    }

    setView("test-report");
  };

  const handleCreateTestFinish = (testData: any) => {
    const newTest: CustomTest = {
      id: Math.random().toString(36).substr(2, 9),
      name: testData.name,
      exam: testData.exam,
      subjects: testData.subjects,
      chapters: testData.chapters,
      questionCount: testData.questionCount,
      duration: testData.duration,
      createdAt: new Date().toISOString(),
      status:"Not Attempted",
      yearFilter: testData.yearFilter,
      specificYears: testData.specificYears,
    };
    setTests([newTest, ...tests]);
    if (testData.startNow) {
      setActiveTestData(newTest);
      setShowCountdown(true);
      setView("test-interface");
    } else {
      setView("create-list");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {view ==="home" && (
        <TestsHome
          onBack={() => window.history.back()}
          onCreateTest={() => setView("create-list")}
          onViewPYQs={() => setView("pyq-home")}
          onSolveDPPs={() => navigate("/app/dpp")}
          onViewTestSeries={(id) => {
            setSelectedSeriesId(id);
            setView("test-series-view");
          }}
          onViewClassTests={() => setView("class-test-list")}
        />
      )}

      {view ==="class-test-list" && (
        <ErrorBoundary>
          <ClassTestList
            onBack={handleBack}
            onAttemptTest={(test) => {
              setActiveTestData(test);
              setShowCountdown(true);
              setView("test-interface");
            }}
            onViewAnalysis={(test) => {
              if (test.status !== "Attempted") {
                alert("You haven't attempted this test yet. Complete the test first to view analysis.");
                return;
              }
              // Use stored test data if available
              const storedResults = (test as any)._storedResults;
              if (storedResults) {
                setTestResults(storedResults);
                setActiveTestData(test);
                setView("test-report");
              } else {
                alert("Test results not found. Please retake the test.");
              }
            }}
          />
        </ErrorBoundary>
      )}

      {view ==="create-list" && (
        <CreateTestList
          tests={tests}
          onBack={handleBack}
          onCreateNew={() => setView("create-flow")}
          onAttemptTest={(test) => {
            setActiveTestData(test);
            setShowCountdown(true);
            setView("test-interface");
          }}
          onViewAnalysis={(test) => {
            if (test.status !== "Attempted") {
              alert("You haven't attempted this test yet. Complete the test first to view analysis.");
              return;
            }
            const storedResults = (test as any)._storedResults;
            if (storedResults) {
              setTestResults(storedResults);
              setActiveTestData(test);
              setView("test-report");
            } else {
              alert("Test results not found. Please retake the test.");
            }
          }}
        />
      )}

      {view ==="create-flow" && (
        <CreateTestFlow
          onBack={() => setView("create-list")}
          onFinish={handleCreateTestFinish}
        />
      )}

      {view ==="test-interface" && activeTestData && (
        <TestInterface
          testData={activeTestData}
          onSubmit={handleFinishTest}
          onExit={() => setView("create-list")}
          isCountdownActive={showCountdown}
        />
      )}

      {view ==="test-report" && testResults && (
        <>
          {activeTestData?._isGroupTest && (
            <GroupTestRankBanner testId={activeTestData._groupTestId} studentId={user?.uid} />
          )}
          <TestReport
            results={testResults}
            onBack={() => {
              if (activeTestData?._isGroupTest || activeTestData?.id?.startsWith("ct-")) {
                setView("class-test-list");
              } else if (activeTestData?.id?.startsWith("ts-")) {
                setView("test-series-view");
              } else {
                setView("create-list");
              }
            }}
            onViewSolutions={() => setView("solution-viewer")}
            onViewAnalysis={() => navigate("/app/analysis")}
            onReattempt={() => {
              setShowCountdown(true);
              setView("test-interface");
            }}
          />
        </>
      )}

      {view ==="test-series-view" && selectedSeriesId && (
        <TestSeriesView
          seriesId={selectedSeriesId}
          onBack={handleBack}
          onAttemptTest={(test) => {
            setActiveTestData(test);
            setShowCountdown(true);
            setView("test-interface");
          }}
          onViewAnalysis={(test) => {
            if (test.status !== "Attempted") {
              alert("You haven't attempted this test yet. Complete the test first to view analysis.");
              return;
            }
            const storedResults = (test as any)._storedResults;
            if (storedResults) {
              setTestResults(storedResults);
              setActiveTestData(test);
              setView("test-report");
            } else {
              alert("Test results not found. Please retake the test.");
            }
          }}
        />
      )}

      {view ==="solution-viewer" && testResults && (
        <SolutionViewer
          results={testResults}
          onBack={() => setView("test-report")}
        />
      )}

      {view ==="pyq-home" && (
        <PYQHome
          onBack={handleBack}
          onSelectExam={(exam) => {
            setSelectedExam(exam);
            setView("pyq-dashboard");
          }}
        />
      )}

      {view ==="pyq-dashboard" && selectedExam && (
        <PYQDashboard
          exam={selectedExam}
          onBack={() => setView("pyq-home")}
          onSelectChapter={(subject, chapter) => {
            setSelectedSubject(subject);
            setSelectedChapter(chapter);
            setView("pyq-chapter-view");
          }}
          onOpenFullPapers={() => setView("pyq-exam-list")}
        />
      )}

      {view ==="pyq-chapter-view" &&
        selectedExam &&
        selectedSubject &&
        selectedChapter && (
          <PYQChapterView
            exam={selectedExam}
            subject={selectedSubject}
            chapter={selectedChapter}
            onBack={() => setView("pyq-dashboard")}
            onSelectQuestion={(questionId) => {
              import("../utils/questionBank").then(({ getQuestionsForChapter }) => {
                const list = getQuestionsForChapter(selectedSubject, selectedChapter);
                setPyqQuestions(list);
                const idx = list.findIndex(q => q.id.toString() === questionId);
                setPyqActiveIndex(idx >= 0 ? idx : 0);
                setSelectedQuestionId(questionId);
                setView("pyq-question-viewer");
              });
            }}
          />
        )}

      {view ==="pyq-question-viewer" && selectedQuestionId && pyqQuestions.length > 0 && (
        <PYQQuestionViewer
          questionId={selectedQuestionId}
          subject={selectedSubject || "Physics"}
          chapter={selectedChapter || "General"}
          onBack={() => setView("pyq-chapter-view")}
          onNext={() => {
            if (pyqActiveIndex < pyqQuestions.length - 1) {
              const nextIdx = pyqActiveIndex + 1;
              setPyqActiveIndex(nextIdx);
              setSelectedQuestionId(pyqQuestions[nextIdx].id.toString());
            }
          }}
          onPrev={() => {
            if (pyqActiveIndex > 0) {
              const prevIdx = pyqActiveIndex - 1;
              setPyqActiveIndex(prevIdx);
              setSelectedQuestionId(pyqQuestions[prevIdx].id.toString());
            }
          }}
          hasNext={pyqActiveIndex < pyqQuestions.length - 1}
          hasPrev={pyqActiveIndex > 0}
        />
      )}

      {view ==="pyq-exam-list" && selectedExam && (
        <PYQExamList
          exam={selectedExam}
          papers={pyqPapers}
          setPapers={setPyqPapers}
          onBack={() => setView("pyq-dashboard")}
          onSelectPaper={(paper) => {
            setActiveTestData(paper);
            setShowCountdown(true);
            setView("test-interface");
          }}
          onViewAnalysis={(paper) => {
            if ((paper as any).status !== "Attempted") {
              alert("You haven't attempted this paper yet. Complete it first to view analysis.");
              return;
            }
            const storedResults = (paper as any)._storedResults;
            if (storedResults) {
              setTestResults(storedResults);
              setActiveTestData(paper);
              setView("test-report");
            } else {
              alert("Paper results not found. Please retake the paper.");
            }
          }}
        />
      )}

      {showCountdown && (
        <TestCountdown onComplete={() => setShowCountdown(false)} />
      )}
    </div>
  );
}
