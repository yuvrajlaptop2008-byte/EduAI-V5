import { db } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, limit as qlimit } from "firebase/firestore";

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  actorName: string;
  action: string;     // e.g. "institute.create", "question.delete", "invite.create"
  details: string;     // short human-readable description
  createdAt: number;
}

const col = () => collection(db, "auditLogs");

export async function logAudit(actorUid: string, actorName: string, action: string, details: string) {
  try {
    await addDoc(col(), { actorUid, actorName, action, details, createdAt: Date.now() });
  } catch {
    // Never block the actual operation on logging failure.
  }
}

export async function listRecentAuditLogs(take = 50): Promise<AuditLogEntry[]> {
  const snap = await getDocs(query(col(), orderBy("createdAt", "desc"), qlimit(take)));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}
