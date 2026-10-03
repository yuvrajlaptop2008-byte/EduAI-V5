# Marks App — AI Prompt Playbook

> **How to Use**: Select the prompt matching the feature you want to generate or enhance, copy it, and paste it to your AI coding assistant (Claude, GPT-4o, Cursor, DeepSeek). Each prompt includes exact context, constraints, and schemas.

---

## 🎯 Playbook 1: NTA CBT Exam Engine Interface

```text
Act as a Principal React + TypeScript Engineer on Marks App. Build the NTA-style Computer Based Test (CBT) interface component at `src/components/TestEngine/ExamInterface.tsx`.

Requirements:
1. Header: Display Test Title, Section tabs (Physics, Chemistry, Mathematics), Countdown Timer with warning at < 5 mins, and "Submit Test" button with confirmation modal.
2. Main Body (Dual Column):
   - Left Panel (70%): Current question number, marks scheme (+4/-1), question text rendered with KaTeX, options (A, B, C, D) with radio selection, and action buttons: "Save & Next", "Clear Response", "Mark for Review & Next".
   - Right Panel (30%): Question palette showing grid of question numbers colored by NTA status:
     - Grey: Not visited
     - Red: Not answered
     - Green: Answered
     - Purple: Marked for review
     - Purple + Green dot: Answered & marked for review
3. Auto-save state to localStorage every 10s and on every selection.
4. Integrate with `groupTestsDB.ts:submitAttempt` on final submit.
5. Zero mock data. Use typed props matching `GroupTest` and `Question` interfaces.
```

---

## 🎯 Playbook 2: Teacher Test Creator Wizard

```text
Act as a Senior Frontend Engineer on Marks App. Implement the Teacher Create Test page at `src/pages/Teacher/CreateTest.tsx`.

Requirements:
1. Follow the two-column glassmorphism design:
   - Left Panel: Test configuration card (Test Title, Assigned Exam Groups dropdown, Duration in mins, Total Marks, Marks per question, Negative marks, Scheduled Date/Time).
   - Right Panel: Interactive Question Selector with live filters (Subject, Chapter, Topic, Difficulty chips) and search bar.
2. Live Distribution Widget:
   - Display a visual difficulty breakdown bar showing % of Easy, Medium, and Hard questions selected.
   - Show live count of questions and total marks computed dynamically.
3. Actions:
   - "Save as Draft" (isPublished: false)
   - "Publish & Schedule" (isPublished: true)
4. Persist data into Firestore `groupTests` collection via `groupTestsDB.ts`.
5. Display success toast via Sonner and navigate back to `/teacher/tests`.
```

---

## 🎯 Playbook 3: KaTeX Mathematical Formula Renderer

```text
Act as a Frontend Core Engineer on Marks App. Create the high-performance LaTeX / Math renderer component at `src/components/Shared/KaTeXRenderer.tsx`.

Requirements:
1. Accept raw strings containing mixed text, inline math ($...$), and block math ($$...$$).
2. Parse and render equations using `katex` or `react-katex`.
3. Support chemical formulas and subscripts gracefully.
4. Include an ErrorBoundary or fallback: if a user inputs malformed LaTeX, render the raw formula in a subtle red outline rather than crashing the entire component.
5. Memoize parsing with `useMemo` so that re-renders during high-speed question navigation do not drop below 60 FPS.
```

---

## 🎯 Playbook 4: PapaParse Question CSV Bulk Importer

```text
Act as a Full-Stack Engineer on Marks App. Build the bulk CSV question ingestion panel at `src/components/shared/CsvImportPanel.tsx`.

Requirements:
1. Drag-and-drop file zone supporting `.csv` files.
2. Download sample CSV template button with realistic JEE/NEET questions (columns: id, subject, chapter, topic, difficulty, text, option1, option2, option3, option4, correctAnswer, solution, exam, language, tags).
3. Client-side preview table:
   - Parse using `papaparse`.
   - Validate required fields and highlight rows with errors in red.
   - Show total rows, valid rows, and invalid rows counter badges.
4. Batch commit:
   - Commit valid rows to Firestore `custom_questions` in batches of 500 using `writeBatch()`.
   - Show progress bar with percentage during upload.
   - Log audit entry in `auditLogs` upon completion.
```

---

## 🎯 Playbook 5: Cloud Functions Serverless Re-Ranker

```text
Act as a Backend Firebase Engineer on Marks App. Implement the Cloud Function `onTestSubmit` in `functions/src/index.ts`.

Requirements:
1. Trigger: `onDocumentCreated("groupTestAttempts/{attemptId}")`.
2. Logic:
   - Fetch the corresponding `testId`.
   - Query all attempts for that `testId` ordered by `score DESC, timeTakenSec ASC`.
   - Calculate dense rank and exact percentile for every student:
     `Percentile = ((Total Attempts - Rank + 1) / Total Attempts) * 100`
   - Batch update all attempts with their updated `rank` and `percentile`.
   - Also update the top student's score in the `leaderboard` collection.
3. Optimize for batch writes (chunks of 500).
4. Include comprehensive error logging and execution timing.
```

---

## 🎯 Playbook 6: Mistake Notebook & Error Diagnostics

```text
Act as a Frontend Engineer on Marks App. Implement the Mistake Notebook page at `src/pages/Student/MistakeNotebook.tsx`.

Requirements:
1. Fetch all bookmarked or wrong questions from user's test history and `bookmarks` collection.
2. Filter bar: Subject, Chapter, Error Reason (`Conceptual Gap`, `Calculation Mistake`, `Silly Error`, `Time Pressure`), and Revision Status (`Needs Review`, `Mastered`).
3. Question Card:
   - Display original question and user's selected wrong answer vs correct answer.
   - LaTeX step-by-step solution expandable toggle.
   - User notes textarea with auto-save.
   - "Schedule Re-test" button to trigger a 5-question quick quiz on mistaken concepts.
```
