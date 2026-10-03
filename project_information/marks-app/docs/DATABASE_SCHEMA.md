# Database Schema Specification — Cloud Firestore

> **Storage Engine**: Google Cloud Firestore (NoSQL Document Store)  
> **Schema Enforcement**: TypeScript Interfaces + Firestore Security Rules  

---

## 1. Core User & Entity Schemas

### 1.1 `users/{uid}`
Primary user profile document mapped 1:1 with Firebase Authentication UID.

```typescript
interface UserDocument {
  uid: string;                       // Firebase Auth UID (Document ID)
  email: string;                     // Primary user email
  name: string;                      // Full display name
  role: "student" | "teacher" | "admin" | "parent"; // Primary system role
  instituteId?: string;              // Associated Institute ID (if enrolled)
  branchId?: string;                 // Branch ID
  batchId?: string;                  // Current active batch ID
  examGroupId?: string;              // Target exam cohort ("JEE", "NEET", etc.)
  linkedStudentIds?: string[];       // Array of student UIDs (for parent role)
  streak: number;                    // Consecutive days active counter
  points: number;                    // Cumulative XP points earned
  rank: number;                      // Global platform rank
  dailyGoal: number;                 // Daily questions target (e.g., 20)
  theme?: "light" | "dark" | "system"; // UI preference
  profilePic?: string;               // Avatar URL or DiceBear avatar seed
  lastCompletedDate?: string;        // "YYYY-MM-DD" of last solved problem
  onboarded: boolean;                // Whether user finished initial setup
  createdAt: number;                 // Epoch timestamp (ms)
}
```

---

## 2. Coaching Institute Hierarchy

### 2.1 `institutes/{instituteId}`
Top-level educational enterprise or coaching institution.

```typescript
interface InstituteDocument {
  id: string;                        // Unique Institute ID
  name: string;                      // e.g. "Apex IIT-JEE Academy"
  logoURL: string;                   // Public URL to branding asset
  primaryColor: string;              // Hex code for white-labeling (e.g. "#4F46E5")
  tagline: string;                   // Promotional motto
  createdBy: string;                 // UID of founding Super Admin
  createdAt: number;                 // Epoch timestamp (ms)
}
```

### 2.2 `branches/{branchId}`
Physical campus or digital regional branch belonging to an institute.

```typescript
interface BranchDocument {
  id: string;                        // Unique Branch ID
  instituteId: string;               // Foreign Key -> institutes/{instituteId}
  name: string;                      // e.g. "Kota Central Campus"
  address?: string;                  // Physical location
  adminUids: string[];               // UIDs of local branch admins
  createdAt: number;                 // Epoch timestamp (ms)
}
```

### 2.3 `batches/{batchId}`
A student cohort enrolled in a specific academic cycle.

```typescript
interface BatchDocument {
  id: string;                        // Unique Batch ID
  instituteId: string;               // Foreign Key -> institutes/{instituteId}
  branchId: string;                  // Foreign Key -> branches/{branchId}
  name: string;                      // e.g. "Droppers JEE 2026 Batch A"
  examGroupId: string;               // Target Exam Group ID
  teacherIds: string[];              // UIDs of faculty assigned to this batch
  studentIds: string[];              // UIDs of enrolled students
  startDate: string;                 // "YYYY-MM-DD"
  endDate?: string;                  // "YYYY-MM-DD"
  createdAt: number;                 // Epoch timestamp (ms)
}
```

### 2.4 `examGroups/{examGroupId}`
Exam target cohort categorization across an institute.

```typescript
interface ExamGroupDocument {
  id: string;                        // Unique Exam Group ID
  instituteId: string;               // Foreign Key -> institutes/{instituteId}
  name: string;                      // e.g. "JEE Advanced Rankers"
  type: "JEE" | "JEE_ADV" | "NEET" | "School" | "Other";
  studentIds: string[];              // Array of student UIDs
  createdAt: number;                 // Epoch timestamp (ms)
}
```

---

## 3. Question Bank & CBT Testing

### 3.1 `custom_questions/{questionId}`
The centralized repository of test and practice questions.

```typescript
interface QuestionDocument {
  id: number | string;               // Numerical or UUID Question ID
  subject: "Physics" | "Chemistry" | "Mathematics" | "Biology";
  chapter: string;                   // e.g. "Rotational Motion"
  topic: string;                     // e.g. "Moment of Inertia"
  difficulty: "Easy" | "Medium" | "Hard";
  text: string;                      // LaTeX/Markdown formatted question body
  options: string[];                 // Array of 4 formatted option strings
  correctAnswer: number;             // 0-indexed integer (0 for A, 1 for B, etc.)
  solution: string;                  // Detailed step-by-step LaTeX solution
  exam: "JEE Main" | "JEE Advanced" | "NEET" | "BITSAT";
  year?: number;                     // e.g. 2024
  language: "en" | "hi" | "both";    // Question language
  tags: string[];                    // e.g. ["PYQ", "NTA", "Shift-1"]
  status: "active" | "pending" | "rejected"; // Review lifecycle state
  uploadedBy: string;                // UID of teacher/admin who submitted
  uploadedByName: string;            // Name of author
  diagramUrl?: string;               // Optional image diagram attachment
  createdAt: number;                 // Epoch timestamp (ms)
}
```

### 3.2 `groupTests/{testId}`
Tests scheduled by faculty for batches or exam groups.

```typescript
interface GroupTestDocument {
  id: string;                        // Unique Test ID
  instituteId: string;               // Foreign Key -> institutes/{instituteId}
  title: string;                     // e.g. "Full Syllabus JEE Mock Test 04"
  createdBy: string;                 // UID of teacher
  createdByName: string;             // Display name of teacher
  assignedGroupIds: string[];        // Array of Exam Group IDs eligible to take test
  questionIds: string[];             // Array of question IDs in this test
  duration: number;                  // Duration in minutes (e.g., 180)
  totalMarks: number;                // e.g., 300
  marksPerQuestion: number;          // Default positive marks (e.g. 4)
  negativeMarks: number;             // Default negative penalty (e.g. 1)
  scheduledAt: number | null;        // Scheduled start timestamp (ms)
  isPublished: boolean;              // Visibility toggle
  createdAt: number;                 // Epoch timestamp (ms)
}
```

### 3.3 `groupTestAttempts/{attemptId}`
Individual student submissions and performance records for a group test.

```typescript
interface GroupTestAttemptDocument {
  id: string;                        // Unique Attempt ID
  testId: string;                    // Foreign Key -> groupTests/{testId}
  studentId: string;                 // Foreign Key -> users/{uid}
  studentName: string;               // Student full name
  instituteId: string;               // Associated Institute ID
  examGroupId: string;               // Student's Exam Group ID
  answers: Record<string, string>;   // Map of questionId -> selectedOptionIndex
  markedForReview: string[];         // Array of questionIds flagged for review
  score: number;                     // Net score computed (+4/-1)
  totalMarks: number;                // Maximum attainable marks
  rank: number | null;               // Dense rank computed by Cloud Function
  percentile: number | null;         // Normalized percentile (0 - 100)
  timeTakenSec: number;              // Total duration spent in seconds
  submittedAt: number;               // Epoch timestamp of completion (ms)
}
```

---

## 4. Academic Records & Communications

### 4.1 `attendance/{groupId}/records/{YYYY-MM-DD}`
Daily attendance log per exam group or batch.

```typescript
interface AttendanceRecordDocument {
  date: string;                      // "YYYY-MM-DD"
  groupId: string;                   // Foreign Key -> examGroups/{groupId}
  markedBy: string;                  // UID of teacher
  markedAt: number;                  // Epoch timestamp (ms)
  students: Record<string, "present" | "absent" | "late">; // Map of studentId -> status
}
```

### 4.2 `remarks/{remarkId}`
Teacher observations regarding student conduct or performance.

```typescript
interface RemarkDocument {
  id: string;                        // Unique Remark ID
  studentId: string;                 // Foreign Key -> users/{uid}
  teacherId: string;                 // Foreign Key -> users/{uid}
  teacherName: string;               // Teacher display name
  instituteId: string;               // Associated Institute ID
  examGroupId: string;               // Student's Exam Group ID
  subject: string;                   // e.g. "Physics"
  text: string;                      // Body of remark
  isParentVisible: boolean;          // Whether published to parent portal
  createdAt: number;                 // Epoch timestamp (ms)
}
```

### 4.3 `notifications/{notificationId}`
In-app notification records for students, teachers, and parents.

```typescript
interface NotificationDocument {
  id: string;                        // Unique Notification ID
  userId: string;                    // Recipient UID
  type: "low_score" | "missed_test" | "attendance" | "remark" | "announcement" | "homework";
  title: string;                     // Notification headline
  body: string;                      // Detailed message
  read: boolean;                     // Read receipt boolean
  link?: string;                     // Navigation route link (e.g. "/parent/remarks")
  createdAt: number;                 // Epoch timestamp (ms)
}
```

---

## 5. Security & System Management

### 5.1 `auditLogs/{logId}`
Append-only immutable record of sensitive operations.

```typescript
interface AuditLogDocument {
  id: string;                        // Unique Log ID
  actorUid: string;                  // UID of user who performed action
  actorName: string;                 // Name of user
  role: string;                      // Role at time of action
  action: string;                    // e.g. "CREATE_TEST", "BULK_CSV_IMPORT", "CHANGE_ROLE"
  targetCollection: string;          // e.g. "groupTests"
  targetId: string;                  // ID of affected entity
  details?: Record<string, any>;     // Additional diagnostic context
  timestamp: number;                 // Epoch timestamp (ms)
}
```

### 5.2 `invites/{inviteId}`
Single-use secure tokens for onboarding faculty and students.

```typescript
interface InviteDocument {
  id: string;                        // Unique Invite Token
  email: string;                     // Authorized email address
  role: "teacher" | "student" | "admin";
  instituteId: string;               // Target Institute ID
  examGroupId?: string;              // Pre-assigned group (optional)
  consumed: boolean;                 // False until used during signup
  consumedAt?: number;               // Epoch timestamp (ms)
  createdAt: number;                 // Epoch timestamp (ms)
}
```

### 5.3 `platform/config`
Single configuration document controlling global features.

```typescript
interface PlatformConfigDocument {
  announcement?: {
    message: string;                 // Text to display in global top banner
    type: "info" | "warning" | "alert";
    active: boolean;
  };
  maintenanceMode: boolean;          // If true, locks application for maintenance
  requireQuestionReview: boolean;    // If true, teacher questions must be approved by admin
}
```
