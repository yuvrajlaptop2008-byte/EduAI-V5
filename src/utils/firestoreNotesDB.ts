import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export interface Note {
  id: string;
  userId: string;
  subject: string;
  chapter: string;
  title: string;
  content: string;
  date: string;
  tags?: string[];
  createdAt?: number;
}

// Fetch all notes for a user
export async function getNotes(userId: string): Promise<Note[]> {
  try {
    const notesRef = collection(db, `users/${userId}/notes`);
    const q = query(notesRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Note));
  } catch (error) {
    console.error("Error getting notes:", error);
    return [];
  }
}

// Add a new note
export async function addNote(
  userId: string,
  note: Omit<Note, "id" | "date" | "userId" | "createdAt">,
): Promise<Note> {
  const notesRef = collection(db, `users/${userId}/notes`);
  const dateStr = new Date().toDateString();
  const newNote = {
    ...note,
    userId,
    date: dateStr,
    tags: note.tags || [],
    createdAt: Date.now(),
  };
  const docRef = await addDoc(notesRef, newNote);
  return { id: docRef.id, ...newNote };
}

// Update an existing note
export async function updateNote(
  userId: string,
  noteId: string,
  updatedFields: Partial<Omit<Note, "id" | "userId">>,
): Promise<void> {
  const noteRef = doc(db, `users/${userId}/notes`, noteId);
  await setDoc(noteRef, updatedFields, { merge: true });
}

// Delete a note
export async function deleteNote(
  userId: string,
  noteId: string,
): Promise<void> {
  const noteRef = doc(db, `users/${userId}/notes`, noteId);
  await deleteDoc(noteRef);
}

// Get a single note by ID
export async function getNoteById(
  userId: string,
  noteId: string,
): Promise<Note | null> {
  const noteRef = doc(db, `users/${userId}/notes`, noteId);
  const snap = await getDoc(noteRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Note;
}
