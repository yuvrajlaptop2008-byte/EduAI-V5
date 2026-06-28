// Bridges the teacher-created `groupTests` system into the existing,
// already-polished student TestEngine (ClassTestList → TestInterface → TestReport)
// instead of building a parallel, lower-quality test-taking UI.
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { GroupTest } from "../types/schema";
import type { Question as BankQuestion } from "./questionBank";

export interface EngineQuestion {
  id: string;
  type: "MCQ" | "Numerical";
  subject: string;
  text: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  points: number;
}

export function toEngineQuestion(q: BankQuestion): EngineQuestion {
  return {
    id: String(q.id),
    type: "MCQ",
    subject: q.subject,
    text: q.text,
    options: q.options,
    correctAnswer: q.options?.[q.correctAnswer] ?? q.options?.[0] ?? "",
    explanation: q.solution || "No explanation provided.",
    points: 4,
  };
}

export async function resolveGroupTestQuestions(test: GroupTest): Promise<EngineQuestion[]> {
  const docs = await Promise.all(test.questionIds.map((id) => getDoc(doc(db, "custom_questions", id))));
  return docs.filter((d) => d.exists()).map((d) => toEngineQuestion(d.data() as BankQuestion));
}

/** Shapes a GroupTest as a ClassTest-compatible object for the existing TestEngine UI. */
export function toClassTestShape(test: GroupTest, questions: EngineQuestion[], examLabel: string) {
  const subjects = Array.from(new Set(questions.map((q) => q.subject)));
  const isScheduledInFuture = !!test.scheduledAt && test.scheduledAt > Date.now();
  return {
    id: test.id,
    name: test.title,
    exam: examLabel,
    subjects: subjects.length ? subjects : ["Physics"],
    chapters: [],
    questionCount: questions.length,
    duration: test.duration,
    createdAt: new Date(test.createdAt).toISOString(),
    status: "Not Attempted" as const,
    yearFilter: "all",
    totalMarks: test.totalMarks,
    teacherName: test.createdByName || "Teacher",
    dueDate: isScheduledInFuture
      ? new Date(test.scheduledAt!).toISOString()
      : new Date(test.createdAt + 7 * 86400000).toISOString(),
    isLocked: isScheduledInFuture,
    isMissed: false,
    explicitQuestions: questions,
    _isGroupTest: true,
    _groupTestId: test.id,
    _examGroupId: test.assignedGroupIds[0],
    _marksPerQ: test.marksPerQuestion ?? 4,
    _negativeMarks: test.negativeMarks ?? 1,
  };
}
