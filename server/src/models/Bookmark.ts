import mongoose, { Schema, Document } from "mongoose";

export interface IBookmark extends Document {
  studentId: string;
  questionId: mongoose.Types.ObjectId;
  folder: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    studentId: { type: String, required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    folder: { type: String, default: "Important Questions" },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

BookmarkSchema.index({ studentId: 1, questionId: 1 }, { unique: true });

export const Bookmark = mongoose.model<IBookmark>("Bookmark", BookmarkSchema);
