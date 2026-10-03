# Scoring & Percentile Normalization Algorithms — Marks App

> **Authority**: NTA JEE Main, IIT JEE Advanced, and NTA NEET Exam Regulatory Standards  

---

## 1. Exam Marking Schemes

### 1.1 JEE Main Standard Scheme
- **Single Correct Choice (MCQ)**:
  - Correct Answer: `+4 Marks`
  - Incorrect Answer: `-1 Mark`
  - Unattempted: `0 Marks`
- **Numerical Value Type (NAT)**:
  - Correct Answer: `+4 Marks`
  - Incorrect Answer: `-1 Mark` (per recent NTA revised pattern)
  - Unattempted: `0 Marks`

### 1.2 NEET-UG Standard Scheme
- Total Marks: `720` (180 questions out of 200).
- Correct Answer: `+4 Marks`
- Incorrect Answer: `-1 Mark`
- Unattempted: `0 Marks`

### 1.3 JEE Advanced Partial Marking Scheme (Multi-Correct MCQ)
For a question with correct options $\{A, B, C\}$:
- Choosing $\{A, B, C\}$: `+4 Marks` (Full marks)
- Choosing any 3 correct options (if 4 are correct): `+3 Marks`
- Choosing $\{A, B\}$ or $\{B, C\}$ or $\{A, C\}$ (at least two correct options): `+2 Marks`
- Choosing any 1 correct option: `+1 Mark`
- Choosing ANY incorrect option (e.g. $\{A, D\}$): `-2 Marks`
- Unattempted: `0 Marks`

---

## 2. NTA Percentile Formula & Calculation

The NTA Percentile score indicates the percentage of candidates that scored **equal to or below** that particular candidate in the examination.

### 2.1 Formula
$$\text{Percentile } (P) = \frac{\text{Total Candidates with Score } \le \text{ Candidate's Score}}{\text{Total Candidates in Test Session } (N)} \times 100$$

### 2.2 Algorithm Implementation (Cloud Function)
```typescript
export function computePercentileAndRank(attempts: Array<{ id: string; score: number; timeTakenSec: number }>) {
  // 1. Sort by score descending; break ties with lower timeTakenSec
  const sorted = [...attempts].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeTakenSec - b.timeTakenSec;
  });

  const N = sorted.length;

  return sorted.map((attempt, index) => {
    const rank = index + 1;

    // Count how many candidates scored less than or equal to this student
    const countLessOrEqual = sorted.filter(other => other.score <= attempt.score).length;
    const percentile = parseFloat(((countLessOrEqual / N) * 100).toFixed(4));

    return {
      id: attempt.id,
      rank,
      percentile
    };
  });
}
```

---

## 3. Tie-Breaking Hierarchy

When two or more candidates obtain identical total net scores, the tie is resolved sequentially:
1. **Higher Marks in Subject 1**:
   - For Engineering (JEE): Higher score in **Mathematics**.
   - For Medical (NEET): Higher score in **Biology** (Botany + Zoology).
2. **Higher Marks in Subject 2**: Higher score in **Physics**.
3. **Higher Marks in Subject 3**: Higher score in **Chemistry**.
4. **Lower Negative Marks Ratio**: Candidate with fewer incorrect answers receives the higher rank.
5. **Speed / Time Taken**: Candidate who submitted in less `timeTakenSec` receives the higher rank.
