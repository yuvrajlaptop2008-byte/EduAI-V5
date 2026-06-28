import { db } from "../firebase";
import { collection, doc, addDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";

export interface Invite {
  id: string;
  email: string;
  role: "teacher" | "admin" | "parent" | "student";
  instituteId: string;
  examGroupId: string | null;
  linkedStudentIds: string[];
  createdAt: number;
}

const col = () => collection(db, "invites");

export async function createInvite(data: Omit<Invite, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(col(), { ...data, createdAt: Date.now() });
  return ref.id;
}

export async function listInvites(instituteId: string): Promise<Invite[]> {
  const snap = await getDocs(query(col(), where("instituteId", "==", instituteId)));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function deleteInvite(id: string) {
  await deleteDoc(doc(db, "invites", id));
}

/** Called once at signup time — looks up a pending invite by email (case-insensitive). */
export async function consumeInviteForEmail(email: string): Promise<Invite | null> {
  const snap = await getDocs(query(col(), where("email", "==", email.toLowerCase())));
  if (snap.empty) return null;
  const inviteDoc = snap.docs[0];
  const invite = { id: inviteDoc.id, ...(inviteDoc.data() as any) } as Invite;
  await deleteDoc(inviteDoc.ref);
  return invite;
}
