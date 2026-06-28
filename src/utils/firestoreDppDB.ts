import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase";

export interface DppProgressDoc {
  chapterId: string;
  attempted: number; // number of completed DPPs in this chapter
  completedDpps: Record<string, {
    status: "completed" | "not_attempted" | "locked";
    score: number;
    questionsCount: number;
    completedAt: number;
  }>;
}

// Get DPP progress for a specific chapter
export async function getChapterDppProgress(
  userId: string,
  chapterId: string
): Promise<DppProgressDoc | null> {
  try {
    const ref = doc(db, `users/${userId}/dpp_progress`, chapterId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as DppProgressDoc;
  } catch (error) {
    console.error("Error getting chapter DPP progress:", error);
    return null;
  }
}

// Get all DPP progress documents for a user
export async function getAllDppProgress(
  userId: string
): Promise<Record<string, DppProgressDoc>> {
  try {
    const ref = collection(db, `users/${userId}/dpp_progress`);
    const snap = await getDocs(ref);
    const progress: Record<string, DppProgressDoc> = {};
    snap.forEach((doc) => {
      progress[doc.id] = doc.data() as DppProgressDoc;
    });
    return progress;
  } catch (error) {
    console.error("Error getting all DPP progress:", error);
    return {};
  }
}

// Update progress for a specific DPP in a chapter
export async function saveDppAttempt(
  userId: string,
  chapterId: string,
  dppId: string,
  score: number,
  questionsCount: number
): Promise<void> {
  try {
    const ref = doc(db, `users/${userId}/dpp_progress`, chapterId);
    const snap = await getDoc(ref);
    
    let currentDoc: DppProgressDoc = {
      chapterId,
      attempted: 0,
      completedDpps: {}
    };

    if (snap.exists()) {
      currentDoc = snap.data() as DppProgressDoc;
    }

    // Update the specific DPP
    const wasAlreadyCompleted = currentDoc.completedDpps[dppId]?.status === "completed";
    currentDoc.completedDpps[dppId] = {
      status: "completed",
      score,
      questionsCount,
      completedAt: Date.now()
    };

    // Re-calculate attempted count
    const completedCount = Object.values(currentDoc.completedDpps).filter(
      (d) => d.status === "completed"
    ).length;
    currentDoc.attempted = completedCount;

    await setDoc(ref, currentDoc);
  } catch (error) {
    console.error("Error saving DPP attempt:", error);
  }
}
