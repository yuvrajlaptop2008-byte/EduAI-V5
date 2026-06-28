import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit as qlimit } from "firebase/firestore";
import type { AttendanceRecord, AttendanceStatus } from "../types/schema";

const recordRef = (groupId: string, date: string) =>
  doc(db, "attendance", groupId, "records", date);

export async function markAttendance(
  groupId: string, date: string, markedBy: string, students: Record<string, AttendanceStatus>,
) {
  await setDoc(recordRef(groupId, date), {
    date, groupId, markedBy, markedAt: Date.now(), students,
  } as AttendanceRecord);
}

export async function getAttendance(groupId: string, date: string): Promise<AttendanceRecord | null> {
  const snap = await getDoc(recordRef(groupId, date));
  return snap.exists() ? (snap.data() as AttendanceRecord) : null;
}

export async function listRecentAttendance(groupId: string, take = 31): Promise<AttendanceRecord[]> {
  const q = query(collection(db, "attendance", groupId, "records"), orderBy("date", "desc"), qlimit(take));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as AttendanceRecord);
}

/** % present for a single student over the fetched records. */
export function studentAttendancePct(records: AttendanceRecord[], uid: string): number {
  const relevant = records.filter((r) => r.students[uid]);
  if (relevant.length === 0) return 0;
  const present = relevant.filter((r) => r.students[uid] === "present").length;
  return Math.round((present / relevant.length) * 100);
}
