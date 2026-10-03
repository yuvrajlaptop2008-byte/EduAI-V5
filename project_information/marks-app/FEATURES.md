# Marks App — Feature Catalog & Matrix

> **Scope**: Complete multi-role platform feature matrix  
> **Priorities**: P0 (Launch Critical), P1 (High Value), P2 (Enhancement)  

---

## 1. Student Portal (`/app/*`)

| Feature ID | Feature Name | Description | Priority | Status |
|---|---|---|---|---|
| **STU-01** | **Adaptive Dashboard** | Daily streak counter, overall accuracy ring, XP rank, recent tests summary, and quick launch pads. | P0 | ✅ Active |
| **STU-02** | **NTA CBT Exam Simulator** | Full simulation of JEE Main/NEET test interface with timer, color-coded palette, and section switching. | P0 | ✅ Active |
| **STU-03** | **Chapter-wise PYQ Bank** | Over 10,000+ past year questions categorized by exam (2010–2025), subject, chapter, and difficulty. | P0 | ✅ Active |
| **STU-04** | **Daily Practice Problems (DPP)** | Daily structured problem sets for every chapter with completion tracking and score badges. | P0 | ✅ Active |
| **STU-05** | **Mistake Notebook** | Automated and manual collection of incorrect answers with diagnostic error tagging and spaced repetition. | P0 | ✅ Active |
| **STU-06** | **Formula Handbook** | Subject and chapter-level formula sheets with KaTeX formatting, revision checkboxes, and custom user notes. | P1 | ✅ Active |
| **STU-07** | **Interactive Solutions** | Step-by-step LaTeX explanations, video link embeds, and community question discussions. | P1 | ✅ Active |
| **STU-08** | **Deep Performance Analytics** | Topic-wise accuracy radars, time spent per question (speed vs accuracy matrix), and projected percentile. | P0 | ✅ Active |
| **STU-09** | **Real-Time Leaderboard** | Filterable rankings (Global, Institute, Exam Group, and Batch level) updated periodically. | P1 | ✅ Active |
| **STU-10** | **Offline Test Mode (PWA)** | Cached question assets allowing test completion during intermittent internet disconnects. | P1 | 🟡 In Progress |

---

## 2. Teacher & Faculty Portal (`/teacher/*`)

| Feature ID | Feature Name | Description | Priority | Status |
|---|---|---|---|---|
| **TCH-01** | **Faculty Command Center** | Overview of scheduled tests, active batches, student attendance rates, and recent test attempt counts. | P0 | ✅ Active |
| **TCH-02** | **CBT Test Creator** | Visual test builder with question picker, difficulty distribution charts, mark configs (+4/-1), and scheduling. | P0 | ✅ Active |
| **TCH-03** | **Batch Attendance Register** | Quick 1-click attendance marking (Present/Absent/Late) per date with percentage trends and absent alerts. | P0 | ✅ Active |
| **TCH-04** | **Student Roster & Profiles** | Deep view into individual student test histories, weak chapter diagnostics, attendance records, and DPP progress. | P0 | ✅ Active |
| **TCH-05** | **Faculty Remarks Engine** | Log behavioral, academic, or motivational remarks for students with option to publish to parents. | P1 | ✅ Active |
| **TCH-06** | **Test Results & Scorecards** | Instant score distributions, highest/median/lowest marks, question-wise failure rates, and attempt CSV exports. | P0 | ✅ Active |
| **TCH-07** | **Question Ingestion Wizard** | Rich KaTeX question editor with preview, tag management, and batch CSV import integration. | P1 | ✅ Active |
| **TCH-08** | **Attendance Trends & Heatmap** | 7-day and 30-day session grids highlighting consistently absent or late students. | P1 | ✅ Active |

---

## 3. Institute Admin Portal (`/admin/*`)

| Feature ID | Feature Name | Description | Priority | Status |
|---|---|---|---|---|
| **ADM-01** | **Super Admin Dashboard** | Platform vitals: active users, tests submitted today, system storage, pending question reviews, and audit logs. | P0 | ✅ Active |
| **ADM-02** | **Institute Hierarchy Management**| Multi-branch and batch builder with assignable branch admins and exam group cohorts. | P0 | ✅ Active |
| **ADM-03** | **Global Question Bank Manager** | Search, filter, edit, and bulk-delete questions across all subjects; approve/reject teacher submissions. | P0 | ✅ Active |
| **ADM-04** | **Bulk Question CSV Importer** | PapaParse-powered drag-and-drop CSV parser with schema validation, error row previews, and batch commit. | P0 | ✅ Active |
| **ADM-05** | **AI-Powered PDF Test Parser** | Upload scanned or typed coaching PDF papers; automated OCR/LLM extraction into formatted JSON questions. | P1 | ✅ Active |
| **ADM-06** | **User Role & RBAC Controller** | Search users, promote/demote roles (Student, Teacher, Admin), generate single-use invite codes. | P0 | ✅ Active |
| **ADM-07** | **Platform Emergency Controls** | Broadcast maintenance banners, toggle question review gates, and inspect immutable audit logs. | P0 | ✅ Active |
| **ADM-08** | **System Seed & Data Tools** | 1-click test dataset generator for institutes, mock students, and sample test series. | P1 | ✅ Active |

---

## 4. Parent Portal (`/parent/*`)

| Feature ID | Feature Name | Description | Priority | Status |
|---|---|---|---|---|
| **PAR-01** | **Multi-Child Dashboard** | Selector to toggle between multiple enrolled siblings with customized high-level overview cards. | P0 | ✅ Active |
| **PAR-02** | **Academic Progress Tracker** | Visual score trajectory over time, test-by-test percentile comparison, and accuracy breakdown by subject. | P0 | ✅ Active |
| **PAR-03** | **Attendance Record Book** | Monthly calendar heatmap showing days present, absent, or late with aggregate percentage. | P0 | ✅ Active |
| **PAR-04** | **Teacher Feedback Feed** | Direct timeline of remarks logged by institute teachers with timestamp and subject tag. | P1 | ✅ Active |
| **PAR-05** | **Automated PDF Report Card** | 1-click generation and download of printable academic report cards for offline archiving. | P1 | 🟡 In Progress |
| **PAR-06** | **Critical Alert Notifications**| Real-time alerts when student misses a scheduled test or drops below attendance thresholds. | P0 | ✅ Active |

---

## 5. Shared & Infrastructure Features

| Feature ID | Feature Name | Description | Priority | Status |
|---|---|---|---|---|
| **INF-01** | **RoleShell Master Layout** | Collapsible glass sidebar, responsive mobile drawer, and top navigation with notification bell. | P0 | ✅ Active |
| **INF-02** | **Unified Glassmorphism Theme**| Custom CSS design tokens with `#0b1326` dark background and role-specific color accents. | P0 | ✅ Active |
| **INF-03** | **Global Error Boundary** | High-reliability error interceptor preventing white-screen crashes with detailed diagnostic recovery options. | P0 | ✅ Active |
| **INF-04** | **Dynamic Toast Engine** | Sonner toast integration for immediate user feedback on success, error, or warning actions. | P0 | ✅ Active |
| **INF-05** | **Cloud Functions Automations** | Background rank calculation (`onTestSubmit`), custom claims assignment, and daily streak recalculation. | P0 | ✅ Active |
