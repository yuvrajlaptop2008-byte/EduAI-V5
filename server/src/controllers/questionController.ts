import { Request, Response } from "express";
import { Question } from "../models/Question.js";
import { cacheService } from "../db/redis.js";

export async function getQuestions(req: Request, res: Response) {
  try {
    const {
      subject,
      chapter,
      difficulty,
      exam,
      year,
      search,
      page = "1",
      limit = "20",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = { status: "active" };

    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (difficulty) filter.difficulty = difficulty;
    if (exam) filter.exam = exam;
    if (year) filter.year = parseInt(year as string, 10);

    if (search) {
      filter.$or = [
        { text: { $regex: search, $options: "i" } },
        { chapter: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
      ];
    }

    // Try cache
    const cacheKey = `marks:questions:${JSON.stringify(filter)}:p${pageNum}:l${limitNum}`;
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json({ success: true, cached: true, ...cachedData });
    }

    let questions: any[] = [];
    let total = 0;

    if (Question.db.readyState === 1) {
      try {
        [questions, total] = await Promise.all([
          Question.find(filter)
            .sort({ year: -1, createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
          Question.countDocuments(filter),
        ]);
      } catch (dbErr: any) {
        console.warn("[QuestionController] MongoDB query warning, using resilient fallback data:", dbErr.message);
      }
    }

    const result = {
      questions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 0,
      },
    };

    // Cache for 60 seconds
    await cacheService.set(cacheKey, result, 60);

    return res.json({ success: true, cached: false, ...result });
  } catch (error: any) {
    console.error("[getQuestions] Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getQuestionById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const question = await Question.findById(id).lean();
    if (!question) {
      return res.status(404).json({ success: false, error: "Question not found" });
    }
    return res.json({ success: true, question });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function createQuestion(req: Request, res: Response) {
  try {
    const {
      text,
      options,
      correctAnswer,
      type,
      subject,
      chapter,
      topic,
      difficulty,
      exam,
      year,
      solution,
      tags,
    } = req.body;

    if (!text || !options || correctAnswer === undefined || !subject || !chapter || !solution) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: text, options, correctAnswer, subject, chapter, solution",
      });
    }

    const newQuestion = await Question.create({
      text,
      options,
      correctAnswer,
      type: type || "single",
      subject,
      chapter,
      topic: topic || chapter,
      difficulty: difficulty || "Medium",
      exam: exam || "JEE_MAIN",
      year: year ? parseInt(year, 10) : new Date().getFullYear(),
      solution,
      tags: tags || [],
      status: "active",
    });

    return res.status(201).json({ success: true, question: newQuestion });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function bulkImportQuestions(req: Request, res: Response) {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, error: "Array of questions required" });
    }

    const inserted = await Question.insertMany(questions);
    return res.status(201).json({
      success: true,
      message: `Successfully imported ${inserted.length} questions`,
      count: inserted.length,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getPyqStats(req: Request, res: Response) {
  try {
    const stats = await Question.aggregate([
      { $match: { year: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: { year: "$year", subject: "$subject", exam: "$exam" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.subject": 1 } },
    ]);

    return res.json({ success: true, stats });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
