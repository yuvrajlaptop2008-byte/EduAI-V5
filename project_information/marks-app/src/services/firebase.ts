import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { initializeFirestore, doc, getDocFromServer, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getDatabase } from "firebase/database";

// Fallback config from firebase-applet-config.json
let appletConfig: Record<string, any> = {};
try {
  appletConfig = require("../../firebase-applet-config.json");
} catch (_) {
  // If not bundled via require, import.meta.env handles it
}

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey || "AIzaSyBcvRZtoteabqpaFd0lGTLzNxdUj6yMkuM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || "sample-firebase-ai-app-92c68.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || "sample-firebase-ai-app-92c68",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || "sample-firebase-ai-app-92c68.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || "685190964883",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId || "1:685190964883:web:f25b513d68c1f99d1c0f66",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || appletConfig.firestoreDatabaseId || "ai-studio-71126461-1f2b-45cc-aece-b69e3ddf0341",
};

// 1. Initialize Firebase Singleton App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Firestore with Named Database & Forced Long Polling
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);

// 3. Initialize Ancillary Firebase Services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const rtdb = getDatabase(app);

// 4. Optional Local Emulators
if (import.meta.env.VITE_ENABLE_EMULATORS === "true") {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "localhost", 8080);
  } catch (e) {
    console.warn("Firebase emulators already connected or connection failed", e);
  }
}

// 5. Test Firestore Connection on Boot
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firebase client appears offline. Check network configuration.");
    }
    return false;
  }
}

// 6. Structured Error Diagnostic Handler
export interface FirestoreErrorInfo {
  error: string;
  operationType: "create" | "update" | "delete" | "list" | "get" | "write";
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
  };
}

export function handleFirestoreError(
  error: any,
  operationType: "create" | "update" | "delete" | "list" | "get" | "write",
  path: string | null = null
): never {
  if (error?.message?.includes("Missing or insufficient permissions")) {
    const currentUser = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: currentUser?.uid || "unauthenticated",
        email: currentUser?.email || "none",
        emailVerified: currentUser?.emailVerified || false,
      },
    };
    console.error("Firestore Permission Denied:", errorInfo);
  }
  throw error;
}
