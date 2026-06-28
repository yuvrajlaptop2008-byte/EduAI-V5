import React from"react";

export type ExamType =
  |"JEE Main"
  |"JEE Advanced"
  |"BITSAT"
  |"MHT-CET"
  |"NDA"
  |"VITEEE"
  |"NEST"
  |"COMEDK"
  |"NEET"
  |"AIIMS"
  |"JIPMER"
  |"NEET NTA"
  |"INI-CET"
  |"MHT-CET (PCB)"
  |"KCET (Med)"
  |"AP EAMCET";
export type SubjectType =
  |"Physics"
  |"Chemistry"
  |"Mathematics"
  |"Biology"
  |"English Proficiency"
  |"Logical Reasoning"
  |"English"
  |"General Ability Test"
  |"Aptitude"
  |"General Knowledge"
  |"All MBBS Subjects";

export interface Chapter {
  id: string;
  name: string;
  subject: SubjectType;
  unit?: string;
  isReduced?: boolean;
  isRemoved?: boolean;
}

export interface CustomTest {
  id: string;
  name: string;
  exam: ExamType;
  subjects: SubjectType[];
  chapters: string[]; // chapter IDs
  questionCount: number;
  duration: number; // minutes
  createdAt: string;
  status:"Not Attempted" |"Attempted" |"In Progress";
  score?: number;
  totalMarks?: number;
  yearFilter?: string;
  specificYears?: number[];
}

export interface Question {
  id: string;
  type:"MCQ" |"Numerical";
  subject: SubjectType;
  text: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  points: number;
  imageUrl?: string;
}

export interface TestSession {
  testId: string;
  startTime: number;
  answers: Record<string, string | number>; // questionId -> answer
  markedForReview: string[]; // questionId[]
  status:"In Progress" |"Completed";
}

export interface PYQPaper {
  id: string;
  name: string;
  year: number;
  exam:"JEE Main" |"NEET";
  status:"Not Started" |"Attempted" |"In Progress";
  attemptDate?: string;
}
