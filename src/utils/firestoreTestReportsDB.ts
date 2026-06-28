import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export interface TestReport {
  id: string;
  userId: string;
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
  createdAt: number;
}

// Save a test report to Firestore
export async function saveTestReport(
  userId: string,
  report: Omit<TestReport, "id" | "userId" | "createdAt">,
): Promise<TestReport> {
  const ref = collection(db, `users/${userId}/testReports`);
  const newReport = {
    ...report,
    userId,
    createdAt: Date.now(),
  };
  const docRef = await addDoc(ref, newReport);
  return { id: docRef.id, ...newReport };
}

// Get all test reports for a user, ordered by most recent
export async function getTestReports(userId: string): Promise<TestReport[]> {
  try {
    const ref = collection(db, `users/${userId}/testReports`);
    const q = query(ref, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TestReport));
  } catch (error) {
    console.error("Error getting test reports:", error);
    return [];
  }
}

// Get test reports filtered by subject
export async function getTestReportsBySubject(
  userId: string,
  subject: string,
): Promise<TestReport[]> {
  try {
    const ref = collection(db, `users/${userId}/testReports`);
    const q = query(
      ref,
      where("subject", "==", subject),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TestReport));
  } catch (error) {
    console.error("Error getting test reports by subject:", error);
    return [];
  }
}
