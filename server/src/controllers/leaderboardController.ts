import { Request, Response } from "express";
import { leaderboardService } from "../db/redis.js";
import { TestAttempt } from "../models/TestAttempt.js";

export async function getExamLeaderboard(req: Request, res: Response) {
  try {
    const { examId } = req.params;
    const { limit = "20" } = req.query;
    const limitNum = parseInt(limit as string, 10);

    const boardKey = `marks:leaderboard:${examId}`;
    const ranks = await leaderboardService.getTopRanks(boardKey, limitNum);

    // If Redis/Memory leaderboard is populated, enrich with student info
    if (ranks.length > 0) {
      const studentIds = ranks.map((r) => r.memberId);
      const attempts = await TestAttempt.find({
        examId,
        studentId: { $in: studentIds },
      })
        .select("studentId studentName totalScore accuracy submittedAt")
        .sort({ totalScore: -1 })
        .lean();

      const studentMap = new Map(attempts.map((a) => [a.studentId, a]));

      const enriched = ranks.map((r) => {
        const att = studentMap.get(r.memberId);
        return {
          rank: r.rank,
          studentId: r.memberId,
          studentName: att?.studentName || "Anonymous Student",
          score: r.score,
          accuracy: att?.accuracy || 0,
        };
      });

      return res.json({ success: true, count: enriched.length, leaderboard: enriched });
    }

    // Fallback directly to DB query
    const dbLeaderboard = await TestAttempt.find({ examId })
      .select("studentId studentName totalScore accuracy percentile rank")
      .sort({ totalScore: -1 })
      .limit(limitNum)
      .lean();

    const formatted = dbLeaderboard.map((item, idx) => ({
      rank: idx + 1,
      studentId: item.studentId,
      studentName: item.studentName,
      score: item.totalScore,
      accuracy: item.accuracy,
      percentile: item.percentile,
    }));

    return res.json({ success: true, count: formatted.length, leaderboard: formatted });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
