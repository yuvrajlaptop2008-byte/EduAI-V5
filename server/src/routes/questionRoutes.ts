import { Router } from "express";
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  bulkImportQuestions,
  getPyqStats,
} from "../controllers/questionController.js";

const router = Router();

router.get("/", getQuestions);
router.get("/pyq-stats", getPyqStats);
router.get("/:id", getQuestionById);
router.post("/", createQuestion);
router.post("/bulk", bulkImportQuestions);

export default router;
