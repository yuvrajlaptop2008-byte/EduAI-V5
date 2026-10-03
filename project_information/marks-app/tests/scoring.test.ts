import { calculateExamScore } from "../src/utils/scoringEngine";
import { Question } from "../src/types/exam";

describe("Exam Scoring Engine", () => {
  const mockQuestions: Question[] = [
    {
      id: 1,
      subject: "Physics",
      chapter: "Kinematics",
      topic: "Velocity",
      difficulty: "Easy",
      text: "What is velocity?",
      options: ["A", "B", "C", "D"],
      correctAnswer: 0,
      solution: "Explanation here",
      exam: "JEE Main",
      language: "en",
      tags: [],
    },
    {
      id: 2,
      subject: "Chemistry",
      chapter: "Atomic Structure",
      topic: "Bohr Model",
      difficulty: "Medium",
      text: "Bohr radius formula",
      options: ["A", "B", "C", "D"],
      correctAnswer: 1,
      solution: "Explanation here",
      exam: "JEE Main",
      language: "en",
      tags: [],
    },
  ];

  it("should calculate correct score for 1 correct and 1 incorrect (+4/-1)", () => {
    const answers = {
      "1": "0", // Correct (+4)
      "2": "2", // Incorrect (-1)
    };

    const result = calculateExamScore(answers, mockQuestions, 4, 1);

    expect(result.attempted).toBe(2);
    expect(result.correct).toBe(1);
    expect(result.incorrect).toBe(1);
    expect(result.netScore).toBe(3); // 4 - 1 = 3
    expect(result.accuracy).toBe(50.0);
  });

  it("should handle unattempted questions with 0 penalty", () => {
    const answers = {
      "1": "0", // Correct (+4)
      // Question 2 left unattempted
    };

    const result = calculateExamScore(answers, mockQuestions, 4, 1);

    expect(result.attempted).toBe(1);
    expect(result.correct).toBe(1);
    expect(result.unattempted).toBe(1);
    expect(result.netScore).toBe(4);
    expect(result.accuracy).toBe(100.0);
  });
});
