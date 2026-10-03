import { Request, Response } from "express";
import { MistakeNotebook } from "../models/MistakeNotebook.js";

export async function getStudentMistakes(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    const { subject, chapter, errorCategory, isMastered } = req.query;

    const filter: any = { studentId };
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (errorCategory) filter.errorCategory = errorCategory;
    if (isMastered !== undefined) filter.isMastered = isMastered === "true";

    let mistakes: any[] = [];
    if (MistakeNotebook.db.readyState === 1) {
      mistakes = await MistakeNotebook.find(filter)
        .populate("questionId")
        .sort({ createdAt: -1 })
        .lean();
    }

    return res.json({ success: true, count: mistakes.length, mistakes });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateMistake(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { errorCategory, personalNotes, isMastered } = req.body;

    const updateFields: any = { lastReviewedAt: new Date() };
    if (errorCategory) updateFields.errorCategory = errorCategory;
    if (personalNotes !== undefined) updateFields.personalNotes = personalNotes;
    if (isMastered !== undefined) {
      updateFields.isMastered = isMastered;
      if (isMastered) {
        updateFields.$inc = { revisionCount: 1 };
      }
    }

    const updated = await MistakeNotebook.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: "Mistake entry not found" });
    }

    return res.json({ success: true, mistake: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
