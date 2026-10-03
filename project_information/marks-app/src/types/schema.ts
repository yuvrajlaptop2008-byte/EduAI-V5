// Core Schema Definitions for Marks App / EduAI V5

export type AppRole = "student" | "teacher" | "parent" | "admin" | "branch_admin" | "institute_admin";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: AppRole;
  instituteId?: string;
  branchId?: string;
  batchId?: string;
  examGroupId?: string;
  linkedStudentIds?: string[];
  streak: number;
  points: number;
  rank: number;
  dailyGoal?: number;
  profilePic?: string;
  theme?: "light" | "dark" | "system";
  lastCompletedDate?: string;
  onboarded: boolean;
  createdAt: number;
}

export interface Institute {
  id: string;
  name: string;
  logoURL: string;
  primaryColor: string;
  tagline: string;
  createdAt: number;
  createdBy: string;
}

export interface Branch {
  id: string;
  instituteId: string;
  name: string;
  address?: string;
  adminUids: string[];
  createdAt: number;
}

export interface Batch {
  id: string;
  instituteId: string;
  branchId: string;
  name: string;
  examGroupId: string;
  teacherIds: string[];
  studentIds: string[];
  startDate: string;
  endDate?: string;
  createdAt: number;
}

export type ExamGroupType = "JEE" | "JEE_ADV" | "NEET" | "School" | "Other";

export interface ExamGroup {
  id: string;
  instituteId: string;
  name: string;
  type: ExamGroupType;
  studentIds: string[];
  createdAt: number;
}

export interface GroupTest {
  id: string;
  instituteId: string;
  title: string;
  createdBy: string;
  createdByName: string;
  assignedGroupIds: string[];
  questionIds: string[];
  duration: number; // in minutes
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

export type AttendanceStatus = "present" | "absent" | "late";

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  groupId: string;
  markedBy: string;
  markedAt: number;
  students: Record<string, AttendanceStatus>;
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

export interface AuditLog {
  id: string;
  actorUid: string;
  actorName: string;
  role: string;
  action: string;
  targetCollection: string;
  targetId: string;
  details?: Record<string, any>;
  timestamp: number;
}
