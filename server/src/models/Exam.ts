import mongoose, { Schema, Document } from "mongoose";

export interface IExamSection {
  name: string;
  subject: "Physics" | "Chemistry" | "Mathematics" | "Biology";
  questionIds: mongoose.Types.ObjectId[];
  totalQuestions: number;
  maxToAttempt?: number; // E.g. section B 10 questions, attempt any 5
  marksPerCorrect: number;
  negativeMarks: number;
}

export interface IExam extends Document {
  title: string;
  description?: string;
  examType: "JEE_MAIN" | "JEE_ADV" | "NEET" | "CHAPTER_TEST" | "CUSTOM";
  durationMinutes: number;
  totalMarks: number;
  sections: IExamSection[];
  isPublished: boolean;
  scheduledAt?: Date;
  expiresAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    title: { type: String, required: true },
    description: { type: String },
    examType: {
      type: String,
      enum: ["JEE_MAIN", "JEE_ADV", "NEET", "CHAPTER_TEST", "CUSTOM"],
      required: true,
      index: true,
    },
    durationMinutes: { type: Number, required: true, default: 180 },
    totalMarks: { type: Number, required: true, default: 300 },
    sections: [
      {
        name: { type: String, required: true },
        subject: {
          type: String,
          enum: ["Physics", "Chemistry", "Mathematics", "Biology"],
          required: true,
        },
        questionIds: [{ type: Schema.Types.ObjectId, ref: "Question" }],
        totalQuestions: { type: Number, required: true },
        maxToAttempt: { type: Number },
        marksPerCorrect: { type: Number, default: 4 },
        negativeMarks: { type: Number, default: -1 },
      },
    ],
    isPublished: { type: Boolean, default: true, index: true },
    scheduledAt: { type: Date },
    expiresAt: { type: Date },
    createdBy: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Exam = mongoose.model<IExam>("Exam", ExamSchema);
