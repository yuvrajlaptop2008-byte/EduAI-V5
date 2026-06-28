import { db } from "../firebase";
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, arrayUnion, arrayRemove } from "firebase/firestore";
import type { Batch } from "../types/schema";

const col = () => collection(db, "batches");
export const listBatches = (instituteId: string, branchId?: string) => {
  const q = branchId
    ? query(col(), where("instituteId", "==", instituteId), where("branchId", "==", branchId))
    : query(col(), where("instituteId", "==", instituteId));
  return getDocs(q).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }) as Batch));
};
export const createBatch = (data: Omit<Batch, "id" | "createdAt">) =>
  addDoc(col(), { ...data, createdAt: Date.now() }).then(r => r.id);
export const deleteBatch = (id: string) => deleteDoc(doc(db, "batches", id));
export const addStudentToBatch = (batchId: string, uid: string) =>
  updateDoc(doc(db, "batches", batchId), { studentIds: arrayUnion(uid) });
export const removeStudentFromBatch = (batchId: string, uid: string) =>
  updateDoc(doc(db, "batches", batchId), { studentIds: arrayRemove(uid) });
export const assignTeacherToBatch = (batchId: string, uid: string) =>
  updateDoc(doc(db, "batches", batchId), { teacherIds: arrayUnion(uid) });
