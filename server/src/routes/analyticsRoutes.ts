import { Router } from "express";
import { getStudentAnalytics } from "../controllers/analyticsController.js";

const router = Router();

router.get("/student/:studentId", getStudentAnalytics);

export default router;
