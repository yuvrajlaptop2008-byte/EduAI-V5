# Component Catalog & Visual Specifications — Marks App

> **Component Standard**: React 18 Functional Components with Tailwind v4 Utilities + Framer Motion  

---

## 1. `StatCard` Component

Visual metric card used across dashboards (Score, Accuracy, Streak, Active Batches).

```
┌────────────────────────────────────────────────────────┐
│  [⚡ Icon Pill]                       [+12% Trend ↗]   │
│                                                        │
│  78.4%                                                 │
│  Overall JEE Accuracy                                  │
│                                                        │
│  [━━━━━━━ Shimmer Progress Bar ━━━━━━━━━━━━━━━━━━━━]   │
└────────────────────────────────────────────────────────┘
```
- **Props**:
  - `title`: string
  - `value`: string | number
  - `icon`: LucideIcon
  - `trend`?: { value: string; isPositive: boolean }
  - `progress`?: number (0 to 100)
  - `accentColor`?: string (default: role accent)
- **Styling**: `.glass`, rounded-2xl, p-5, hover lift via `.glass-hover`.

---

## 2. `QuestionPalette` Component

The grid of question jump buttons in the CBT test interface.

- **Props**:
  - `totalQuestions`: number
  - `currentQuestionIndex`: number
  - `questionStates`: Record<number, QuestionStatus>
  - `onSelectQuestion`: (index: number) => void
- **Grid Layout**: 5 columns on desktop (`grid-cols-5 gap-2`), responsive wrapping.
- **Button Dimensions**: Fixed 38px x 38px, font-mono text-xs, font-semibold, rounded-lg.
- **Visual Mapping**:
  - `not_visited`: `bg-slate-700/60 text-slate-300 border border-slate-600/40`
  - `not_answered`: `bg-rose-500 text-white shadow-rose-500/20 shadow-md`
  - `answered`: `bg-emerald-500 text-white shadow-emerald-500/20 shadow-md`
  - `marked_review`: `bg-purple-600 text-white shadow-purple-500/20 shadow-md`
  - `ans_marked_review`: `bg-purple-600 text-white relative after:w-2 after:h-2 after:bg-emerald-400 after:rounded-full after:absolute after:bottom-1 after:right-1`

---

## 3. `TimerBadge` Component

Live countdown timer embedded in the CBT test header.

- **Features**:
  - Displays remaining time formatted as `HH:MM:SS`.
  - Normal state: Monospace text, subtle slate background with border.
  - Critical state (`< 300 seconds`): Glowing red outline, animated heart-beat pulse, warning chime played at 5:00 and 1:00.

---

## 4. `SkeletonLoader` Components

Pre-built placeholder states eliminating layout shifts during Firestore queries:
- `SkeletonStatCards`: Grid of 4 shimmer rectangles.
- `SkeletonTable`: Header row plus 5 placeholder content rows.
- `SkeletonExamQuestion`: Full CBT interface placeholder with question body and 4 radio choices.

---

## 5. `EmptyState` Component

Zero-mock-data placeholder:
- Displays contextual Lucide illustration (e.g. `Inbox`, `CalendarX`, `FileQuestion`).
- Clear headline (e.g. "No Tests Scheduled").
- Supportive subtext (e.g. "Your faculty has not published any tests for Droppers Batch A yet.").
- Action button (e.g. "Practice Chapter PYQs Instead" or "Create Test").
