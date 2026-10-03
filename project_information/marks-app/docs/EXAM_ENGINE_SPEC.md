# NTA CBT Exam Engine Specification — Marks App

> **Compliance Target**: NTA (National Testing Agency) Computer-Based Test Standards  
> **Applicable Exams**: JEE Main, JEE Advanced, NEET-UG, BITSAT  

---

## 1. NTA Question Palette State Machine

The exam engine maintains 5 official states for every question. Every button click or navigation transitions the state according to strict rules:

| State Key | Label | Badge Visual | Evaluated in Final Score? |
|---|---|---|:---:|
| `not_visited` | Not Visited | Gray square with white number (`#6b7280`) | ❌ No |
| `not_answered`| Visited, Not Answered | Red square with white number (`#ef4444`) | ❌ No |
| `answered` | Answered | Green square with white number (`#10b981`) | ✅ Yes |
| `marked_review` | Marked for Review | Purple square with white number (`#8b5cf6`) | ❌ No |
| `ans_marked_review`| Answered & Marked for Review | Purple square with small Green circle dot | ✅ Yes (NTA Rule) |

```
                       ┌────────────────┐
                       │  NOT VISITED   │
                       └───────┬────────┘
                               │ (User clicks into question)
                               ▼
        ┌────────────────────────────────────────────────┐
        │             VISITED, NOT ANSWERED              │
        └───────┬───────────────────────────────┬────────┘
                │ (Selects Option)              │ (Clicks "Mark for Review")
                ▼                               ▼
    ┌───────────────────────┐       ┌───────────────────────┐
    │       ANSWERED        │       │   MARKED FOR REVIEW   │
    └───────────┬───────────┘       └───────────┬───────────┘
                │ (Clicks "Mark for Review")    │ (Selects Option)
                ▼                               ▼
        ┌────────────────────────────────────────────────┐
        │          ANSWERED & MARKED FOR REVIEW          │
        └────────────────────────────────────────────────┘
```

---

## 2. Server-Synchronized Timer Engine

To prevent students from altering local computer clocks to gain extra time:
1. **Initial Sync**: When the test starts, the client calculates the time delta against the server:
   `clockOffset = Date.now() - serverTimestamp`.
2. **Fixed Duration Window**: The true expiration timestamp is:
   `endTimestamp = startTimestamp + (durationMinutes * 60 * 1000)`.
3. **Tick Loop**: `setInterval` runs every 1000ms checking `remainingMs = endTimestamp - (Date.now() - clockOffset)`.
4. **Visual Warning**: When `remainingMs < 300,000` (5 minutes remaining), the timer turns pulsing red with an audio warning chime.
5. **Auto-Submit**: When `remainingMs <= 0`, the test locks immediately and triggers `autoSubmitTest()`.

---

## 3. High-Frequency Auto-Save & Crash Recovery

To ensure zero lost progress if a student's laptop battery dies or the browser crashes:
1. **Local Instant Buffer**: Every radio click writes to `localStorage` key `active_test_${testId}` within 5ms.
2. **Debounced Firestore Sync**: A debounced effect flushes the latest answers dictionary to Firestore `groupTestAttempts/{attemptId}` every 10 seconds.
3. **Re-Hydration**: On mounting the test page, if `localStorage` has saved answers for that `testId`, the engine checks whether the attempt is still within the valid time window. If valid, answers and current question pointer are instantly restored.

---

## 4. Test Submission Dialog & Summary Modal

Before finalizing submission, the engine renders an NTA-compliant confirmation modal:

```
┌────────────────────────────────────────────────────────┐
│               Test Submission Summary                  │
├────────────────────────────────────────────────────────┤
│ Section Name │ Total │ Answered │ Not Ans │ Review │   │
├──────────────┼───────┼──────────┼─────────┼────────┼───┤
│ Physics      │  25   │    20    │    2    │   3    │   │
│ Chemistry    │  25   │    22    │    3    │   0    │   │
│ Mathematics  │  25   │    18    │    4    │   3    │   │
├──────────────┼───────┼──────────┼─────────┼────────┼───┤
│ Total        │  75   │    60    │    9    │   6    │   │
├────────────────────────────────────────────────────────┤
│ Are you sure you want to submit? No changes allowed!   │
│        [ Return to Test ]       [ Confirm & Submit ]   │
└────────────────────────────────────────────────────────┘
```
