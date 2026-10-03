import { Router } from "express";
import { getExamLeaderboard } from "../controllers/leaderboardController.js";

const router = Router();

router.get("/:examId", getExamLeaderboard);

export default router;
