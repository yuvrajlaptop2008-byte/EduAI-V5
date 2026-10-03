import { Router } from "express";
import {
  getStudentMistakes,
  updateMistake,
} from "../controllers/mistakeController.js";

const router = Router();

router.get("/:studentId", getStudentMistakes);
router.patch("/:id", updateMistake);

export default router;
