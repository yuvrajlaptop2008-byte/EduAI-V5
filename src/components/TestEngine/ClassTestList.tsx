import React, { useState, useEffect } from "react";
import { Card, Tabs, Divider, Button, Spin, Alert, Typography, ConfigProvider, theme as antdTheme } from "antd";
import {
  BookOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  LockOutlined,
  WarningOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { CustomTest } from "./types";
import { db, handleFirestoreError } from "../../firebase";
import { useUser } from "../../context/UserContext";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

const { Title, Text } = Typography;

interface ClassTestListProps {
  onBack: () => void;
  onAttemptTest: (test: CustomTest) => void;
  onViewAnalysis: (test: CustomTest) => void;
}

interface ClassTest extends CustomTest {
  teacherName: string;
  dueDate: string;
  scheduledFor?: string;
  isLocked: boolean;
  isMissed?: boolean;
  explicitQuestions?: any[];
  _isGroupTest?: boolean;
  _groupTestId?: string;
  _examGroupId?: string;
}

const ClassTestList: React.FC<ClassTestListProps> = ({
  onBack,
  onAttemptTest,
  onViewAnalysis,
}) => {
  const { user, theme } = useUser();
  const [classTests, setClassTests] = useState<ClassTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [triggerError, setTriggerError] = useState<(() => never) | null>(null);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Throw error in render loop to let ErrorBoundary catch it
  if (triggerError) {
    triggerError();
  }

  useEffect(() => {
    const fetchClassTestsAndReports = async () => {
      setLoading(true);
      setError(null);
      try {
        let fetchedTests: ClassTest[] = [];

        if (user?.examGroupId) {
          const { listTestsForGroup } = await import("../../services/groupTestsDB");
          const { getExamGroup } = await import("../../services/examGroupsDB");
          const { resolveGroupTestQuestions, toClassTestShape } = await import("../../utils/groupTestBridge");
          const [groupTests, examGroup] = await Promise.all([
            listTestsForGroup(user.examGroupId),
            getExamGroup(user.examGroupId),
          ]);
          const examLabel =
            ({ JEE: "JEE Main", JEE_ADV: "JEE Advanced", NEET: "NEET" } as Record<string, string>)[
              examGroup?.type || ""
            ] || "JEE Main";

          fetchedTests = await Promise.all(
            groupTests.map(async (t) => {
              const qs = await resolveGroupTestQuestions(t);
              return toClassTestShape(t, qs, examLabel) as unknown as ClassTest;
            }),
          );
        }

        // 2. Fetch User Test Reports (to make progress functional)
        let reports: any[] = [];
        if (user && user.uid !== "demo") {
          try {
            const { getTestReportsFromFirestore } = await import("../../utils/analysis");
            reports = await getTestReportsFromFirestore(user.uid);
          } catch (reportErr) {
            console.warn("Failed to fetch reports from Firestore, using local:", reportErr);
            const { getTestReports } = await import("../../utils/analysis");
            reports = getTestReports();
          }
        } else {
          const { getTestReports } = await import("../../utils/analysis");
          reports = getTestReports();
        }

        // Map reports to Class Tests to resolve status/score
        const finalTests = fetchedTests.map((test) => {
          const matchingReport = reports.find((r) => r.testId === test.id);
          const isOverdue = new Date(test.dueDate).getTime() < Date.now();

          let status = test.status;
          let score = test.score;
          let totalMarks = test.totalMarks || (test.questionCount * 4);
          let isMissed = test.isMissed;

          if (matchingReport) {
            status = "Attempted";
            score = matchingReport.score;
            totalMarks = matchingReport.total || (test.questionCount * 4);
          } else if (isOverdue) {
            isMissed = true;
          }

          return {
            ...test,
            status,
            score,
            totalMarks,
            isMissed,
            _storedResults: matchingReport ? {
              name: test.name,
              questions: Array(test.questionCount).fill(null).map((_, i) => ({ id: `q-${i}`, subject: test.subjects[0] })),
              answers: {},
              timeSpent: matchingReport.timeTaken || 0,
              score: matchingReport.score,
              correct: matchingReport.correct,
              wrong: matchingReport.wrong,
              skipped: matchingReport.skipped,
              total: matchingReport.total,
            } : null
          };
        });

        setClassTests(finalTests);
      } catch (err: any) {
        setError(err);
        if (err?.message?.includes("Missing or insufficient permissions") || err?.message?.includes("error")) {
          setTriggerError(() => {
            throw err;
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClassTestsAndReports();
  }, [user]);

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const daysDifference = Math.round((date.getTime() - Date.now()) / 86400000);

    if (daysDifference === 0) return "Today";
    if (daysDifference === 1) return "Tomorrow";
    if (daysDifference === -1) return "Yesterday";
    return rtf.format(daysDifference, "day");
  };

  // Organize tests into sections
  const activeTests = classTests.filter(
    (t) => t.status !== "Attempted" && !t.isLocked && !t.isMissed
  );
  const upcomingTests = classTests.filter(
    (t) => t.status !== "Attempted" && t.isLocked && !t.isMissed
  );
  const attemptedTests = classTests.filter((t) => t.status === "Attempted");
  const missedTests = classTests.filter((t) => t.isMissed && t.status !== "Attempted");

  const renderTestCard = (test: ClassTest) => {
    const isPhysics = test.subjects.some((s) => s.toLowerCase() === "physics");
    // Physics gets orange-indigo styled icon, Mathematics gets blue, Chemistry gets emerald
    const subjectColor = isPhysics
      ? "from-orange-500 to-indigo-600 text-white"
      : test.subjects[0] === "Chemistry"
      ? "from-emerald-400 to-teal-600 text-white"
      : "from-blue-400 to-indigo-600 text-white";

    const isOverdue = new Date(test.dueDate).getTime() < Date.now();

    return (
      <Card
        key={test.id}
        hoverable
        className="mb-6 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 backdrop-blur-md transition-all duration-300"
        style={{ width: "100%", background: isDark ? "rgba(15, 23, 42, 0.5)" : "#ffffff" }}
        bodyStyle={{ padding: "24px" }}
        tabIndex={0}
        aria-label={`Test Card: ${test.name}. Assigned by ${test.teacherName}. ${test.questionCount} questions, duration ${test.duration} minutes.`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subjectColor} flex items-center justify-center shadow-lg shrink-0`}
            >
              <BookOutlined style={{ fontSize: "24px" }} />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                  {test.exam}
                </span>
                <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded uppercase tracking-widest border border-blue-500/20">
                  {test.subjects[0]}
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white mt-1.5 leading-snug">
                {test.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <UserOutlined />
                <span className="font-semibold">{test.teacherName}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-4">
            {test.status === "Attempted" ? (
              <div className="text-right bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl shadow-sm">
                <div className="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-0.5">
                  Score
                </div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {test.score} <span className="text-xs font-normal text-emerald-500/70">/ {test.totalMarks}</span>
                </div>
              </div>
            ) : (
              <div className={`text-right px-4 py-2 rounded-2xl border text-xs font-bold ${
                test.isMissed
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              }`}>
                <div className="uppercase tracking-widest mb-0.5 opacity-80">
                  {test.isMissed ? "Missed" : "Due"}
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  {test.isMissed ? <WarningOutlined /> : <CalendarOutlined />}
                  {getRelativeTime(test.dueDate)}
                </div>
              </div>
            )}
          </div>
        </div>

        <Divider style={{ margin: "16px 0", borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }} />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ClockCircleOutlined /> {test.duration} mins
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>{test.questionCount} Questions</span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {test.status === "Attempted" ? (
              <>
                <Button
                  icon={<BarChartOutlined />}
                  onClick={() => onViewAnalysis(test)}
                  className="flex-1 sm:flex-initial rounded-xl font-bold bg-slate-100 hover:bg-slate-200 border-none dark:bg-slate-800 dark:text-white"
                  aria-label="View Performance Analysis"
                >
                  Analysis
                </Button>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => onAttemptTest(test)}
                  className="flex-1 sm:flex-initial rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 border-none text-white shadow-md shadow-emerald-500/20"
                  aria-label="Retake Class Test"
                >
                  Retake
                </Button>
              </>
            ) : test.isMissed ? (
              <Button
                disabled
                icon={<LockOutlined />}
                className="w-full sm:w-auto rounded-xl font-bold border-rose-500/20 text-rose-500 bg-rose-500/5 cursor-not-allowed"
                aria-label="Deadline Passed"
              >
                Deadline Passed
              </Button>
            ) : test.isLocked ? (
              <Button
                disabled
                icon={<LockOutlined />}
                className="w-full sm:w-auto rounded-xl font-bold border-slate-200 text-slate-400 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 cursor-not-allowed"
                aria-label="Locked Test"
              >
                Starts {getRelativeTime(test.scheduledFor || "")}
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => onAttemptTest(test)}
                className="w-full sm:w-auto rounded-xl font-bold bg-purple-600 hover:bg-purple-500 border-none shadow-md shadow-purple-500/20 text-white"
                aria-label="Start Class Test Assignment"
              >
                Start Test
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const items = [
    {
      key: "active",
      label: `Active (${activeTests.length})`,
      children: (
        <div className="mt-4">
          {activeTests.length > 0 ? (
            activeTests.map(renderTestCard)
          ) : (
            <Alert
              message="No Active Tests"
              description="Awesome job! You completely cleared your active class test backlog."
              type="success"
              showIcon
              className="rounded-2xl"
            />
          )}
        </div>
      ),
    },
    {
      key: "upcoming",
      label: `Upcoming (${upcomingTests.length})`,
      children: (
        <div className="mt-4">
          {upcomingTests.length > 0 ? (
            upcomingTests.map(renderTestCard)
          ) : (
            <Alert
              message="No Upcoming Tests"
              description="No future tests scheduled at this time. Keep practicing!"
              type="info"
              showIcon
              className="rounded-2xl"
            />
          )}
        </div>
      ),
    },
    {
      key: "attempted",
      label: `Attempted (${attemptedTests.length})`,
      children: (
        <div className="mt-4">
          {attemptedTests.length > 0 ? (
            attemptedTests.map(renderTestCard)
          ) : (
            <Alert
              message="No Attempted Tests"
              description="When you finish assigned tests, your performance reports will appear here."
              type="warning"
              showIcon
              className="rounded-2xl"
            />
          )}
        </div>
      ),
    },
    {
      key: "missed",
      label: `Missed (${missedTests.length})`,
      children: (
        <div className="mt-4">
          {missedTests.length > 0 ? (
            missedTests.map(renderTestCard)
          ) : (
            <Alert
              message="No Missed Tests"
              description="Great consistency! You have not missed any deadlines assigned by your teachers."
              type="success"
              showIcon
              className="rounded-2xl"
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#ff6b00",
        },
      }}
    >
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 pb-32 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-80 bg-purple-500/5 opacity-40 blur-[120px] pointer-events-none" />

        {/* Header */}
        <header className="px-6 py-6 pt-10 sticky top-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl z-40 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined style={{ fontSize: "18px" }} />}
              onClick={onBack}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              aria-label="Back to Tests Dashboard"
            />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-600 shadow-sm">
                <BookOutlined style={{ fontSize: "20px" }} />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-slate-800 dark:text-white">
                  Class Tests
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Assignments officially assigned by your teachers
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 mt-8">
          {loading ? (
            <div className="py-24 text-center">
              <Spin size="large" tip="Loading class tests..." />
            </div>
          ) : error && !triggerError ? (
            <Alert
              message="Error Loading Data"
              description="We encountered an issue fetching your class tests. Dynamic data is offline, showing local tests."
              type="error"
              showIcon
              className="rounded-2xl"
            />
          ) : (
            <Tabs
              defaultActiveKey="active"
              items={items}
              className="custom-tabs dark:text-white"
              size="large"
            />
          )}
        </main>
      </div>
    </ConfigProvider>
  );
};

export default ClassTestList;
