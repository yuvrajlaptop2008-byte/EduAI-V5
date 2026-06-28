import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase";

export interface BookmarkedQuestion {
  id: string; // combination of source + questionId
  questionId: number;
  subject: string;
  chapter: string;
  difficulty: string;
  text: string;
  options: string[];
  correctAnswer: number;
  solution: string;
  source: string; // "practice" | "dpp" | "test"
  bookmarkedAt: number;
}

// Save a bookmarked question to Firestore
export async function addBookmark(
  userId: string,
  bookmark: Omit<BookmarkedQuestion, "bookmarkedAt">
): Promise<void> {
  const ref = doc(db, `users/${userId}/bookmarks`, bookmark.id);
  await setDoc(ref, {
    ...bookmark,
    bookmarkedAt: Date.now()
  });
}

// Remove a bookmarked question from Firestore
export async function removeBookmark(
  userId: string,
  bookmarkId: string
): Promise<void> {
  const ref = doc(db, `users/${userId}/bookmarks`, bookmarkId);
  await deleteDoc(ref);
}

// Get all bookmarked questions for a user
export async function getBookmarks(userId: string): Promise<BookmarkedQuestion[]> {
  try {
    const ref = collection(db, `users/${userId}/bookmarks`);
    const q = query(ref, orderBy("bookmarkedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as BookmarkedQuestion);
  } catch (error) {
    console.error("Error getting bookmarks:", error);
    return [];
  }
}

// Check if a specific question is bookmarked
export async function isQuestionBookmarked(
  userId: string,
  bookmarkId: string
): Promise<boolean> {
  try {
    const ref = doc(db, `users/${userId}/bookmarks`, bookmarkId);
    const snap = await getDoc(ref);
    return snap.exists();
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return false;
  }
}
