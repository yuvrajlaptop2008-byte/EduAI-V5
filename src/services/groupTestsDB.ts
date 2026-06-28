import { db } from "../firebase";
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy,
} from "firebase/firestore";
import type { GroupTest, GroupTestAttempt } from "../types/schema";

const testsCol = () => collection(db, "groupTests");
const attemptsCol = () => collection(db, "groupTestAttempts");

export async function getGroupTest(id: string): Promise<GroupTest | null> {
  const snap = await getDoc(doc(db, "groupTests", id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) }) : null;
}

export async function createGroupTest(data: Omit<GroupTest, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(testsCol(), { ...data, createdAt: Date.now() });
  return ref.id;
}

export async function listTestsForGroup(groupId: string): Promise<GroupTest[]> {
  const q = query(testsCol(), where("assignedGroupIds", "array-contains", groupId), where("isPublished", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function listTestsByTeacher(teacherUid: string): Promise<GroupTest[]> {
  const q = query(testsCol(), where("createdBy", "==", teacherUid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function publishTest(id: string, isPublished: boolean) {
  await updateDoc(doc(db, "groupTests", id), { isPublished });
}

export async function deleteGroupTest(id: string) {
  await deleteDoc(doc(db, "groupTests", id));
}

export async function submitAttempt(data: Omit<GroupTestAttempt, "id" | "submittedAt" | "rank" | "percentile">): Promise<string> {
  const ref = await addDoc(attemptsCol(), { ...data, submittedAt: Date.now(), rank: null, percentile: null });
  // Lightweight client-side rank/percentile calc (good enough until a Cloud Function takes over —
  // see PROJECT_MEMORY.md "Next phase").
  const q = query(attemptsCol(), where("testId", "==", data.testId));
  const snap = await getDocs(q);
  const scores = snap.docs.map((d) => (d.data() as GroupTestAttempt).score).sort((a, b) => b - a);
  const rank = scores.indexOf(data.score) + 1;
  const percentile = scores.length > 1 ? Math.round(((scores.length - rank) / (scores.length - 1)) * 100) : 100;
  await updateDoc(ref, { rank, percentile });
  return ref.id;
}

export async function listAttemptsForTest(testId: string): Promise<GroupTestAttempt[]> {
  const q = query(attemptsCol(), where("testId", "==", testId), orderBy("score", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function listAttemptsForStudent(studentId: string): Promise<GroupTestAttempt[]> {
  const q = query(attemptsCol(), where("studentId", "==", studentId), orderBy("submittedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}
