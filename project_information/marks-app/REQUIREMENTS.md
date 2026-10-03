# Marks App — Requirements Specification

> **Classification**: Functional (FR) & Non-Functional (NFR) Requirements  
> **Status**: Verified for Implementation  

---

## 1. Functional Requirements (FR)

### 1.1 Authentication & Onboarding
- **FR-AUTH-01**: The system must allow users to register and sign in via Email/Password and Google OAuth.
- **FR-AUTH-02**: First-time users must be redirected to role selection or consume a designated invite token (`/invite/:token`).
- **FR-AUTH-03**: The system must enforce role resolution so that users are automatically redirected to their designated namespace (`/app`, `/teacher`, `/admin`, `/parent`).
- **FR-AUTH-04**: Parent accounts must support linking to multiple student accounts via student phone number/email or secret pairing PIN.
- **FR-AUTH-05**: Sessions must persist securely using Firebase Auth local persistence across browser refreshes and tab closures.

### 1.2 NTA-Style Computer Based Test (CBT) Engine
- **FR-CBT-01**: The engine must replicate the official NTA JEE/NEET interface, displaying:
  - Synchronized countdown timer with visual warning at `< 5 minutes`.
  - Question status color codes:
    - **Grey**: Not visited
    - **Red**: Visited, not answered
    - **Green**: Answered
    - **Purple**: Marked for review
    - **Purple with Green dot**: Answered and marked for review (evaluated in scoring)
  - Subject/Section tabs (Physics, Chemistry, Mathematics / Biology).
  - Question palette sidebar with quick-jump capability.
- **FR-CBT-02**: The engine must support multiple question types:
  - Single Correct Choice (MCQ with 4 radio options)
  - Multiple Correct Choice (checkbox options with partial marking)
  - Numerical Value Type (virtual numeric keypad or text input with tolerance rules)
- **FR-CBT-03**: The engine must auto-save user responses to `localStorage` and `groupTestAttempts/{attemptId}` every 10 seconds or on every option click.
- **FR-CBT-04**: In case of network disconnection or accidental browser crash, the test must resume from the exact remaining time and restore all previous answers without data loss.
- **FR-CBT-05**: Fullscreen mode and tab-switch monitoring must be supported with configurable warnings before auto-submission.

### 1.3 Question Bank & PYQ System
- **FR-QB-01**: Aspirants must be able to filter questions by Exam (JEE Main, Advanced, NEET), Subject, Chapter, Topic, Year (2010–2025), and Difficulty (Easy, Medium, Hard).
- **FR-QB-02**: All math formulas and chemical equations must render using KaTeX with inline (`$...$`) and block (`$$...$$`) delimiters.
- **FR-QB-03**: Questions must support attached diagrams, high-resolution SVG/PNG assets, and tabular data.
- **FR-QB-04**: Users must be able to view comprehensive step-by-step LaTeX solutions immediately in practice mode or after test submission.

### 1.4 Mistake Notebook & Bookmarking
- **FR-MN-01**: Any incorrectly answered question must be addable to the user's "Mistake Notebook" with 1-click.
- **FR-MN-02**: Users must be able to tag mistakes with root-cause labels:
  - `Conceptual Error`
  - `Calculation Mistake`
  - `Misread Question / Silly Error`
  - `Ran Out of Time`
- **FR-MN-03**: Users must be able to schedule spaced-repetition re-tests for bookmarked or mistaken questions.

### 1.5 Teacher & Faculty Suite
- **FR-TCH-01**: Teachers must be able to create custom group tests by selecting questions from the global question bank or uploading custom questions.
- **FR-TCH-02**: Teachers must be able to set test parameters: duration, positive marks (+4), negative marks (-1), scheduled start time, and target Exam Groups/Batches.
- **FR-TCH-03**: Teachers must be able to mark daily attendance (Present, Absent, Late) per batch and view attendance percentage alerts.
- **FR-TCH-04**: Teachers must be able to write student remarks with a toggle for `isParentVisible`.

### 1.6 Admin & Institute Management Suite
- **FR-ADM-01**: Super Admins and Institute Admins must be able to create Institutes, Branches, Batches, and Exam Groups.
- **FR-ADM-02**: Admins must be able to bulk-import questions via CSV with real-time validation and error previews.
- **FR-ADM-03**: Admins must be able to review, approve, edit, or reject faculty-submitted questions before they enter the public question bank.
- **FR-ADM-04**: Admins must be able to manage user roles, deactivate accounts, and export audit reports.

### 1.7 Parent Portal
- **FR-PAR-01**: Parents must be able to switch between multiple enrolled children.
- **FR-PAR-02**: Parents must be able to view attendance calendars, test score trajectories, and teacher feedback.
- **FR-PAR-03**: Parents must receive instant in-app and push notifications for low test scores (`< 40%`) or consecutive absences.

---

## 2. Non-Functional Requirements (NFR)

### 2.1 Performance & Latency
- **NFR-PERF-01**: Page load time for dashboard views must be `< 1.5s` on a 4G connection (10 Mbps).
- **NFR-PERF-02**: Question navigation in the CBT engine must respond in `< 30ms` with zero UI freezing.
- **NFR-PERF-03**: KaTeX typesetting for a question with 5 equations must complete in `< 10ms`.

### 2.2 Scalability & Concurrency
- **NFR-SCAL-01**: The system must sustain 10,000 concurrent students submitting tests simultaneously without database deadlock or 5xx errors.
- **NFR-SCAL-02**: Firestore read operations must be cached aggressively on the client using local indexed caching.

### 2.3 Reliability & Availability
- **NFR-REL-01**: Overall platform availability target is `99.9%` uptime.
- **NFR-REL-02**: Zero data loss guarantee: test answers must be buffered locally in `IndexedDB`/`localStorage` before cloud transmission.

### 2.4 Security & Data Privacy
- **NFR-SEC-01**: All database reads and writes must pass through strictly enforced `firestore.rules`.
- **NFR-SEC-02**: Admin and Teacher actions must require role verification; email string matching is prohibited.
- **NFR-SEC-03**: Student test papers must remain confidential until the test conclusion window closes.
- **NFR-SEC-04**: User passwords and personal data must comply with standard cryptographic best practices (Firebase Auth PBKDF2/scrypt).

### 2.5 Usability & Accessibility (a11y)
- **NFR-USE-01**: Minimum contrast ratio of 4.5:1 for standard text (WCAG 2.1 Level AA compliance).
- **NFR-USE-02**: Keyboard navigation support (Tab, Enter, Arrow keys, 1-4 for options) during tests.
- **NFR-USE-03**: Clean responsiveness across mobile phones (360px+), tablets (768px+), and desktop monitors (1920x1080).

---

## 3. Browser & Environment Support

| Browser / Platform | Minimum Supported Version | Validation Status |
|---|---|---|
| **Google Chrome / Chromium** | v100+ | Primary Target (100% Tested) |
| **Mozilla Firefox** | v105+ | Fully Supported |
| **Apple Safari (macOS / iOS)** | v15.4+ (Full WebKit support) | Fully Supported |
| **Microsoft Edge** | v100+ | Fully Supported |
| **Mobile Browsers (Android Chrome / iOS Safari)** | Latest 3 versions | Touch optimized |
