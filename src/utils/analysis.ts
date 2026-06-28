export interface TestReport {
  id: string;
  email: string;
  testId: string;
  subject: string;
  chapter: string;
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  score: number;
  timeTaken: number;
  date: string;
}

export function overallStats(reports: TestReport[]) {
  let correct = 0;
  let wrong = 0;
  let total = 0;

  reports.forEach((r) => {
    correct += r.correct;
    wrong += r.wrong;
    total += r.total;
  });

  const accuracy = total > 0 ? ((correct / total) * 100).toFixed(2) :"0.00";

  return { correct, wrong, total, accuracy };
}

export function subjectStats(reports: TestReport[]) {
  const subjects: Record<string, { correct: number; total: number }> = {};

  reports.forEach((r) => {
    if (!subjects[r.subject]) {
      subjects[r.subject] = { correct: 0, total: 0 };
    }
    subjects[r.subject].correct += r.correct;
    subjects[r.subject].total += r.total;
  });

  return subjects;
}

export function chapterStats(reports: TestReport[]) {
  const chapters: Record<string, { correct: number; total: number }> = {};

  reports.forEach((r) => {
    if (!chapters[r.chapter]) {
      chapters[r.chapter] = { correct: 0, total: 0 };
    }
    chapters[r.chapter].correct += r.correct;
    chapters[r.chapter].total += r.total;
  });

  return chapters;
}

export function weakChapters(
  chapters: Record<string, { correct: number; total: number }>,
) {
  return Object.entries(chapters)
    .filter(([_, data]) => {
      const acc = data.total > 0 ? (data.correct / data.total) * 100 : 0;
      return acc < 60 && data.total > 0;
    })
    .map(([chapter, data]) => ({
      chapter,
      accuracy:
        data.total > 0
          ? ((data.correct / data.total) * 100).toFixed(2)
          :"0.00",
    }));
}

export function strongChapters(
  chapters: Record<string, { correct: number; total: number }>,
) {
  return Object.entries(chapters)
    .filter(([_, data]) => {
      const acc = data.total > 0 ? (data.correct / data.total) * 100 : 0;
      return acc >= 80 && data.total > 0;
    })
    .map(([chapter, data]) => ({
      chapter,
      accuracy:
        data.total > 0
          ? ((data.correct / data.total) * 100).toFixed(2)
          :"0.00",
    }));
}

export function timeAnalysis(reports: TestReport[]) {
  if (reports.length === 0) return 0;
  let totalTime = 0;

  reports.forEach((r) => {
    totalTime += r.timeTaken;
  });

  const avg = totalTime / reports.length;
  return avg;
}

export function accuracyTrend(reports: TestReport[]) {
  return reports.map((r) => {
    return {
      date: r.date,
      accuracy: r.total > 0 ? (r.correct / r.total) * 100 : 0,
    };
  });
}

export function saveTestReport(report: Omit<TestReport,"id">, uid?: string) {
  const reports = getTestReports();
  const newReport = { ...report, id: Date.now().toString() };
  reports.push(newReport);
  localStorage.setItem("mark_reports", JSON.stringify(reports));
  // Also save to Firestore if user is logged in
  if (uid && uid !== "demo") {
    saveTestReportToFirestore(uid, newReport).catch(console.error);
  }
  return newReport;
}

export function getTestReports(): TestReport[] {
  const data = localStorage.getItem("mark_reports");
  return data ? JSON.parse(data) : [];
}

/** Save a test report to Firestore */
export async function saveTestReportToFirestore(uid: string, report: TestReport) {
  const { doc, setDoc } = await import("firebase/firestore");
  const { db } = await import("../firebase");
  await setDoc(doc(db, `users/${uid}/test_reports`, report.id), {
    ...report,
    createdAt: Date.now(),
  });
}

/** Fetch all test reports from Firestore */
export async function getTestReportsFromFirestore(uid: string): Promise<TestReport[]> {
  const { collection, query, orderBy, getDocs } = await import("firebase/firestore");
  const { db } = await import("../firebase");
  const q = query(
    collection(db, `users/${uid}/test_reports`),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => d.data() as TestReport);
}

/** Sync: fetch from Firestore and merge with localStorage */
export async function syncTestReports(uid: string): Promise<TestReport[]> {
  try {
    const firestoreReports = await getTestReportsFromFirestore(uid);
    const localReports = getTestReports();
    // Merge: use Firestore as source of truth, add any local-only ones
    const firestoreIds = new Set(firestoreReports.map(r => r.id));
    const localOnly = localReports.filter(r => !firestoreIds.has(r.id));
    // Upload local-only reports to Firestore
    for (const report of localOnly) {
      await saveTestReportToFirestore(uid, report);
    }
    const merged = [...firestoreReports, ...localOnly];
    localStorage.setItem("mark_reports", JSON.stringify(merged));
    return merged;
  } catch (error) {
    console.warn("Failed to sync reports from Firestore, using local:", error);
    return getTestReports();
  }
}
