import { db } from "../firebase";
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, arrayUnion, arrayRemove } from "firebase/firestore";
import type { Branch } from "../types/schema";

const col = () => collection(db, "branches");
export const listBranches = (instituteId: string) =>
  getDocs(query(col(), where("instituteId", "==", instituteId))).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }) as Branch));
export const createBranch = (data: Omit<Branch, "id" | "createdAt">) =>
  addDoc(col(), { ...data, createdAt: Date.now() }).then(r => r.id);
export const deleteBranch = (id: string) => deleteDoc(doc(db, "branches", id));
export const addBranchAdmin = (branchId: string, uid: string) =>
  updateDoc(doc(db, "branches", branchId), { adminUids: arrayUnion(uid) });
export const removeBranchAdmin = (branchId: string, uid: string) =>
  updateDoc(doc(db, "branches", branchId), { adminUids: arrayRemove(uid) });
