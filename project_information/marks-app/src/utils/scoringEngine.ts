import { Question } from "../types/exam";

export interface ScoreBreakdown {
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  netScore: number;
  maxMarks: number;
  accuracy: number; // percentage
}

export function calculateExamScore(
  answers: Record<string, string | null>,
  questions: Question[],
  marksPerQuestion: number = 4,
  negativeMarks: number = 1
): ScoreBreakdown {
  let correct = 0;
  let incorrect = 0;
  let attempted = 0;

  questions.forEach((q) => {
    const selected = answers[String(q.id)];
    if (selected !== undefined && selected !== null && selected !== "") {
      attempted++;
      if (Number(selected) === q.correctAnswer) {
        correct++;
      } else {
        incorrect++;
      }
    }
  });

  const unattempted = questions.length - attempted;
  const netScore = correct * marksPerQuestion - incorrect * negativeMarks;
  const maxMarks = questions.length * marksPerQuestion;
  const accuracy = attempted > 0 ? parseFloat(((correct / attempted) * 100).toFixed(1)) : 0;

  return {
    totalQuestions: questions.length,
    attempted,
    correct,
    incorrect,
    unattempted,
    netScore,
    maxMarks,
    accuracy,
  };
}
