// CBT Exam Engine Types & Question Models

export type QuestionSubject = "Physics" | "Chemistry" | "Mathematics" | "Biology";
export type QuestionDifficulty = "Easy" | "Medium" | "Hard";
export type QuestionExamType = "JEE Main" | "JEE Advanced" | "NEET" | "BITSAT";

export interface Question {
  id: number | string;
  subject: QuestionSubject;
  chapter: string;
  topic: string;
  difficulty: QuestionDifficulty;
  text: string;
  options: string[];
  correctAnswer: number; // 0, 1, 2, 3
  solution: string;
  exam: QuestionExamType;
  year?: number;
  language: "en" | "hi" | "both";
  tags: string[];
  status?: "active" | "pending" | "rejected";
  diagramUrl?: string;
  uploadedBy?: string;
  uploadedByName?: string;
}

export type QuestionPaletteStatus = 
  | "not_visited" 
  | "not_answered" 
  | "answered" 
  | "marked_review" 
  | "ans_marked_review";

export interface ExamSection {
  id: string;
  name: QuestionSubject;
  questionIds: Array<number | string>;
  totalMarks: number;
}

export interface ExamSessionState {
  testId: string;
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string | null>;
  markedForReview: Record<string, boolean>;
  visitedQuestions: Record<string, boolean>;
  remainingSeconds: number;
  isSubmitted: boolean;
}
