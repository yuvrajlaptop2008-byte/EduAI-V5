import mongoose, { Schema, Document } from "mongoose";

export interface IOption {
  text: string;
  image?: string;
}

export interface IQuestion extends Document {
  text: string;
  options: IOption[];
  correctAnswer: number; // 0-3 for MCQs, or numerical value
  type: "single" | "multiple" | "numerical" | "assertion_reason";
  subject: "Physics" | "Chemistry" | "Mathematics" | "Biology";
  chapter: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  exam: "JEE_MAIN" | "JEE_ADV" | "NEET" | "BOARDS";
  year?: number;
  shift?: string;
  solution: string;
  hints?: string[];
  tags: string[];
  status: "active" | "pending" | "flagged";
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    options: [
      {
        text: { type: String, required: true },
        image: { type: String },
      },
    ],
    correctAnswer: { type: Number, required: true },
    type: {
      type: String,
      enum: ["single", "multiple", "numerical", "assertion_reason"],
      default: "single",
    },
    subject: {
      type: String,
      enum: ["Physics", "Chemistry", "Mathematics", "Biology"],
      required: true,
      index: true,
    },
    chapter: { type: String, required: true, index: true },
    topic: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
      index: true,
    },
    exam: {
      type: String,
      enum: ["JEE_MAIN", "JEE_ADV", "NEET", "BOARDS"],
      required: true,
      index: true,
    },
    year: { type: Number, index: true },
    shift: { type: String },
    solution: { type: String, required: true },
    hints: [{ type: String }],
    tags: [{ type: String, index: true }],
    status: {
      type: String,
      enum: ["active", "pending", "flagged"],
      default: "active",
      index: true,
    },
    uploadedBy: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high-speed querying
QuestionSchema.index({ subject: 1, chapter: 1, difficulty: 1 });
QuestionSchema.index({ exam: 1, year: -1 });

export const Question = mongoose.model<IQuestion>("Question", QuestionSchema);
