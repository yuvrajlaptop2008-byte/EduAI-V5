import { db } from "../firebase";
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
} from "firebase/firestore";
import type { Institute } from "../types/schema";

const col = () => collection(db, "institutes");

export async function listInstitutes(): Promise<Institute[]> {
  const snap = await getDocs(col());
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function getInstitute(id: string): Promise<Institute | null> {
  const snap = await getDoc(doc(db, "institutes", id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) }) : null;
}

export async function createInstitute(
  data: Omit<Institute, "id" | "createdAt">,
): Promise<string> {
  const ref = await addDoc(col(), { ...data, createdAt: Date.now() });
  return ref.id;
}

export async function updateInstitute(id: string, data: Partial<Institute>) {
  await updateDoc(doc(db, "institutes", id), data as any);
}

export async function deleteInstitute(id: string) {
  await deleteDoc(doc(db, "institutes", id));
}
