import { Router } from "express";
import {
  submitAttempt,
  getStudentAttempts,
  getAttemptAnalysis,
} from "../controllers/attemptController.js";

const router = Router();

router.post("/submit", submitAttempt);
router.get("/student/:studentId", getStudentAttempts);
router.get("/:id/analysis", getAttemptAnalysis);

export default router;
