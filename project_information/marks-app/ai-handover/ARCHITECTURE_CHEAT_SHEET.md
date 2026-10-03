# Architecture Cheat Sheet — Marks App

> **Fast Lookup Reference**: Routes, Collections, Services, Utilities, and Common Pitfalls  

---

## 1. Route to Page Mapping

| Route Pattern | Role | Target Component | Description |
|---|---|---|---|
| `/login`, `/signup` | Public | `AuthPage.tsx` | Authentication and invite consumption |
| `/app` | Student | `StudentDashboard.tsx` | Home dashboard, streak, quick actions |
| `/app/tests` | Student | `TestsHub.tsx` | PYQ tests, custom tests, class group tests |
| `/app/tests/:testId` | Student | `TestInterface.tsx` | NTA-style CBT test runner |
| `/app/analysis` | Student | `AnalysisPage.tsx` | Accuracy, speed, weak chapter diagnostics |
| `/app/notebook` | Student | `MistakeNotebook.tsx` | Error log and spaced repetition revision |
| `/app/formulas` | Student | `FormulaHandbook.tsx`| Subject/chapter KaTeX formulas |
| `/teacher` | Teacher | `TeacherDashboard.tsx`| Faculty metrics, active tests, activity feed |
| `/teacher/create-test` | Teacher | `CreateGroupTest.tsx` | Test builder, question picker, scheduling |
| `/teacher/attendance` | Teacher | `AttendanceRegister.tsx`| Daily batch attendance marker |
| `/teacher/students` | Teacher | `StudentRoster.tsx` | Student profiles and test history |
| `/teacher/upload` | Teacher | `UploadQuestions.tsx`| Question authoring and CSV import |
| `/admin` | Admin | `AdminDashboard.tsx` | Super admin command center, vitals |
| `/admin/institutes` | Admin | `InstitutesList.tsx` | Multi-branch coaching hierarchy |
| `/admin/questions` | Admin | `QuestionBankAdmin.tsx`| Global question management & approvals |
| `/admin/users` | Admin | `UserManagement.tsx` | Role promotions, invite creation |
| `/admin/settings` | Admin | `PlatformSettings.tsx`| Maintenance banner, seed demo data |
| `/parent` | Parent | `ParentDashboard.tsx` | Child overview and report cards |
| `/parent/attendance` | Parent | `ParentAttendance.tsx`| Monthly attendance calendar heatmap |

---

## 2. Collection to Service Mapping

| Firestore Collection | Primary Service File | Key Exported Functions |
|---|---|---|
| `users` | `src/services/authService.ts` | `getUserProfile()`, `updateUserProfile()` |
| `institutes` | `src/services/institutesDB.ts` | `createInstitute()`, `listInstitutes()` |
| `branches` | `src/services/branchDB.ts` | `createBranch()`, `listBranches()` |
| `batches` | `src/services/batchDB.ts` | `createBatch()`, `listBatchesForBranch()` |
| `examGroups` | `src/services/examGroupsDB.ts` | `createExamGroup()`, `assignStudentToGroup()` |
| `custom_questions` | `src/utils/questionBank.ts` | `getQuestionsForChapter()`, `commitCustomQuestions()` |
| `groupTests` | `src/services/groupTestsDB.ts` | `createGroupTest()`, `listGroupTests()` |
| `groupTestAttempts` | `src/services/groupTestsDB.ts` | `submitAttempt()`, `listAttemptsForTest()` |
| `attendance` | `src/services/attendanceDB.ts` | `markAttendance()`, `getAttendance()` |
| `remarks` | `src/services/remarksDB.ts` | `addRemark()`, `listRemarksForStudent()` |
| `notifications` | `src/services/notificationsDB.ts`| `listNotifications()`, `markAllRead()` |
| `leaderboard` | `src/services/leaderboardDB.ts` | `getGlobalLeaderboard()`, `getBatchLeaderboard()` |
| `auditLogs` | `src/services/auditLogDB.ts` | `logAudit()`, `listRecentAuditLogs()` |

---

## 3. Common Developer Pitfalls & Anti-Patterns

| Anti-Pattern | Why It Breaks | Correct Pattern |
|---|---|---|
| **Direct Firestore query in page component** | Breaks decoupling; leaks DB logic across UI; makes testing impossible. | Always import from `src/services/*DB.ts`. |
| **Email-based admin check (`email.includes('@admin')`)** | Insecure! Anyone can register with that email string. | Check `userDoc.role === 'admin'`. |
| **Using `\frac` without KaTeX delimiter** | Renders as broken raw plaintext e.g. `\frac{1}{2}`. | Wrap in `$...$` or `$$...$$` and pass to `<KaTeXRenderer />`. |
| **Mutating `groupTestAttempts` directly from client** | Risk of cheating and score falsification. | Client writes raw answers and client score; Cloud Function computes canonical rank. |
| **Hardcoding mock data arrays** | Breaks production experience when real collections are empty. | Provide clean empty states with actionable buttons. |
