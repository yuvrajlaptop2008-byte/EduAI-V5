# Marks App — Active Backlog & TODO Tracker

> **Sprint Status**: Pre-Launch Hardening & Visual Upgrade  
> **Tracker Format**: `[ ] Pending`, `[x] Completed`, `[-] In Progress`  

---

## 🔴 Priority 0: Critical Pre-Launch Tasks

### 1. Teacher Portal Upgrades
- [ ] **Teacher → CreateGroupTest Glass Layout Upgrade**:
  - Implement two-panel glass layout: left sticky configuration card (test title, groups, duration, marks, date), right searchable question browser.
  - Add difficulty distribution progress bar (`shimmer-bar`) showing ratio of Easy/Medium/Hard questions.
  - Implement 1-click question inclusion/exclusion with live total marks and question counter.
- [ ] **Teacher → Dashboard Activity Feed**:
  - Implement real-time chronological activity feed with CSS timeline connector (`before:` pseudo-element line).
  - Display recent test submissions, student attendance alerts, and remarks logged.

### 2. Admin Question Bank Redesign
- [ ] **Admin → Question Bank Three-Column Layout**:
  - **Left column**: Filter sidebar (Subject, Chapter, Topic chips, Difficulty pills, Language toggle).
  - **Center column**: Scrollable question card list with question ID, tags, usage count, and success rate badges.
  - **Right column**: Quick question preview / inline editing modal with live KaTeX preview.
- [ ] **CSV Import Template Link Fix**:
  - Fix the download sample template button in `CsvImportPanel.tsx` to generate and download a live CSV blob matching `CSV_TEMPLATE`.

### 3. Student Portal Refinements
- [ ] **Student → Tests "Class Tests" Tab**:
  - Implement descriptive empty state when a student has no assigned exam group or when no tests are scheduled.
  - Add countdown badge for upcoming tests scheduled in the next 24 hours.

---

## 🟡 Priority 1: High-Value Improvements

### 4. Leaderboard & Analytics Automations
- [ ] **Leaderboard Cloud Function Cron**:
  - Deploy scheduled Cloud Function trigger to periodically recalculate aggregate scores in `leaderboard/{uid}`.
  - Handle fallbacks gracefully when leaderboard documents are regenerating.
- [ ] **Parent Report PDF Export**:
  - Add "Download PDF Report" button on `/parent/reports` using `window.print()` media query styling or `jspdf`.

### 5. Mobile & Responsive Polish
- [ ] **Mobile Drawer Enhancements**:
  - Ensure all modal sheets close cleanly on hardware Android back button navigation.
  - Optimize the question palette drawer during mobile CBT test sessions.

---

## 🟢 Priority 2: Nice-to-Have & Infrastructure

### 6. PWA & Assets
- [ ] **Generate PWA Icons**:
  - Replace missing icon references in `manifest.json` with high-resolution assets (`192x192`, `512x512`, `maskable`).
- [ ] **Firebase App Check Integration**:
  - Enforce Firebase App Check with reCAPTCHA v3 or Play Integrity to prevent unauthorized API requests.
- [ ] **KaTeX Font Preloading**:
  - Add `<link rel="preload">` tags for KaTeX `.woff2` font files in `index.html` to eliminate font-swap layout shift.

---

## 🛠️ Verification Checklist for Every Pull Request

- [ ] Run `npx tsc --noEmit` and verify 0 type errors.
- [ ] Verify no raw Firestore queries inside React page components (all queries must use `src/services/` or `src/utils/`).
- [ ] Check dark theme visual consistency (`#0b1326` background, `.glass` cards).
- [ ] Test with zero mock data — ensure proper Firestore empty states are rendered.
