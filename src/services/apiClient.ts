/// <reference types="vite/client" />
/**
 * EduAI & Marks App — Universal API Client
 * Seamlessly connects React Frontend to Node.js/Express Backend & Polyglot Database Cluster
 */

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "http://localhost:5050");

export interface QuestionFilter {
  subject?: string;
  chapter?: string;
  difficulty?: string;
  exam?: string;
  year?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export const apiClient = {
  baseUrl: API_BASE_URL,

  async getHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      return await res.json();
    } catch (e: any) {
      return { status: "offline", error: e.message };
    }
  },

  async getQuestions(filter: QuestionFilter = {}) {
    const params = new URLSearchParams();
    if (filter.subject) params.append("subject", filter.subject);
    if (filter.chapter) params.append("chapter", filter.chapter);
    if (filter.difficulty) params.append("difficulty", filter.difficulty);
    if (filter.exam) params.append("exam", filter.exam);
    if (filter.year) params.append("year", filter.year.toString());
    if (filter.search) params.append("search", filter.search);
    if (filter.page) params.append("page", filter.page.toString());
    if (filter.limit) params.append("limit", filter.limit.toString());

    const res = await fetch(`${API_BASE_URL}/api/questions?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  },

  async getExams(examType?: string) {
    const url = examType
      ? `${API_BASE_URL}/api/exams?examType=${encodeURIComponent(examType)}`
      : `${API_BASE_URL}/api/exams`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  },

  async getExamById(id: string) {
    const res = await fetch(`${API_BASE_URL}/api/exams/${id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  },

  async submitAttempt(payload: {
    studentId: string;
    studentName: string;
    studentEmail?: string;
    examId: string;
    responses: Array<{
      questionId: string;
      selectedOption?: number;
      numericalAnswer?: number;
      timeSpentSeconds?: number;
      status?: string;
    }>;
    totalTimeSpentSeconds: number;
  }) {
    const res = await fetch(`${API_BASE_URL}/api/attempts/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  },

  async getStudentAttempts(studentId: string) {
    const res = await fetch(`${API_BASE_URL}/api/attempts/student/${studentId}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  },

  async getAttemptAnalysis(attemptId: string) {
    const res = await fetch(`${API_BASE_URL}/api/attempts/${attemptId}/analysis`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  },

  async getMistakes(studentId: string, filter: { subject?: string; isMastered?: boolean } = {}) {
    const params = new URLSearchParams();
    if (filter.subject) params.append("subject", filter.subject);
    if (filter.isMastered !== undefined) params.append("isMastered", String(filter.isMastered));

    const res = await fetch(`${API_BASE_URL}/api/mistakes/${studentId}?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  },

  async updateMistake(id: string, update: { errorCategory?: string; personalNotes?: string; isMastered?: boolean }) {
    const res = await fetch(`${API_BASE_URL}/api/mistakes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  },

  async getLeaderboard(examId: string, limit = 20) {
    const res = await fetch(`${API_BASE_URL}/api/leaderboard/${examId}?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  },

  async getStudentAnalytics(studentId: string) {
    const res = await fetch(`${API_BASE_URL}/api/analytics/student/${studentId}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  },
};
