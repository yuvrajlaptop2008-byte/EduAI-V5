import { apiClient, QuestionFilter } from "./apiClient";
import { db } from "../firebase";
import { collection, doc, setDoc, deleteDoc, getDocs, limit, query } from "firebase/firestore";
import type { Question } from "../utils/questionBank";

/**
 * EduAI Polyglot Cost-Reduction Service
 * 
 * Strategy to minimize Firebase Bills:
 * 1. High-Volume Reads (Questions, PYQs, Exams) -> Served from MongoDB Atlas & Redis Cache ($0 per-read fees).
 * 2. Relational Analytics (Institutes, Batches, Attendance, Ranks) -> Handled via PostgreSQL.
 * 3. Client Identity & Auth -> Managed by Firebase Auth (Free tier up to 50k MAUs).
 * 4. Real-time Events -> Cloud Firestore used ONLY for lightweight status flags & presence.
 */

export const dataService = {
  /**
   * Fetch questions with zero Firestore read tax.
   * Pulls from Redis Cache -> MongoDB Atlas -> Local fallback.
   */
  async getQuestions(filter: QuestionFilter = {}): Promise<{ questions: Question[]; total: number }> {
    try {
      const res = await apiClient.getQuestions(filter);
      if (res && res.success && Array.isArray(res.questions) && res.questions.length > 0) {
        // Map backend schema to frontend Question format
        const mapped: Question[] = res.questions.map((q: any, idx: number) => ({
          id: q.id || idx + 1,
          subject: q.subject || "Physics",
          chapter: q.chapter || "General",
          difficulty: (q.difficulty || "Medium") as "Easy" | "Medium" | "Hard",
          text: q.text || "",
          options: Array.isArray(q.options)
            ? q.options.map((opt: any) => (typeof opt === "string" ? opt : opt.text || ""))
            : [],
          correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
          solution: q.solution || "",
          communitySolutions: [],
          exam: q.exam || "JEE_MAIN",
          year: q.year,
          topic: q.topic,
          status: q.status || "active",
        }));

        return {
          questions: mapped,
          total: res.pagination?.total || mapped.length,
        };
      }
    } catch (apiErr) {
      console.warn("[DataService] Backend API unavailable, falling back to local cache:", apiErr);
    }

    // Fallback: local questions
    try {
      const saved = localStorage.getItem("custom_questions");
      if (saved) {
        const list: Question[] = JSON.parse(saved);
        let filtered = list;
        if (filter.subject) filtered = filtered.filter((q) => q.subject.toLowerCase() === filter.subject!.toLowerCase());
        if (filter.chapter) filtered = filtered.filter((q) => q.chapter.toLowerCase().includes(filter.chapter!.toLowerCase()));
        return { questions: filtered, total: filtered.length };
      }
    } catch {}

    return { questions: [], total: 0 };
  },

  /**
   * Get total question count without reading all documents into memory.
   * Saves thousands of Firestore read operations.
   */
  async getQuestionCount(): Promise<number> {
    try {
      const res = await apiClient.getQuestions({ limit: 1 });
      if (res && res.pagination?.total !== undefined) {
        return res.pagination.total;
      }
    } catch {}

    const saved = localStorage.getItem("custom_questions");
    if (saved) {
      try {
        return JSON.parse(saved).length;
      } catch {}
    }
    return 0;
  },

  /**
   * Save a newly created or uploaded question.
   * Dual writes to MongoDB (primary persistent store) and Firestore (lightweight mirror).
   */
  async saveQuestion(q: Partial<Question>): Promise<void> {
    const id = q.id || Date.now();
    const payload = {
      ...q,
      id,
      text: q.text || "",
      options: (q.options || []).map((o) => ({ text: o })),
      correctAnswer: q.correctAnswer ?? 0,
      subject: q.subject || "Physics",
      chapter: q.chapter || "General",
      difficulty: q.difficulty || "Medium",
      exam: q.exam || "JEE_MAIN",
      year: typeof q.year === "string" ? parseInt(q.year, 10) : q.year,
      solution: q.solution || "",
      status: q.status || "active",
    };

    // 1. Post to MongoDB Backend API (Free persistent storage)
    try {
      await fetch(`${apiClient.baseUrl}/api/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn("[DataService] MongoDB save skipped/queued:", err);
    }

    // 2. Update local storage for zero-latency client view
    try {
      const saved = localStorage.getItem("custom_questions");
      const list: Question[] = saved ? JSON.parse(saved) : [];
      const existingIdx = list.findIndex((item) => String(item.id) === String(id));
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...q } as Question;
      } else {
        list.unshift({ ...q, id } as Question);
      }
      localStorage.setItem("custom_questions", JSON.stringify(list));
      notifyQuestionBankChanged();
    } catch {}

    // 3. Sync to Firestore (non-blocking)
    try {
      await setDoc(doc(db, "custom_questions", String(id)), {
        ...q,
        id,
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.warn("[DataService] Firestore mirror skipped:", err);
    }
  },

  /**
   * Delete question from both MongoDB and Firestore.
   */
  async deleteQuestion(id: number | string): Promise<void> {
    try {
      await fetch(`${apiClient.baseUrl}/api/questions/${id}`, { method: "DELETE" });
    } catch {}

    try {
      const saved = localStorage.getItem("custom_questions");
      if (saved) {
        const list: Question[] = JSON.parse(saved);
        const filtered = list.filter((q) => String(q.id) !== String(id));
        localStorage.setItem("custom_questions", JSON.stringify(filtered));
        notifyQuestionBankChanged();
      }
    } catch {}

    try {
      await deleteDoc(doc(db, "custom_questions", String(id)));
    } catch {}
  },

  /**
   * Get exams without Firestore read costs.
   */
  async getExams(examType?: string) {
    try {
      const res = await apiClient.getExams(examType);
      if (res && res.success && Array.isArray(res.exams)) {
        return res.exams;
      }
    } catch (err) {
      console.warn("[DataService] Failed to load exams from API:", err);
    }
    return [];
  },
};

/**
 * Broadcast event across current tab and all open tabs that questions changed.
 */
export function notifyQuestionBankChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("eduai_questions_changed", { detail: { timestamp: Date.now() } }));
    try {
      const bc = new BroadcastChannel("eduai_questions_channel");
      bc.postMessage({ type: "QUESTIONS_CHANGED", timestamp: Date.now() });
      bc.close();
    } catch {}
  }
}

