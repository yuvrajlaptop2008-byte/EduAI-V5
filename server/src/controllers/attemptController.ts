import { Request, Response } from "express";
import { TestAttempt, IQuestionResponse } from "../models/TestAttempt.js";
import { Exam } from "../models/Exam.js";
import { Question } from "../models/Question.js";
import { MistakeNotebook } from "../models/MistakeNotebook.js";
import { leaderboardService } from "../db/redis.js";

export async function submitAttempt(req: Request, res: Response) {
  try {
    const {
      studentId,
      studentName,
      studentEmail,
      examId,
      responses, // Array of { questionId, selectedOption, numericalAnswer, timeSpentSeconds, status }
      totalTimeSpentSeconds = 0,
    } = req.body;

    if (!studentId || !examId || !Array.isArray(responses)) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: studentId, examId, responses",
      });
    }

    let exam: any = null;
    if (Exam.db.readyState === 1 && examId.length === 24) {
      try {
        exam = await Exam.findById(examId);
      } catch {}
    }

    if (!exam) {
      exam = {
        _id: examId,
        title: "JEE Main 2026 Official Full Mock #1",
        totalMarks: 300,
      };
    }

    // Fetch questions to evaluate answers
    const questionIds = responses.map((r: any) => r.questionId);
    let questions: any[] = [];
    if (Question.db.readyState === 1) {
      try {
        questions = await Question.find({ _id: { $in: questionIds } });
      } catch {}
    }

    if (questions.length === 0) {
      const { SAMPLE_QUESTIONS } = await import("../scripts/seed.js");
      questions = SAMPLE_QUESTIONS.map((q, idx) => ({
        _id: `fallback-q-${idx + 1}`,
        ...q,
      }));
    }

    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let totalScore = 0;
    let positiveMarks = 0;
    let negativeMarks = 0;
    let correctCount = 0;
    let attemptedCount = 0;

    const subjectBreakdown: Record<string, any> = {
      Physics: { score: 0, totalQuestions: 0, attempted: 0, correct: 0, incorrect: 0, timeSpentSeconds: 0 },
      Chemistry: { score: 0, totalQuestions: 0, attempted: 0, correct: 0, incorrect: 0, timeSpentSeconds: 0 },
      Mathematics: { score: 0, totalQuestions: 0, attempted: 0, correct: 0, incorrect: 0, timeSpentSeconds: 0 },
      Biology: { score: 0, totalQuestions: 0, attempted: 0, correct: 0, incorrect: 0, timeSpentSeconds: 0 },
    };

    const evaluatedResponses: IQuestionResponse[] = [];
    const mistakesToLog: any[] = [];

    for (const r of responses) {
      const q = questionMap.get(r.questionId.toString());
      if (!q) continue;

      const sub = q.subject || "Physics";
      if (!subjectBreakdown[sub]) {
        subjectBreakdown[sub] = { score: 0, totalQuestions: 0, attempted: 0, correct: 0, incorrect: 0, timeSpentSeconds: 0 };
      }
      subjectBreakdown[sub].totalQuestions += 1;
      subjectBreakdown[sub].timeSpentSeconds += r.timeSpentSeconds || 0;

      const isAttempted =
        r.selectedOption !== undefined && r.selectedOption !== null && r.selectedOption !== -1;

      let isCorrect = false;
      let marksObtained = 0;

      if (isAttempted) {
        attemptedCount += 1;
        subjectBreakdown[sub].attempted += 1;

        if (q.type === "numerical") {
          isCorrect = Math.abs(Number(r.numericalAnswer) - Number(q.correctAnswer)) < 0.01;
        } else {
          isCorrect = Number(r.selectedOption) === Number(q.correctAnswer);
        }

        if (isCorrect) {
          correctCount += 1;
          subjectBreakdown[sub].correct += 1;
          marksObtained = 4;
          positiveMarks += 4;
          totalScore += 4;
          subjectBreakdown[sub].score += 4;
        } else {
          subjectBreakdown[sub].incorrect += 1;
          marksObtained = -1;
          negativeMarks += 1;
          totalScore -= 1;
          subjectBreakdown[sub].score -= 1;

          // Automatically prepare entry for Mistake Notebook!
          mistakesToLog.push({
            studentId,
            questionId: q._id,
            examTitle: exam.title,
            subject: q.subject,
            chapter: q.chapter,
            topic: q.topic,
            errorCategory: "Conceptual Error",
            userAnswer: q.options[r.selectedOption]?.text || `Option ${r.selectedOption + 1}`,
            correctAnswer: q.options[q.correctAnswer]?.text || `Option ${q.correctAnswer + 1}`,
            revisionCount: 0,
            isMastered: false,
          });
        }
      }

      evaluatedResponses.push({
        questionId: q._id as any,
        selectedOption: r.selectedOption,
        numericalAnswer: r.numericalAnswer,
        isCorrect,
        marksObtained,
        timeSpentSeconds: r.timeSpentSeconds || 0,
        status: r.status || (isAttempted ? "answered" : "unanswered"),
      });
    }

    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

    // Calculate accuracy for subjects
    for (const sub of Object.keys(subjectBreakdown)) {
      const data = subjectBreakdown[sub];
      data.accuracy = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0;
    }

    let attempt: any = {
      _id: `attempt-${Date.now()}`,
      studentId,
      studentName: studentName || "Student",
      studentEmail,
      examId: exam._id,
      examTitle: exam.title,
      responses: evaluatedResponses,
      totalScore,
      maximumMarks: exam.totalMarks || 300,
      positiveMarks,
      negativeMarks,
      accuracy,
      totalTimeSpentSeconds,
      subjectBreakdown,
      submittedAt: new Date(),
      rank: 1,
      percentile: 100,
    };

    let myRank = 1;
    let percentile = 100;

    if (TestAttempt.db.readyState === 1) {
      try {
        const createdAttempt = await TestAttempt.create(attempt);
        attempt = createdAttempt;

        // Calculate Percentile
        const allScores = await TestAttempt.find({ examId: exam._id }).select("totalScore").lean();
        const scoresList = allScores.map((s) => s.totalScore).sort((a, b) => b - a);
        myRank = scoresList.indexOf(totalScore) + 1;
        percentile =
          scoresList.length > 1
            ? Math.round(((scoresList.length - myRank) / (scoresList.length - 1)) * 1000) / 10
            : 100;

        createdAttempt.rank = myRank;
        createdAttempt.percentile = percentile;
        await createdAttempt.save();

        // Insert logged mistakes
        if (mistakesToLog.length > 0 && MistakeNotebook.db.readyState === 1) {
          const enrichedMistakes = mistakesToLog.map((m) => ({ ...m, attemptId: createdAttempt._id }));
          await MistakeNotebook.insertMany(enrichedMistakes);
        }
      } catch (saveErr: any) {
        console.warn("[TestAttempt] DB write warning:", saveErr.message);
      }
    }

    // Record in Redis/In-Memory Leaderboard
    const boardKey = `marks:leaderboard:${exam._id.toString()}`;
    await leaderboardService.recordScore(boardKey, studentId, totalScore);

    return res.status(201).json({
      success: true,
      attemptId: attempt._id,
      score: totalScore,
      positiveMarks,
      negativeMarks,
      accuracy,
      rank: myRank,
      percentile,
      mistakesLogged: mistakesToLog.length,
      attempt,
    });
  } catch (error: any) {
    console.error("[submitAttempt] Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getStudentAttempts(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    let attempts: any[] = [];
    if (TestAttempt.db.readyState === 1) {
      attempts = await TestAttempt.find({ studentId })
        .select("-responses")
        .sort({ submittedAt: -1 })
        .lean();
    }

    return res.json({ success: true, count: attempts.length, attempts });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAttemptAnalysis(req: Request, res: Response) {
  try {
    const { id } = req.params;
    let attempt: any = null;
    if (TestAttempt.db.readyState === 1 && id.length === 24) {
      attempt = await TestAttempt.findById(id).populate({
        path: "responses.questionId",
        model: "Question",
      });
    }

    if (!attempt) {
      return res.status(404).json({ success: false, error: "Attempt not found" });
    }

    return res.json({ success: true, attempt });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
