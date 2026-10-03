# Structured AI Prompt Template — Marks App

> **Instructions**: Use this markdown template whenever instructing Claude, ChatGPT, Cursor, or Copilot to write code, debug an issue, or add a feature to Marks App. Fill in the bracketed fields `[...]`.

---

```markdown
# TASK: [Short Title of Task, e.g., "Build Mistake Analysis Radar Chart"]

## PROJECT CONTEXT
- **Project**: Marks App (EduAI V5 ecosystem) — JEE/NEET Exam Prep & Coaching ERP
- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS v4 + Cloud Firestore + KaTeX + Recharts + Lucide
- **Base Theme**: Dark `#0b1326`, surface `#171f33`, `.glass` cards, role accent colors
- **Zero Mock Data Principle**: Do NOT use fake hardcoded arrays or mock timeouts. Use real Firestore service calls.

## TARGET FILES
- Modify/Create: `[path/to/target/file.tsx]`
- Associated Service: `[src/services/...DB.ts]`
- Target Types: `[src/types/schema.ts]`

## USER ROLE & ROUTE CONTEXT
- **Active Role**: [Student / Teacher / Admin / Parent]
- **Route Namespace**: [/app /teacher /admin /parent]
- **Accent Color**: [#ff6b00 (Student) / #8083ff (Teacher) / #ef4444 (Admin) / #10b981 (Parent)]

## REQUIREMENTS & ACCEPTANCE CRITERIA
1. [Requirement 1 - exact layout or functionality]
2. [Requirement 2 - data fetching & state management]
3. [Requirement 3 - math formula handling (KaTeX)]
4. [Requirement 4 - error handling & toast notification via Sonner]

## CONSTRAINTS & GOTCHAS
- No raw Firestore queries in page components; invoke functions from `src/services/`.
- Handle loading and empty states cleanly with descriptive messages.
- Typescript strict mode: no `any` types.
- Ensure all LaTeX math expressions render via `<KaTeXRenderer />`.
```
