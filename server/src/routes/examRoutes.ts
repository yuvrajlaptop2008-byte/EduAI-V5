import { Router } from "express";
import {
  getExams,
  getExamById,
  createExam,
} from "../controllers/examController.js";

const router = Router();

router.get("/", getExams);
router.get("/:id", getExamById);
router.post("/", createExam);

export default router;
