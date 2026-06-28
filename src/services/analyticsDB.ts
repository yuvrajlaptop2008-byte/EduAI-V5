import { db } from "../firebase";
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import type { GroupTestAttempt } from "../types/schema";

// ── Student Analytics ─────────────────────────────────────────────────────────
export interface StudentAnalytics {
  uid: string;
  totalTests: number;
  avgScore: number;
  avgAccuracy: number;
  bestRank: number | null;
  subjectAccuracy: Record<string, { correct: number; total: number }>;
  chapterAccuracy: Record<string, { correct: number; total: number }>;
  weeklyScores: { week: string; avg: number }[];
  updatedAt: number;
}

export async function getStudentAnalytics(uid: string): Promise<StudentAnalytics | null> {
  const snap = await getDoc(doc(db, "studentAnalytics", uid));
  return snap.exists() ? (snap.data() as StudentAnalytics) : null;
}

export async function buildStudentAnalytics(uid: string): Promise<StudentAnalytics> {
  const snap = await getDocs(query(collection(db, "groupTestAttempts"), where("studentId", "==", uid)));
  const attempts = snap.docs.map(d => d.data() as GroupTestAttempt);
  const subjectAccuracy: Record<string, { correct: number; total: number }> = {};
  const weeklyMap: Record<string, number[]> = {};
  let totalScore = 0;
  let totalMarks = 0;
  const ranks = attempts.map(a => a.rank).filter((r): r is number => r !== null);

  for (const a of attempts) {
    totalScore += a.score;
    totalMarks += a.totalMarks;
    const week = new Date(a.submittedAt).toISOString().slice(0, 7);
    if (!weeklyMap[week]) weeklyMap[week] = [];
    weeklyMap[week].push(a.score);
  }

  const analytics: StudentAnalytics = {
    uid,
    totalTests: attempts.length,
    avgScore: attempts.length ? Math.round(totalScore / attempts.length) : 0,
    avgAccuracy: totalMarks ? Math.round((totalScore / totalMarks) * 100) : 0,
    bestRank: ranks.length ? Math.min(...ranks) : null,
    subjectAccuracy,
    chapterAccuracy: {},
    weeklyScores: Object.entries(weeklyMap).sort().slice(-8).map(([week, scores]) => ({
      week,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    })),
    updatedAt: Date.now(),
  };

  await setDoc(doc(db, "studentAnalytics", uid), analytics);
  return analytics;
}

// ── Institute Analytics ───────────────────────────────────────────────────────
export interface InstituteAnalytics {
  instituteId: string;
  totalStudents: number;
  totalTeachers: number;
  totalTests: number;
  totalAttempts: number;
  avgScore: number;
  groupBreakdown: { groupId: string; name: string; avgScore: number; students: number }[];
  updatedAt: number;
}

export async function getInstituteAnalytics(instituteId: string): Promise<InstituteAnalytics | null> {
  const snap = await getDoc(doc(db, "instituteAnalytics", instituteId));
  return snap.exists() ? (snap.data() as InstituteAnalytics) : null;
}

// ── Teacher Analytics ─────────────────────────────────────────────────────────
export interface TeacherAnalytics {
  teacherId: string;
  testsCreated: number;
  totalAttempts: number;
  avgScore: number;
  studentsReached: number;
  updatedAt: number;
}

export async function getTeacherAnalytics(teacherId: string): Promise<TeacherAnalytics | null> {
  const snap = await getDoc(doc(db, "teacherAnalytics", teacherId));
  return snap.exists() ? (snap.data() as TeacherAnalytics) : null;
}
