# Mistake Notebook & Spaced Repetition Specification — Marks App

> **Pedagogical Core**: Targeted Error Rectification, Spaced Repetition Intervals, Root-Cause Tagging  

---

## 1. The Error Diagnostic Taxonomy

A core flaw of standard test series is that students never revisit the exact reasons behind their lost marks. The Mistake Notebook categorizes every wrong response into one of four actionable diagnostics:

| Diagnostic Label | Code | Typical Indicator | Remedial Action |
|---|---|---|---|
| **Conceptual Gap** | `CONCEPT_GAP` | Student did not know the underlying theorem, formula, or law. | Link to formula sheet & theory notes. |
| **Calculation Error** | `CALC_ERROR` | Correct method used, but algebraic, sign, or arithmetic error made. | Highlight step in LaTeX solution. |
| **Silly / Overlook** | `SILLY_MISTAKE` | Misread "incorrect" for "correct", missed units (cm vs m), or typo. | High-alert flag in pre-exam checklist. |
| **Time Pressure** | `TIME_PRESSURE` | Solved during the last 5 minutes under anxiety; rushed guess. | Speed drill recommendations. |

---

## 2. Mistake Storage Schema (`notes` / `bookmarks`)

Mistake entries are stored in the user's private collection:

```typescript
interface MistakeEntry {
  id: string;                        // Unique entry ID
  userId: string;                    // Foreign Key -> users/{uid}
  questionId: number | string;       // Foreign Key -> custom_questions/{id}
  testId?: string;                   // Test where error occurred
  selectedAnswer: string;            // The wrong option index selected
  correctAnswer: string;             // The true answer
  diagnosticReason: "CONCEPT_GAP" | "CALC_ERROR" | "SILLY_MISTAKE" | "TIME_PRESSURE";
  userNotes?: string;                // Personal reflection (e.g., "Forgot minus sign in Lenz's law")
  boxStage: 1 | 2 | 3;               // Leitner Spaced Repetition stage
  nextReviewDate: string;            // "YYYY-MM-DD"
  mastered: boolean;                 // Marked true when solved correctly twice in review
  createdAt: number;
}
```

---

## 3. Spaced Repetition Schedule (Leitner 3-Box System)

```
[ Question Failed ] ────────► [ Box 1: Review in 24 Hours ]
                                      │
                         (Solved Correctly in Review Quiz)
                                      ▼
                              [ Box 2: Review in 4 Days ]
                                      │
                         (Solved Correctly in Review Quiz)
                                      ▼
                              [ Box 3: Review in 14 Days ]
                                      │
                         (Solved Correctly in Review Quiz)
                                      ▼
                              [ Status: MASTERED 🎓 ]
```

- **If Failed at Any Stage**: The question drops back to **Box 1** for review in 24 hours.
- **Daily Review Queue**: The student's home dashboard highlights questions where `nextReviewDate <= today` as part of the daily study tasks.
