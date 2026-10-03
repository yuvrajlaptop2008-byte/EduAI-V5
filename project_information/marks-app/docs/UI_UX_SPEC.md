# UI & UX Design Specification — Marks App

> **Design Philosophy**: High-Focus Dark Aesthetic, Cognitive Clarity, Zero Distraction during Tests  
> **Target Devices**: Desktop Monitors (1080p+), Laptops, Tablets (iPad / Android), Mobile Phones  

---

## 1. Core Visual Principles

1. **Aesthetic Direction**: Deep space dark mode (`#0b1326`) paired with modern glassmorphism (frosted backdrop blur, translucent borders, subtle inner shadows).
2. **Role Color Coding**: Distinct visual identities to avoid role confusion across browser tabs:
   - **Student**: `#ff6b00` (Energetic Brand Orange — enthusiasm, motivation, alertness)
   - **Teacher**: `#8083ff` (Modern Indigo — professionalism, academic authority)
   - **Admin**: `#ef4444` (Vibrant Crimson / Rose — administrative oversight, system control)
   - **Parent**: `#10b981` (Serene Emerald — nurturing, reassurance, growth)
3. **Typography for Math**:
   - Headers & UI Text: `Inter` and `Outfit` (clean sans-serif).
   - Numerical Data & Timers: `JetBrains Mono` (tabular numbers preventing jitter).
   - Mathematical Formulas: Dedicated `KaTeX` serif font hierarchy.

---

## 2. Layout Structure & The `RoleShell`

Every authenticated page in the platform renders inside `<RoleShell accentColor={...}>`:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Topbar: [Logo / Role Badge]          [Institute Name]   [🔔 Bell] [User 👤] │
├──────────────┬──────────────────────────────────────────────────────────────┤
│ Sidebar:     │ Breadcrumb Navigation: Home > Batch A > Test 04              │
│ ├── Dashboard│──────────────────────────────────────────────────────────────┤
│ ├── Tests    │ Page Main Container                                          │
│ ├── Notes    │ (Scrollable, padded, glass container)                        │
│ ├── DPP      │                                                              │
│ └── Settings │                                                              │
│              │                                                              │
│ [Collapse ◀] │                                                              │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

- **Sidebar Behavior**: Expandable to 240px; collapsible to 64px icon-rail; on screens `< 1024px`, collapses into a slide-over mobile drawer.
- **Top Bar**: Displays persistent notification bell with unread badge counter and current active role indicator.

---

## 3. NTA CBT Exam Interface Layout (Desktop & Tablet)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Exam Title: JEE Main Full Mock 01       Time Left: 02:45:12     [Submit Test]│
├──────────────────────────────────────────────────────┬──────────────────────┤
│ Sections: [Physics (25)] [Chemistry (25)] [Maths (25)]│ Candidate: Rahul S.  │
├──────────────────────────────────────────────────────┤ Question Palette:    │
│ Question 14 of 75                     Marks: +4 / -1 │ [1] [2] [3] [4] [5]  │
│                                                      │ [6] [7] [8] [9] [10] │
│ A particle of mass $m$ moves along the curve:        │                      │
│ $$y = \frac{1}{2} k x^2$$                            │ Legend:              │
│ If the speed at the origin is $v_0$, the acceleration│ 🟢 Answered (18)     │
│ vector at $x = 0$ is:                                │ 🔴 Not Answered (4)  │
│                                                      │ ⚪ Not Visited (45)  │
│ (A) $\frac{v_0^2}{k} \hat{j}$                        │ 🟣 Marked Review (8) │
│ (B) $k v_0^2 \hat{j}$                                │                      │
│ (C) zero                                             │                      │
│ (D) $-k v_0^2 \hat{j}$                               │                      │
├──────────────────────────────────────────────────────┴──────────────────────┤
│ [Mark for Review & Next]  [Clear Response]               [Save & Next ➔]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Keyboard Shortcuts for Power Users (NTA Standard)

To maximize test-taking velocity on laptops and desktops:

| Shortcut Key | Action Triggered |
|---|---|
| `1` or `A` | Select Option A |
| `2` or `B` | Select Option B |
| `3` or `C` | Select Option C |
| `4` or `D` | Select Option D |
| `Enter` or `S` | Save & Next (Advances to next question) |
| `R` | Mark for Review & Next |
| `C` | Clear Selection / Response |
| `Arrow Left` | Jump to previous question |
| `Arrow Right`| Jump to next question |

---

## 5. Micro-Interactions & Motion Design

1. **Card Elevation**: Cards use `.glass` with a transition of `0.2s cubic-bezier(0.4, 0, 0.2, 1)` and lift 2px on hover (`.glass-hover`).
2. **Progress Shimmer**: Horizontal progress meters in dashboards and test stats feature an animated diagonal shimmer gradient (`.shimmer-bar`) indicating active progress.
3. **Modal Physics**: Modals enter with an initial scale of `0.95` and opacity `0`, snapping to `1.0` using spring physics (`damping: 25, stiffness: 300`).
