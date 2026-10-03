# Compact Enterprise Project Context Memory (For AI Prompts)

> **Token Economy**: High-density context summary. Copy and paste this snippet to give any LLM full project grounding in ~1,400 tokens.

```markdown
=== MARKS APP / EDUAI V5 (ENTERPRISE HYBRID STACK) ===
PLATFORM: JEE/NEET CBT Exam Prep & Multi-Branch Coaching Management Platform
CONTAINERIZATION: Docker Compose (PostgreSQL, MongoDB, Redis, Payload CMS, Appsmith, Meilisearch, NGINX)

DATA PERSISTENCE MODEL:
1. PostgreSQL 16 (Relational ERP):
   - Tables: institutes, branches, batches, exam_groups, users, batch_students, batch_teachers, attendance_records, teacher_remarks, invites, audit_logs.
   - Handles: Multi-campus hierarchy, student rosters, daily attendance unique per date, user roles & RBAC.
2. MongoDB 7.0 (Document Store):
   - Collections: custom_questions, group_tests, group_test_attempts, mistake_notebook, community_solutions.
   - Handles: 50,000+ questions with LaTeX text, 4 options, solutions, exam attempts with raw answer maps.
3. Redis 7.2 (In-Memory Cache & Queues):
   - Structures: leaderboard:{testId} (ZSET for O(log N) rankings), active_exam:{studentId} (Hashes), BullMQ queues.
   - Handles: Sub-millisecond rank/percentile calculations and ephemeral test progress caching.
4. Payload CMS (Headless Content Engine - Port 3000):
   - Manages: Question editorial approvals, Formula Handbook, announcements, and media diagrams.
5. Appsmith CE (Internal Operations - Port 8090):
   - Manages: Low-code internal consoles (Institute onboarding, question QA review desk, attempt investigator).
6. Meilisearch v1.7 (Full-Text Search - Port 7700):
   - Handles: Typo-tolerant sub-10ms search across questions, topics, chapters, and tags.

FOUR ROLE NAMESPACES:
- Student (/app/*): Brand Orange (#ff6b00). PYQs, CBT test simulator, DPPs, Mistake Notebook, formula sheets, analytics.
- Teacher (/teacher/*): Indigo (#8083ff). Create/schedule CBT tests, mark attendance, student remarks, student performance profiles.
- Admin (/admin/*): Rose (#ef4444). Institutes, branches, batches, exam groups, question bank approval, CSV/PDF imports, audit logs.
- Parent (/parent/*): Emerald (#10b981). Child test history, attendance calendar, teacher remarks, score trends.

CODING CONSTRAINTS:
1. ZERO MOCK DATA: Query real databases via services. Render empty states if collections are empty.
2. MATH RENDERING: All LaTeX formulas in questions, options, and solutions must use KaTeX (<KaTeXRenderer />). Inline: $...$, Block: $$...$$.
3. CBT PALETTE: 5 states: not_visited (grey #6b7280), not_answered (red #ef4444), answered (green #10b981), marked_review (purple #8b5cf6), ans_marked_review (purple with green dot).
4. CSS CLASSES: .glass, .glass-hover, .glass-sidebar, .glass-topbar, .primary-gradient, .shimmer-bar, .input.
5. STABILITY: Strict TypeScript; no `any`. Error alerts via toast.error() from sonner.
======================================================
```
