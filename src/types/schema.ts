// V4 schema additions — institutes, exam groups, remarks, attendance, attempts, imports.
// These are additive: existing per-user collections (notes, bookmarks, testReports,
// dpp_progress, customFormulas, custom_questions, class_tests) are untouched.

export interface Institute {
  id: string;
  name: string;
  logoURL: string;
  primaryColor: string;
  tagline: string;
  createdAt: number;
  createdBy: string;
}

export type ExamGroupType = "JEE" | "JEE_ADV" | "NEET" | "School" | "Other";

export interface ExamGroup {
  id: string;
  instituteId: string;
  name: string; // "JEE Main", "NEET", "Class 11 School"
  type: ExamGroupType;
  studentIds: string[];
  createdAt: number;
}

export interface RemarkDoc {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  instituteId: string;
  examGroupId: string;
  subject: string;
  text: string;
  isParentVisible: boolean;
  createdAt: number;
}

export type AttendanceStatus = "present" | "absent" | "late";

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  groupId: string;
  markedBy: string;
  markedAt: number;
  students: Record<string, AttendanceStatus>;
}

export interface GroupTest {
  id: string;
  instituteId: string;
  title: string;
  createdBy: string;
  createdByName: string;
  assignedGroupIds: string[];
  questionIds: string[];
  duration: number; // minutes
  totalMarks: number;
  marksPerQuestion: number;
  negativeMarks: number;
  scheduledAt: number | null;
  isPublished: boolean;
  createdAt: number;
}

export interface GroupTestAttempt {
  id: string;
  testId: string;
  studentId: string;
  studentName: string;
  instituteId: string;
  examGroupId: string;
  answers: Record<string, string | null>;
  markedForReview: string[];
  score: number;
  totalMarks: number;
  rank: number | null;
  percentile: number | null;
  timeTakenSec: number;
  submittedAt: number;
}

export interface ImportJob {
  id: string;
  uploadedBy: string;
  fileName: string;
  type: "csv" | "pdf";
  status: "processing" | "preview" | "done" | "error";
  totalRows: number;
  successRows: number;
  errorRows: number;
  errorLog: string[];
  createdAt: number;
}

// ── V5 additions ──────────────────────────────────────────────────────────────

export interface Branch {
  id: string;
  instituteId: string;
  name: string; // "Kota Branch", "Delhi Centre"
  address?: string;
  adminUids: string[]; // branch-level admins
  createdAt: number;
}

export interface Batch {
  id: string;
  instituteId: string;
  branchId: string;
  name: string; // "Batch A 2025", "Morning JEE"
  examGroupId: string;
  teacherIds: string[];
  studentIds: string[];
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  createdAt: number;
}

export type AppRole = "student" | "teacher" | "parent" | "admin" | "branch_admin" | "institute_admin";

export interface Notification {
  id: string;
  userId: string;
  type: "low_score" | "missed_test" | "attendance" | "remark" | "announcement" | "homework";
  title: string;
  body: string;
  read: boolean;
  link?: string;
  createdAt: number;
}

export interface ParentReport {
  id: string;
  parentId: string;
  studentId: string;
  period: "daily" | "weekly" | "monthly";
  periodLabel: string; // "2025-W23", "June 2025", "2025-06-22"
  testsAttempted: number;
  avgScore: number;
  avgAccuracy: number;
  attendancePct: number;
  rank: number | null;
  subjectBreakdown: Record<string, { correct: number; total: number }>;
  createdAt: number;
}

export interface LeaderboardEntry {
  uid: string;
  name: string;
  score: number;
  rank: number;
  accuracy: number;
  avatar?: string;
  examGroupId?: string;
  instituteId?: string;
  batchId?: string;
  period: "all" | "weekly" | "monthly";
  updatedAt: number;
}

export interface QuestionTag {
  subject: string;
  chapter: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  examType: string;
  year?: number;
  language: "en" | "hi" | "both";
  tags: string[];
  source?: string;
}
