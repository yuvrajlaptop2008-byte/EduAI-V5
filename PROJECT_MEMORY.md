# EduAI V5 — Project Memory
> **For AI Assistants**: Read this file completely before touching any code. This is the single source of truth. Do NOT re-audit the codebase from scratch — it wastes tokens. Jump straight to "What To Build Next".

---

## 1. What This Project Is

**EduAI** — A fully free, production-ready JEE/NEET exam prep platform for coaching institutes.

**Stack**: React 18 + TypeScript + Vite + Tailwind v4 + Firebase (Auth, Firestore, Storage, Functions) + Recharts + motion/react (Framer Motion) + Lucide icons + Sonner toasts

**Roles**: Student (`/app/*`), Teacher (`/teacher/*`), Admin (`/admin/*`), Parent (`/parent/*`)

**One codebase, 4 role-based route namespaces. No separate repos.**

---

## 2. Repository

- **GitHub**: `https://github.com/yuvrajlaptop2008-byte/EduAI-V5`
- **Branch**: `main`
- **Deploy**: Firebase Hosting → see `DEPLOY.md`
- **Firebase Project ID**: `sample-firebase-ai-app-92c68` (the dev/demo project; swap for production)

---

## 3. Architecture Decisions (Don't Re-debate These)

| Decision | Choice | Reason |
|---|---|---|
| Route structure | `/app` (student), `/teacher`, `/admin`, `/parent` | Flat, simple |
| Student pages location | `src/pages/*.tsx` (flat) | Not moved to `src/pages/student/` — zero functional impact |
| Question bank collection | `custom_questions` (Firestore) | All roles read/write here |
| Role assignment | Client-side invite consumption at signup, server-side Cloud Function fallback | See `invitesDB.ts` and `assignRole` CF |
| Test submission | Client-side rank calc → `groupTestAttempts`; CF does server-side re-rank | See `groupTestsDB.ts:submitAttempt` |
| Mock data | ZERO mock data anywhere — everything is real Firestore | Seed with `seedDemoData()` in Admin → Settings |

---

## 4. Firestore Collections (Complete List)

### Core
| Collection | Purpose |
|---|---|
| `users/{uid}` | All user accounts — fields: `role`, `name`, `email`, `instituteId`, `examGroupId`, `linkedStudentIds`, `streak`, `points`, `rank`, `onboarded` |
| `invites/{id}` | Role assignment invites — consumed on signup |
| `platform/config` | Announcement, maintenanceMode, requireQuestionReview |
| `auditLogs/{id}` | Admin/teacher action log |

### Institute Hierarchy
| Collection | Purpose |
|---|---|
| `institutes/{id}` | Name, logo, primaryColor, tagline |
| `branches/{id}` | instituteId, name, address, adminUids[] |
| `batches/{id}` | instituteId, branchId, examGroupId, teacherIds[], studentIds[] |
| `examGroups/{id}` | instituteId, name, type (JEE/JEE_ADV/NEET/School/Other), studentIds[] |

### Questions & Tests
| Collection | Purpose |
|---|---|
| `custom_questions/{id}` | id(number), subject, chapter, topic, difficulty, text, options[], correctAnswer(index), solution, exam, language, tags[], status(active/pending/rejected), uploadedBy, uploadedByName |
| `groupTests/{id}` | title, instituteId, createdBy, assignedGroupIds[], questionIds[], duration, totalMarks, marksPerQuestion, negativeMarks, scheduledAt, isPublished |
| `groupTestAttempts/{id}` | testId, studentId, studentName, examGroupId, instituteId, score, totalMarks, rank, percentile, timeTakenSec, submittedAt |

### Student Activity
| Collection | Purpose |
|---|---|
| `users/{uid}/dpp_progress/{chapterId}` | DPP completion per chapter (via `firestoreDppDB.ts`) |
| `notes/{id}` | Student notes |
| `bookmarks/{id}` | Bookmarked questions |
| `solutions/{id}` | Community solutions |
| `savedSolutions/{id}` | Saved solution references |
| `reports/{id}` | Question reports |
| `testReports` (localStorage + Firestore) | Personal test history from PYQ/custom tests |

### Teacher/Admin
| Collection | Purpose |
|---|---|
| `attendance/{groupId}/records/{YYYY-MM-DD}` | Per-day attendance |
| `remarks/{id}` | Teacher remarks per student |
| `notifications/{id}` | userId, type, title, body, read |

### Analytics & Leaderboard
| Collection | Purpose |
|---|---|
| `leaderboard/{uid}` | uid, name, score, rank, accuracy, examGroupId, batchId, instituteId, period(all/weekly/monthly) |
| `studentAnalytics/{uid}` | totalTests, avgScore, avgAccuracy, bestRank, subjectAccuracy, weeklyScores |
| `instituteAnalytics/{id}` | Aggregated per institute |
| `teacherAnalytics/{uid}` | testsCreated, avgScore, studentsReached |

### Imports
| Collection | Purpose |
|---|---|
| `pdf-imports/{uid}/...` | Firebase Storage for PDF uploads |

---

## 5. Service Layer (`src/services/`)

| File | What it does |
|---|---|
| `institutesDB.ts` | CRUD for institutes |
| `branchDB.ts` | CRUD for branches |
| `batchDB.ts` | CRUD for batches |
| `examGroupsDB.ts` | CRUD + `assignStudentToGroup`, `DEFAULT_GROUPS` |
| `groupTestsDB.ts` | Create/list/publish/delete tests, `submitAttempt` (with rank/percentile), `listAttemptsForTest`, `listAttemptsForStudent` |
| `remarksDB.ts` | `addRemark`, `listRemarksForStudent` (parentVisibleOnly flag), `deleteRemark` |
| `attendanceDB.ts` | `markAttendance`, `getAttendance`, `listRecentAttendance`, `studentAttendancePct` |
| `notificationsDB.ts` | `listNotifications`, `createNotification`, `markAllRead`, `unreadCount` |
| `leaderboardDB.ts` | `getGlobalLeaderboard`, `getGroupLeaderboard`, `getBatchLeaderboard`, `getInstituteLeaderboard` |
| `analyticsDB.ts` | `buildStudentAnalytics`, `getStudentAnalytics`, `getInstituteAnalytics`, `getTeacherAnalytics` |
| `invitesDB.ts` | `createInvite`, `listInvites`, `deleteInvite`, `consumeInviteForEmail` |
| `auditLogDB.ts` | `logAudit`, `listRecentAuditLogs` |

---

## 6. Key Utility Files

| File | What it does |
|---|---|
| `src/utils/roles.ts` | `normalizeRole()` maps "user"→"student", `ROLE_HOME` for post-login redirects |
| `src/utils/questionBank.ts` | Question type + `getQuestionsForChapter`, `getCustomQuestions`, `syncQuestionsFromFirestore` |
| `src/utils/groupTestBridge.ts` | Maps `GroupTest` → `ClassTest` shape for student `TestInterface` |
| `src/utils/csvImport.ts` | Papa Parse CSV → Question objects, `commitRows` (batch write with `extra` fields) |
| `src/utils/firestoreDppDB.ts` | `saveDppAttempt`, `getAllDppProgress`, `getChapterDppProgress` |
| `src/utils/analysis.ts` | `syncTestReports`, `getTestReports`, `overallStats`, `subjectStats`, `weakChapters` |
| `src/utils/seedDemoData.ts` | `seedDemoData()` — creates demo institute/groups/questions/users; `seedLeaderboardFromAttempts()` |

---

## 7. Component Library

| File | What it does |
|---|---|
| `src/components/layout/RoleShell.tsx` | **Master layout** — collapsible glass sidebar, mobile drawer, top bar with notification bell |
| `src/components/layout/StatCard.tsx` | Animated gradient stat card (used everywhere) |
| `src/components/Skeleton.tsx` | `SkeletonStatCards`, `SkeletonTable`, `SkeletonCards`, `SkeletonList`, `SkeletonPage` |
| `src/components/ErrorBoundary.tsx` | Wraps entire app — shows error + stack + recovery buttons |
| `src/components/PlatformBanner.tsx` | Reads `platform/config` — shows announcement banner + maintenance mode block |
| `src/components/NotificationBell.tsx` | Unread badge, navigates to `/parent/notifications` |
| `src/components/TestEngine/GroupTestRankBanner.tsx` | Rank banner shown after group test submission |
| `src/components/shared/CsvImportPanel.tsx` | Full CSV upload → preview → import flow. Accepts `extraFields` prop |

---

## 8. Design System

**Dark theme (teacher/admin)**: Background `#0b1326`, surface-container `#171f33`, primary `#c0c1ff`, secondary `#89ceff`, tertiary `#ddb7ff`

**CSS classes** (defined in `src/index.css`):
- `.glass` — frosted glass card (backdrop-filter, rgba border)
- `.glass-hover` — hover lift effect
- `.glass-sidebar` — sidebar background
- `.glass-topbar` — header background
- `.primary-gradient` — indigo/violet gradient button
- `.shimmer-bar` — animated shimmer for progress bars

**Role accent colors** (passed as `accentColor` to RoleShell):
- Student: `#ff6b00` (brand orange)
- Teacher: `#8083ff` (indigo)
- Admin: `#ef4444` (rose)
- Parent: `#10b981` (emerald)

**Student app**: Uses existing student dark UI with `bg-slate-900` patterns (different from admin/teacher glass UI)

---

## 9. Page Inventory (All Routes)

### Public
- `/` → Landing (EduAI branded, free plan CTA)
- `/login`, `/signup`

### Student (`/app/*`)
- `/app` → Home (streak, quick actions, attendance/remarks overlays, group test snapshot, analytics card)
- `/app/tests` → Tests (PYQ, custom, DPP, Class Tests via GroupTestBridge)
- `/app/notebook`, `/app/notebook/add`, `/app/notebook/:id`, `/app/notebook/:id/edit`
- `/app/formulas`, `/app/formulas/create`, `/app/formulas/:subjectId`, `/app/formulas/:subjectId/:chapterId/*`
- `/app/profile`, `/app/leaderboard`, `/app/analysis` (analytics), `/app/analytics` (StudentAnalytics page)
- `/app/exam/:examId`, `/app/dpp`, `/app/dpp/:examId`, `/app/dpp/chapter/:subject/:chapterId`, `/app/dpp/assignment/:dppId`

### Teacher (`/teacher/*`)
- `/teacher` → Dashboard (greeting, stats, quick actions, recent tests, activity)
- `/teacher/students` → Students roster (sort, search, attendance %, avg score, low-attendance alerts)
- `/teacher/students/:studentId` → StudentDetail (tabbed: overview/tests/remarks/attendance, dual charts, DPP progress)
- `/teacher/remarks` → Remarks (group+student select, add/view)
- `/teacher/attendance` → Mark Attendance (group+date select, present/absent/late buttons)
- `/teacher/attendance/trends` → Trends (line chart, per-student bar chart, low-attendance alerts, 7-session grid)
- `/teacher/tests` → My Tests (filter tabs, attempt counts, publish/unpublish)
- `/teacher/create-test` → Create Test (question picker with search/filter/bulk-select, config panel, scheduling)
- `/teacher/tests/:testId/results` → Results (stat cards, score bar chart, leaderboard table)
- `/teacher/upload` → Upload Questions (Manual form with topic/language/tags + CSV Import tab)

### Admin (`/admin/*`)
- `/admin` → Dashboard (alerts, 6 stat cards, recent submissions, audit log, quick nav)
- `/admin/analytics` → Platform Analytics (attempts by day, role pie chart, top performers)
- `/admin/institutes` → Institute list (card grid, create)
- `/admin/institutes/:id` → Institute Detail (Branding / Members+Invites / Exam Groups / Analytics tabs)
- `/admin/institutes/:id/branches` → Branches & Batches management
- `/admin/users` → All Users (table with role-change dropdown, CSV export, select+filter)
- `/admin/questions` → Question Bank (stats, language filter, status filter pills, approve/reject, edit modal, bulk delete)
- `/admin/import` → CSV Import
- `/admin/import/pdf` → PDF→AI Import (upload → Claude parses → preview → import)
- `/admin/settings` → Settings (announcement, maintenance, question review toggle, audit log, seed demo, rebuild leaderboard)

### Parent (`/parent/*`)
- `/parent` → Dashboard (child selector, 4 stat cards, DPP count, remarks count, quick links)
- `/parent/progress` → Progress (score trend + accuracy charts, period filter)
- `/parent/attendance` → Attendance calendar
- `/parent/remarks` → Remarks (subject filter)
- `/parent/reports` → Reports (weekly/monthly charts)
- `/parent/notifications` → Notifications feed (mark all read)

---

## 10. Cloud Functions (`functions/src/index.ts`)

| Function | Trigger | Status |
|---|---|---|
| `onTestSubmit` | `groupTestAttempts` doc create | Recalculates rank+percentile for all attempts on that test |
| `assignRole` | HTTPS callable | Server-side invite verify → Firebase Auth custom claim |
| `dailyStreakReset` | Scheduled every 24h | Resets streak for users with stale `lastCompletedDate` |

**Deploy**: `firebase deploy --only functions` (requires Blaze plan)

---

## 11. Firestore Security Rules Summary

All collections covered. Key rules:
- `isAdmin()` = role=="admin" in Firestore doc (no email backdoor — removed in security audit)
- `isTeacher()`, `isParentRole()` helper functions
- Students can only read their own attempts/notes/bookmarks
- Teachers can write tests, questions (pending when review flag is on), attendance, remarks
- Admin can write everything
- `leaderboard` — read all, write admin/teacher (CF updates in prod)
- `auditLogs` — read admin only, create teacher/admin, immutable (no update/delete)
- **Full rules file**: `firestore.rules`

---

## 12. Firestore Indexes (`firestore.indexes.json`)

14 composite indexes total. Key ones:
- `groupTests`: (assignedGroupIds ARRAY_CONTAINS, isPublished ASC), (createdBy ASC, createdAt DESC)
- `groupTestAttempts`: (testId ASC, score DESC), (studentId ASC, submittedAt DESC)
- `remarks`: (studentId ASC, createdAt DESC), (studentId ASC, isParentVisible ASC, createdAt DESC)
- `leaderboard`: period+rank, examGroupId+period+rank, batchId+period+rank, instituteId+period+rank
- `notifications`: (userId ASC, createdAt DESC), (userId ASC, read ASC)
- `batches`: (instituteId ASC, branchId ASC)

---

## 13. What To Build Next (Priority Order)

### 🔴 INCOMPLETE (must do before launch)
1. **Teacher → CreateGroupTest visual upgrade** — Apply the glass design from the HTML reference: left config panel (glass card) + right question list with `shimmer-bar` progress, difficulty chart, drag-to-add UI
2. **Admin → QuestionBank** — Apply three-panel layout from HTML reference: left filter sidebar (subject/chapter/difficulty/exam chips), center question list (glass cards with ID/usage stats/success rate), right quick-add panel
3. **Teacher → Dashboard activity feed** — Real timeline with `before:` CSS connector line (like the HTML reference)
4. **Student → Tests "Class Tests" tab** — Empty state when no exam group assigned

### 🟡 PARTIALLY DONE (improve)
5. **Leaderboard** — Currently falls back to `groupTestAttempts` if `leaderboard` collection is empty. Add periodic rebuild via Cloud Function trigger
6. **Parent Reports** — Add PDF export button (uses `window.print()` or jsPDF)
7. **CSV Import** — `commitRows` is wired but the template download link is broken (points to a dead CSV string)

### 🟢 NICE TO HAVE
8. **Question CSV template** — Generate proper template from `CSV_TEMPLATE` constant in `csvImport.ts`
9. **PWA icons** — `public/icons/` directory is referenced in `manifest.json` but icons don't exist (add placeholder or generate)
10. **Firebase App Check** — Not yet implemented (security improvement)

---

## 14. How To Resume Any Session

```
1. Read this file top-to-bottom (don't skip)
2. Check "What To Build Next" — pick the next item
3. The codebase is at /home/claude/project/unified (if in same env)
   OR unzip EduAI-V5.zip and cd into it
4. Run: npm install && npx tsc --noEmit
5. Start coding — don't re-explore what's already built
```

**Code style**:
- Dark UI pages: use `.glass`, `.glass-sidebar`, `.shimmer-bar` CSS classes + `#0b1326` bg
- Student pages: use `bg-slate-900`, Tailwind dark: classes, brand orange (#ff6b00)
- All new form inputs use `.input` utility class (defined in `src/index.css`)
- Animations via `motion/react` (Framer Motion v11)
- Icons from `lucide-react` only
- Data via service files in `src/services/` — never write raw Firestore queries in page components

---

## 15. Before Going Live Checklist

- [ ] Replace `firebase-applet-config.json` with production Firebase project config
- [ ] Set `role: "admin"` on first admin user doc in Firestore Console (no self-promotion possible)
- [ ] Run `firebase deploy` (hosting + firestore:rules + firestore:indexes)
- [ ] Deploy Cloud Functions: `firebase deploy --only functions`
- [ ] Test Firestore rules: `firebase emulators:start`
- [ ] Enable Firebase App Check in Console
- [ ] Add authorized domains in Firebase Auth → Settings
- [ ] Seed demo data: Admin → Settings → "Seed Demo Data"
- [ ] Rebuild leaderboard: Admin → Settings → "Rebuild Leaderboard"
- [ ] Update `public/sitemap.xml` og:url with real domain
- [ ] Generate real PWA icons (512×512, 192×192 etc.) and put in `public/icons/`
