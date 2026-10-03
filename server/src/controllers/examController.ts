import { Request, Response } from "express";
import { Exam } from "../models/Exam.js";
import { Question } from "../models/Question.js";

export async function getExams(req: Request, res: Response) {
  try {
    const { examType, isPublished = "true" } = req.query;
    const filter: any = {};
    if (examType) filter.examType = examType;
    if (isPublished !== "all") filter.isPublished = isPublished === "true";

    let exams: any[] = [];
    if (Exam.db.readyState === 1) {
      try {
        exams = await Exam.find(filter)
          .select("-sections.questionIds")
          .sort({ createdAt: -1 })
          .lean();
      } catch (dbErr: any) {
        console.warn("[ExamController] MongoDB query warning, using fallback exam:", dbErr.message);
      }
    }

    return res.json({ success: true, count: exams.length, exams });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getExamById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id).populate({
      path: "sections.questionIds",
      model: "Question",
      select: "-solution", // Exclude solution during active exam taking
    });

    if (!exam) {
      return res.status(404).json({ success: false, error: "Exam not found" });
    }

    return res.json({ success: true, exam });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function createExam(req: Request, res: Response) {
  try {
    const {
      title,
      description,
      examType,
      durationMinutes,
      totalMarks,
      sections,
    } = req.body;

    if (!title || !examType || !sections || !Array.isArray(sections)) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, examType, sections",
      });
    }

    const newExam = await Exam.create({
      title,
      description,
      examType,
      durationMinutes: durationMinutes || 180,
      totalMarks: totalMarks || 300,
      sections,
      isPublished: true,
    });

    return res.status(201).json({ success: true, exam: newExam });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
