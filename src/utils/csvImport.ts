import Papa from "papaparse";
import { doc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { apiClient } from "../services/apiClient";
import { notifyQuestionBankChanged } from "../services/dataService";
import type { Question } from "./questionBank";

export interface CsvRow {
  examType?: string;
  subject: string;
  chapter: string;
  year?: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: string; // A | B | C | D
  solution?: string;
  difficulty?: string;
  tags?: string;
}

export interface ParsedRow {
  row: number;
  data?: Question;
  raw: CsvRow;
  errors: string[];
}

const REQUIRED = ["subject", "chapter", "questionText", "optionA", "optionB", "optionC", "optionD", "correct"] as const;

export function parseCsvFile(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(validateRows(results.data)),
      error: reject,
    });
  });
}

function validateRows(rows: CsvRow[]): ParsedRow[] {
  return rows.map((raw, i) => {
    const errors: string[] = [];
    for (const key of REQUIRED) {
      if (!raw[key] || !String(raw[key]).trim()) errors.push(`Missing ${key}`);
    }
    const correctLetter = (raw.correct || "").trim().toUpperCase();
    const correctIndex = ["A", "B", "C", "D"].indexOf(correctLetter);
    if (correctIndex === -1) errors.push(`'correct' must be A, B, C or D (got "${raw.correct}")`);

    const difficulty = ["Easy", "Medium", "Hard"].includes(raw.difficulty || "") ? raw.difficulty! : "Medium";

    if (errors.length > 0) return { row: i + 2, raw, errors };

    const data: Question = {
      id: Date.now() + i,
      subject: raw.subject.trim(),
      chapter: raw.chapter.trim(),
      difficulty: difficulty as any,
      text: raw.questionText.trim(),
      options: [raw.optionA, raw.optionB, raw.optionC, raw.optionD].map((o) => (o || "").trim()),
      correctAnswer: correctIndex,
      solution: (raw.solution || "").trim(),
      communitySolutions: [],
      exam: raw.examType?.trim() || undefined,
      year: raw.year ? Number(raw.year) : undefined,
    } as Question;

    return { row: i + 2, raw, data, errors: [] };
  });
}

/** Writes all valid rows to custom_questions in batches of 450 (Firestore limit is 500/batch). */
export async function commitRows(rows: ParsedRow[], onProgress?: (done: number, total: number) => void, extra?: Partial<Question>) {
  const valid = rows.filter((r) => r.data);
  let done = 0;
  for (let i = 0; i < valid.length; i += 450) {
    const chunk = valid.slice(i, i + 450);
    const batch = writeBatch(db);
    chunk.forEach((r) => batch.set(doc(db, "custom_questions", String(r.data!.id)), { ...r.data, ...extra }));
    await batch.commit();
    done += chunk.length;
    onProgress?.(done, valid.length);
  }

  // Dual-sync to backend API if available
  try {
    const backendQuestions = valid.map((r) => ({
      text: r.data!.text,
      options: r.data!.options.map((opt) => ({ text: opt })),
      correctAnswer: r.data!.correctAnswer,
      type: "single",
      subject: r.data!.subject,
      chapter: r.data!.chapter,
      difficulty: r.data!.difficulty,
      exam: r.data!.exam || "JEE_MAIN",
      year: r.data!.year,
      solution: r.data!.solution,
      tags: [],
      status: "active",
    }));
    fetch(`${apiClient.baseUrl}/api/questions/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: backendQuestions }),
    }).catch(() => {});
  } catch {}

  // Dual-sync to local storage and broadcast to live student dashboards
  try {
    const raw = localStorage.getItem("custom_questions");
    const existing: any[] = raw ? JSON.parse(raw) : [];
    const newItems = valid.map((r) => ({ ...r.data, ...extra }));
    const merged = [...existing.filter((e) => !newItems.some((n) => n.id === e.id)), ...newItems];
    localStorage.setItem("custom_questions", JSON.stringify(merged));
  } catch {}
  notifyQuestionBankChanged();

  return done;
}

export const CSV_TEMPLATE = `examType,subject,chapter,year,questionText,optionA,optionB,optionC,optionD,correct,solution,difficulty,tags
JEE_MAIN,Physics,Kinematics,2023,"A particle moves with constant velocity...","2 m/s","4 m/s","6 m/s","8 m/s",B,"v = u + at gives the result.",medium,"motion,kinematics"
NEET,Biology,Cell Division,2022,"Mitosis occurs in...","Neurons","Liver cells","Both","Neither",C,"Both undergo mitosis.",easy,"cell,division"
`;
