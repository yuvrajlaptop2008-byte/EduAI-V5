# API & Service Layer Specification — Marks App

> **Communication Style**: Direct Modular Firestore Services + Cloud Function HTTPS Callables  
> **Type Safety**: Strictly Typed Request & Response Payloads (TypeScript)  

---

## 1. Client Service Layer (`src/services/`)

### 1.1 Tests Service (`src/services/groupTestsDB.ts`)

#### `createGroupTest(data: Omit<GroupTest, "id" | "createdAt">): Promise<string>`
Creates a new test record in `groupTests`.
- **Parameters**: `title`, `instituteId`, `assignedGroupIds`, `questionIds`, `duration`, `totalMarks`, `marksPerQuestion`, `negativeMarks`, `scheduledAt`, `isPublished`.
- **Returns**: Newly generated `testId`.
- **Access**: Teachers and Admins only.

#### `submitAttempt(payload: SubmitAttemptPayload): Promise<string>`
Calculates client-side score and commits attempt record to `groupTestAttempts`.
- **Request Payload**:
  ```typescript
  interface SubmitAttemptPayload {
    testId: string;
    studentId: string;
    studentName: string;
    instituteId: string;
    examGroupId: string;
    answers: Record<string, string>; // questionId -> selectedOption (0, 1, 2, 3)
    markedForReview: string[];
    timeTakenSec: number;
    questions: Question[];           // Question objects with correctAnswer
  }
  ```
- **Returns**: Newly generated `attemptId`.
- **Side Effect**: Fires Cloud Function `onTestSubmit` to calculate dense rank and percentile.

#### `listAttemptsForTest(testId: string): Promise<GroupTestAttempt[]>`
Queries all student submissions for a given test, ordered by `score DESC, timeTakenSec ASC`.

---

### 1.2 Attendance Service (`src/services/attendanceDB.ts`)

#### `markAttendance(groupId: string, date: string, teacherId: string, records: Record<string, AttendanceStatus>): Promise<void>`
Writes daily batch attendance to `attendance/{groupId}/records/{date}`.
- **Payload**:
  - `groupId`: string
  - `date`: string ("YYYY-MM-DD")
  - `records`: `{ [studentUid: string]: "present" | "absent" | "late" }`

#### `getStudentAttendancePct(groupId: string, studentId: string, days?: number): Promise<number>`
Calculates attendance percentage over the past 30 or 60 days.

---

### 1.3 Remarks Service (`src/services/remarksDB.ts`)

#### `addRemark(data: CreateRemarkInput): Promise<string>`
Logs an academic or behavioral remark for a student.
- **Parameters**: `studentId`, `teacherId`, `teacherName`, `instituteId`, `examGroupId`, `subject`, `text`, `isParentVisible`.
- **Returns**: `remarkId`.
- **Side Effect**: Dispatches an in-app notification if `isParentVisible` is true.

---

### 1.4 Analytics & Leaderboard Service (`src/services/analyticsDB.ts`)

#### `getGlobalLeaderboard(period: "all" | "weekly" | "monthly", limitCount?: number): Promise<LeaderboardEntry[]>`
Fetches top performers sorted by `score DESC` from `leaderboard/{uid}`.

#### `buildStudentAnalytics(studentId: string): Promise<StudentAnalytics>`
Aggregates tests attempted, average accuracy, topic-wise strengths, and weak chapters.

---

## 2. Cloud Functions API Contracts (`functions/src/index.ts`)

### 2.1 Background Trigger: `onTestSubmit`
- **Trigger**: `onDocumentCreated("groupTestAttempts/{attemptId}")`
- **Execution Plan**:
  ```typescript
  export const onTestSubmit = onDocumentCreated("groupTestAttempts/{attemptId}", async (event) => {
    const attempt = event.data?.data();
    if (!attempt) return;

    const { testId, studentId, score } = attempt;

    // 1. Fetch all attempts for testId
    const attemptsSnap = await db.collection("groupTestAttempts")
      .where("testId", "==", testId)
      .orderBy("score", "desc")
      .orderBy("timeTakenSec", "asc")
      .get();

    const total = attemptsSnap.size;
    const batch = db.batch();

    // 2. Compute Dense Rank and Percentile
    attemptsSnap.docs.forEach((docSnap, index) => {
      const rank = index + 1;
      const percentile = parseFloat((((total - rank + 1) / total) * 100).toFixed(2));
      batch.update(docSnap.ref, { rank, percentile });
    });

    await batch.commit();
  });
  ```

### 2.2 HTTPS Callable: `assignRole`
- **Protocol**: HTTPS POST via Firebase Callable SDK (`httpsCallable(functions, 'assignRole')`)
- **Authentication**: Bearer Token (Firebase Auth Context required)
- **Request Body**:
  ```json
  {
    "inviteId": "inv_12345678",
    "targetUid": "abc123xyz",
    "role": "teacher"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Role claims assigned successfully",
    "assignedRole": "teacher"
  }
  ```

### 2.3 Scheduled Task: `dailyStreakReset`
- **Trigger**: Cloud Scheduler (Cron: `0 0 * * *` UTC)
- **Action**: Queries users where `lastCompletedDate < yesterday` and resets `streak = 0`.
