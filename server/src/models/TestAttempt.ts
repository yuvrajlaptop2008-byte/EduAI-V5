import mongoose, { Schema, Document } from "mongoose";

export interface IQuestionResponse {
  questionId: mongoose.Types.ObjectId;
  selectedOption?: number; // 0-3
  numericalAnswer?: number;
  isCorrect: boolean;
  marksObtained: number;
  timeSpentSeconds: number;
  status: "answered" | "marked_review" | "unanswered" | "marked_and_answered";
}

export interface ISubjectScore {
  score: number;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  timeSpentSeconds: number;
}

export interface ITestAttempt extends Document {
  studentId: string; // Firebase UID or user UUID
  studentName: string;
  studentEmail?: string;
  examId: mongoose.Types.ObjectId;
  examTitle: string;
  responses: IQuestionResponse[];
  totalScore: number;
  maximumMarks: number;
  positiveMarks: number;
  negativeMarks: number;
  accuracy: number;
  totalTimeSpentSeconds: number;
  rank?: number;
  percentile?: number;
  subjectBreakdown: {
    Physics?: ISubjectScore;
    Chemistry?: ISubjectScore;
    Mathematics?: ISubjectScore;
    Biology?: ISubjectScore;
  };
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TestAttemptSchema = new Schema<ITestAttempt>(
  {
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String },
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true, index: true },
    examTitle: { type: String, required: true },
    responses: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
        selectedOption: { type: Number },
        numericalAnswer: { type: Number },
        isCorrect: { type: Boolean, required: true },
        marksObtained: { type: Number, required: true },
        timeSpentSeconds: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ["answered", "marked_review", "unanswered", "marked_and_answered"],
          default: "unanswered",
        },
      },
    ],
    totalScore: { type: Number, required: true },
    maximumMarks: { type: Number, required: true },
    positiveMarks: { type: Number, default: 0 },
    negativeMarks: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    totalTimeSpentSeconds: { type: Number, default: 0 },
    rank: { type: Number },
    percentile: { type: Number },
    subjectBreakdown: { type: Schema.Types.Mixed },
    submittedAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

TestAttemptSchema.index({ studentId: 1, submittedAt: -1 });
TestAttemptSchema.index({ examId: 1, totalScore: -1 });

export const TestAttempt = mongoose.model<ITestAttempt>("TestAttempt", TestAttemptSchema);
