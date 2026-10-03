# Changelog — Marks App

All notable changes to the Marks App platform will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [5.0.0] - 2026-10-01
### Added
- **Institute Multi-Branch Hierarchy**: Added `branches` and `batches` collections supporting multi-campus coaching structures.
- **Glassmorphism Design System**: Introduced cohesive `#0b1326` dark palette, `.glass` cards, and role-specific color accents (`#ff6b00` Student, `#8083ff` Teacher, `#ef4444` Admin, `#10b981` Parent).
- **PapaParse Question CSV Bulk Importer**: Drag-and-drop CSV parser with batch writing and error logging.
- **Serverless Re-ranking Pipeline**: Cloud Function trigger on `groupTestAttempts` to recalculate ranks and exact percentiles on every test submission.
- **Platform Control Center**: Real-time broadcast announcement banners and maintenance mode gates via `platform/config`.
- **Sonner Toast Integration**: Replaced basic alerts with smooth stacked toast notifications.

### Changed
- Refactored `firestore.rules` to remove legacy email-based admin checks in favor of strict role verification.
- Upgraded Tailwind configuration to v4.
- Standardized all mathematical rendering onto a dedicated KaTeX component with memoization.

---

## [4.0.0] - 2026-06-15
### Added
- **Multi-Role Portal Namespaces**: Separated routes into `/app`, `/teacher`, `/admin`, and `/parent`.
- **Teacher Suite**:
  - Test creation wizard with question selector.
  - Daily attendance register (Present, Absent, Late).
  - Student performance profiles and teacher remarks engine.
- **Parent Portal**:
  - Multi-child switching.
  - Academic progress trends and attendance history calendar.
- **Security Audit Logs**: Immutable recording of critical actions in `auditLogs/{id}`.

### Fixed
- Fixed session loss during page refresh in nested routes by standardizing `useAuth` listener.

---

## [3.0.0] - 2026-02-10
### Added
- **Pixel-Accurate NTA CBT Exam Interface**:
  - Question palette with NTA-standard color codes (Visited, Unvisited, Answered, Marked for Review).
  - Subject and section tabs (Physics, Chemistry, Maths/Biology).
  - Auto-save mechanism writing to `localStorage` every 10 seconds.
- **Mistake Notebook**: Automatic and manual error tracking with root cause classification tags.
- **Formula Handbook**: Chapter-wise quick revision cards with KaTeX formulas and notes.

---

## [2.0.0] - 2025-10-05
### Added
- **Chapter-wise PYQ Bank**: Comprehensive question bank covering 15+ years of JEE Main, Advanced, and NEET.
- **Daily Practice Problems (DPP)**: Structured chapter problem sets with completion badges.
- **Gamification Engine**: Daily streaks, XP points, and basic leaderboard rankings.

---

## [1.0.0] - 2025-05-01
### Added
- Initial MVP release.
- Firebase Auth integration (Email/Password & Google).
- Basic question practice mode with multiple choice selection.
- Single-page test scoring summary.
