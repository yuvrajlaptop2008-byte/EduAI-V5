import { FormulaCard } from"../data/formulas";

export interface CustomFormulaCard extends FormulaCard {
  subjectKey: string;
  chapterKey: string;
  topicKey: string;
  email: string;
}

export const customFormulasDB = {
  getCustomFormulas(): CustomFormulaCard[] {
    return JSON.parse(localStorage.getItem("mark_custom_formulas") ||"[]");
  },
  saveCustomFormulas(formulas: CustomFormulaCard[]) {
    localStorage.setItem("mark_custom_formulas", JSON.stringify(formulas));
  },
  addFormula(formula: Omit<CustomFormulaCard,"id" |"status">) {
    const formulas = this.getCustomFormulas();
    const newFormula: CustomFormulaCard = {
      ...formula,
      id: `CUSTOM-${Date.now()}`,
      status: {
        not_seen: true,
        memorized: false,
        bookmarked: false,
        need_revision: false,
      },
    };
    formulas.push(newFormula);
    this.saveCustomFormulas(formulas);
    return newFormula;
  },
  deleteFormula(id: string) {
    let formulas = this.getCustomFormulas();
    formulas = formulas.filter((f) => f.id !== id);
    this.saveCustomFormulas(formulas);
  },
};
