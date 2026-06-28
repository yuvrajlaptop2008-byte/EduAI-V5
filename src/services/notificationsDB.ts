import { db } from "../firebase";
import { collection, doc, addDoc, getDocs, updateDoc, query, where, orderBy, limit, writeBatch } from "firebase/firestore";
import type { Notification } from "../types/schema";

const col = () => collection(db, "notifications");
export const listNotifications = (userId: string, take = 20) =>
  getDocs(query(col(), where("userId", "==", userId), orderBy("createdAt", "desc"), limit(take)))
    .then(s => s.docs.map(d => ({ id: d.id, ...d.data() }) as Notification));
export const createNotification = (data: Omit<Notification, "id" | "createdAt" | "read">) =>
  addDoc(col(), { ...data, read: false, createdAt: Date.now() });
export const markAllRead = async (userId: string) => {
  const snap = await getDocs(query(col(), where("userId", "==", userId), where("read", "==", false)));
  const b = writeBatch(db);
  snap.docs.forEach(d => b.update(d.ref, { read: true }));
  if (!snap.empty) await b.commit();
};
export const unreadCount = (userId: string) =>
  getDocs(query(col(), where("userId", "==", userId), where("read", "==", false))).then(s => s.size);
