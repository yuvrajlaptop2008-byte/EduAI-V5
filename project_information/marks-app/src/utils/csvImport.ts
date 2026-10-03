import Papa from "papaparse";
import { Question } from "../types/exam";

export const CSV_TEMPLATE_HEADER = "id,subject,chapter,topic,difficulty,text,option1,option2,option3,option4,correctAnswer,solution,exam,language,tags";

export interface ParsedCsvResult {
  validQuestions: Question[];
  errors: string[];
}

export function parseQuestionCsv(csvContent: string): Promise<ParsedCsvResult> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validQuestions: Question[] = [];
        const errors: string[] = [];

        results.data.forEach((row, index) => {
          const rowNum = index + 2; // 1-based index accounting for header
          if (!row.id || !row.subject || !row.text || !row.option1 || !row.option2 || row.correctAnswer === undefined) {
            errors.push(`Row ${rowNum}: Missing mandatory fields (id, subject, text, options, or correctAnswer).`);
            return;
          }

          const correctAns = parseInt(row.correctAnswer, 10);
          if (isNaN(correctAns) || correctAns < 0 || correctAns > 3) {
            errors.push(`Row ${rowNum}: correctAnswer must be an integer between 0 and 3.`);
            return;
          }

          validQuestions.push({
            id: isNaN(Number(row.id)) ? row.id : Number(row.id),
            subject: row.subject as any,
            chapter: row.chapter || "General",
            topic: row.topic || "General",
            difficulty: (row.difficulty as any) || "Medium",
            text: row.text,
            options: [row.option1, row.option2, row.option3 || "", row.option4 || ""],
            correctAnswer: correctAns,
            solution: row.solution || "",
            exam: (row.exam as any) || "JEE Main",
            language: (row.language as any) || "en",
            tags: row.tags ? row.tags.split("|").map(t => t.trim()) : [],
            status: "active",
          });
        });

        resolve({ validQuestions, errors });
      },
      error: (error) => {
        resolve({ validQuestions: [], errors: [error.message] });
      },
    });
  });
}
