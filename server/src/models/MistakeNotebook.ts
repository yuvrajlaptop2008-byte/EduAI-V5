import mongoose, { Schema, Document } from "mongoose";

export interface IMistakeNotebook extends Document {
  studentId: string;
  questionId: mongoose.Types.ObjectId;
  attemptId?: mongoose.Types.ObjectId;
  examTitle?: string;
  subject: string;
  chapter: string;
  topic: string;
  errorCategory:
    | "Calculation Mistake"
    | "Formula Forgotten"
    | "Conceptual Error"
    | "Misread Question"
    | "Time Pressure"
    | "Guessed Wrong";
  userAnswer?: string;
  correctAnswer?: string;
  personalNotes?: string;
  revisionCount: number;
  isMastered: boolean;
  lastReviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MistakeNotebookSchema = new Schema<IMistakeNotebook>(
  {
    studentId: { type: String, required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    attemptId: { type: Schema.Types.ObjectId, ref: "TestAttempt" },
    examTitle: { type: String },
    subject: { type: String, required: true, index: true },
    chapter: { type: String, required: true, index: true },
    topic: { type: String, required: true },
    errorCategory: {
      type: String,
      enum: [
        "Calculation Mistake",
        "Formula Forgotten",
        "Conceptual Error",
        "Misread Question",
        "Time Pressure",
        "Guessed Wrong",
      ],
      default: "Conceptual Error",
    },
    userAnswer: { type: String },
    correctAnswer: { type: String },
    personalNotes: { type: String },
    revisionCount: { type: Number, default: 0 },
    isMastered: { type: Boolean, default: false, index: true },
    lastReviewedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

MistakeNotebookSchema.index({ studentId: 1, isMastered: 1, subject: 1 });

export const MistakeNotebook = mongoose.model<IMistakeNotebook>(
  "MistakeNotebook",
  MistakeNotebookSchema
);
