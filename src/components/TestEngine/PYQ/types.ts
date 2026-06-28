import React from"react";
import { SubjectType } from"../types";

export interface PYQPaper {
  id: string;
  name: string;
  year: number;
  exam:"JEE Main" |"NEET";
  status:"Not Started" |"Attempted";
  attemptDate?: string;
}

export interface YearGroup {
  year: number;
  papers: PYQPaper[];
}
