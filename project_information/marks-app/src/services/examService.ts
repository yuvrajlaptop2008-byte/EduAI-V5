import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { db } from "./firebase";
import { GroupTest, GroupTestAttempt } from "../types/schema";
import { Question } from "../types/exam";

export async function getQuestionsByIds(questionIds: Array<number | string>): Promise<Question[]> {
  if (questionIds.length === 0) return [];
  const questions: Question[] = [];

  // Firestore in query supports max 30 items per batch
  const chunkSize = 25;
  for (let i = 0; i < questionIds.length; i += chunkSize) {
    const chunk = questionIds.slice(i, i + chunkSize);
    const q = query(collection(db, "custom_questions"), where("id", "in", chunk));
    const snap = await getDocs(q);
    snap.forEach((docSnap) => questions.push(docSnap.data() as Question));
  }

  return questions;
}

export async function submitExamAttempt(
  payload: Omit<GroupTestAttempt, "id" | "rank" | "percentile">
): Promise<string> {
  const attemptsRef = collection(db, "groupTestAttempts");
  const docRef = await addDoc(attemptsRef, {
    ...payload,
    rank: null,
    percentile: null,
  });
  return docRef.id;
}

export async function listGroupTestsForGroup(groupId: string): Promise<GroupTest[]> {
  const q = query(
    collection(db, "groupTests"),
    where("assignedGroupIds", "array-contains", groupId),
    where("isPublished", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as GroupTest));
}
