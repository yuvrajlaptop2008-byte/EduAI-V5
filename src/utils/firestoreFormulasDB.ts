import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { FormulaCard } from "../data/formulas";

export interface CustomFormulaCard extends FormulaCard {
  subjectKey: string;
  chapterKey: string;
  topicKey: string;
  userId: string;
}

export interface FormulaStatus {
  not_seen: boolean;
  memorized: boolean;
  bookmarked: boolean;
  need_revision: boolean;
}

// ─── Custom Formulas ──────────────────────────────────────────────────────────

export async function getCustomFormulas(
  userId: string,
): Promise<CustomFormulaCard[]> {
  try {
    const ref = collection(db, `users/${userId}/customFormulas`);
    const snap = await getDocs(ref);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CustomFormulaCard));
  } catch (error) {
    console.error("Error getting custom formulas:", error);
    return [];
  }
}

export async function addCustomFormula(
  userId: string,
  formula: Omit<CustomFormulaCard, "id" | "status" | "userId">,
): Promise<CustomFormulaCard> {
  const ref = collection(db, `users/${userId}/customFormulas`);
  const newFormula = {
    ...formula,
    userId,
    status: {
      not_seen: true,
      memorized: false,
      bookmarked: false,
      need_revision: false,
    },
    createdAt: Date.now(),
  };
  const docRef = await addDoc(ref, newFormula);
  return { id: docRef.id, ...newFormula };
}

export async function deleteCustomFormula(
  userId: string,
  formulaId: string,
): Promise<void> {
  const ref = doc(db, `users/${userId}/customFormulas`, formulaId);
  await deleteDoc(ref);
}

// ─── Formula Statuses ─────────────────────────────────────────────────────────
// Stored as a single document per user: { [formulaId]: FormulaStatus }

export async function getFormulaStatuses(
  userId: string,
): Promise<Record<string, FormulaStatus>> {
  try {
    const ref = doc(db, `users/${userId}/formulaStatus`, "statuses");
    const snap = await getDoc(ref);
    if (!snap.exists()) return {};
    return snap.data() as Record<string, FormulaStatus>;
  } catch (error) {
    console.error("Error getting formula statuses:", error);
    return {};
  }
}

export async function updateFormulaStatus(
  userId: string,
  formulaId: string,
  status: FormulaStatus,
): Promise<void> {
  const ref = doc(db, `users/${userId}/formulaStatus`, "statuses");
  await setDoc(ref, { [formulaId]: status }, { merge: true });
}
