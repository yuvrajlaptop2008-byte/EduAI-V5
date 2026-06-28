import { db } from "../firebase";
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, arrayUnion, arrayRemove,
} from "firebase/firestore";
import type { ExamGroup } from "../types/schema";

const col = () => collection(db, "examGroups");

export async function listExamGroups(instituteId?: string): Promise<ExamGroup[]> {
  const q = instituteId
    ? query(col(), where("instituteId", "==", instituteId))
    : col();
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function getExamGroup(id: string): Promise<ExamGroup | null> {
  const snap = await getDoc(doc(db, "examGroups", id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) }) : null;
}

export async function createExamGroup(
  data: Omit<ExamGroup, "id" | "createdAt" | "studentIds">,
): Promise<string> {
  const ref = await addDoc(col(), { ...data, studentIds: [], createdAt: Date.now() });
  return ref.id;
}

export async function deleteExamGroup(id: string) {
  await deleteDoc(doc(db, "examGroups", id));
}

/** Move a student into a group (and stamp examGroupId on their user doc). */
export async function assignStudentToGroup(studentUid: string, groupId: string, previousGroupId?: string | null) {
  if (previousGroupId) {
    await updateDoc(doc(db, "examGroups", previousGroupId), {
      studentIds: arrayRemove(studentUid),
    });
  }
  await updateDoc(doc(db, "examGroups", groupId), {
    studentIds: arrayUnion(studentUid),
  });
  await updateDoc(doc(db, "users", studentUid), { examGroupId: groupId });
}

export const DEFAULT_GROUPS: { name: string; type: ExamGroup["type"] }[] = [
  { name: "JEE Main", type: "JEE" },
  { name: "JEE Advanced", type: "JEE_ADV" },
  { name: "NEET", type: "NEET" },
  { name: "School", type: "School" },
];
