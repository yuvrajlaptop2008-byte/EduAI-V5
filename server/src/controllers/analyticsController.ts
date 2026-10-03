import { Request, Response } from "express";
import { TestAttempt } from "../models/TestAttempt.js";
import { MistakeNotebook } from "../models/MistakeNotebook.js";

export async function getStudentAnalytics(req: Request, res: Response) {
  try {
    const { studentId } = req.params;

    let attempts: any[] = [];
    if (TestAttempt.db.readyState === 1) {
      attempts = await TestAttempt.find({ studentId })
        .sort({ submittedAt: 1 })
        .lean();
    }

    const totalTests = attempts.length;
    if (totalTests === 0) {
      return res.json({
        success: true,
        analytics: {
          totalTests: 0,
          averageScore: 0,
          highestScore: 0,
          averageAccuracy: 0,
          totalQuestionsAttempted: 0,
          subjectAccuracy: { Physics: 0, Chemistry: 0, Mathematics: 0, Biology: 0 },
          mistakesCount: 0,
          unresolvedMistakesCount: 0,
          scoreTrajectory: [],
        },
      });
    }

    let sumScore = 0;
    let highestScore = -Infinity;
    let sumAccuracy = 0;
    let totalQs = 0;

    const subjectStats: Record<string, { correct: number; attempted: number }> = {
      Physics: { correct: 0, attempted: 0 },
      Chemistry: { correct: 0, attempted: 0 },
      Mathematics: { correct: 0, attempted: 0 },
      Biology: { correct: 0, attempted: 0 },
    };

    const scoreTrajectory = attempts.map((a) => {
      sumScore += a.totalScore;
      if (a.totalScore > highestScore) highestScore = a.totalScore;
      sumAccuracy += a.accuracy || 0;

      // Extract subject breakdowns
      if (a.subjectBreakdown) {
        for (const [sub, data] of Object.entries(a.subjectBreakdown as Record<string, any>)) {
          if (subjectStats[sub]) {
            subjectStats[sub].correct += data.correct || 0;
            subjectStats[sub].attempted += data.attempted || 0;
            totalQs += data.attempted || 0;
          }
        }
      }

      return {
        date: a.submittedAt.toISOString().split("T")[0],
        examTitle: a.examTitle,
        score: a.totalScore,
        accuracy: a.accuracy,
        percentile: a.percentile || 0,
      };
    });

    const subjectAccuracy: Record<string, number> = {};
    for (const [sub, stat] of Object.entries(subjectStats)) {
      subjectAccuracy[sub] = stat.attempted > 0 ? Math.round((stat.correct / stat.attempted) * 100) : 0;
    }

    // Fetch mistake notebook counts
    const [totalMistakes, unresolvedMistakes] = await Promise.all([
      MistakeNotebook.countDocuments({ studentId }),
      MistakeNotebook.countDocuments({ studentId, isMastered: false }),
    ]);

    return res.json({
      success: true,
      analytics: {
        totalTests,
        averageScore: Math.round(sumScore / totalTests),
        highestScore,
        averageAccuracy: Math.round(sumAccuracy / totalTests),
        totalQuestionsAttempted: totalQs,
        subjectAccuracy,
        mistakesCount: totalMistakes,
        unresolvedMistakesCount: unresolvedMistakes,
        scoreTrajectory,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
