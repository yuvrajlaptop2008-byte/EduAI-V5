import { db } from "../firebase";
import {
  collection, doc, addDoc, getDocs, deleteDoc, query, where, orderBy,
} from "firebase/firestore";
import type { RemarkDoc } from "../types/schema";

const col = () => collection(db, "remarks");

export async function addRemark(data: Omit<RemarkDoc, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(col(), { ...data, createdAt: Date.now() });
  return ref.id;
}

export async function listRemarksForStudent(studentId: string, parentVisibleOnly = false): Promise<RemarkDoc[]> {
  const clauses = [where("studentId", "==", studentId)];
  if (parentVisibleOnly) clauses.push(where("isParentVisible", "==", true) as any);
  const q = query(col(), ...clauses, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function deleteRemark(id: string) {
  await deleteDoc(doc(db, "remarks", id));
}
