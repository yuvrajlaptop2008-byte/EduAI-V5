import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getFunctions } from "firebase/functions";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);

// Force long polling to fix [code=unavailable] in restrictive environments
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId,
);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);
export const functions = getFunctions(app);

// Critical Constraint: Test connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db,"test","connection"));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("the client is offline")
    ) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Global Error Handler
export interface FirestoreErrorInfo {
  error: string;
  operationType:"create" |"update" |"delete" |"list" |"get" |"write";
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string }[];
  };
}

export function handleFirestoreError(
  error: any,
  operationType: string,
  path: string | null = null,
): never {
  if (error?.message?.includes("Missing or insufficient permissions")) {
    const currentUser = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType: operationType as any,
      path,
      authInfo: {
        userId: currentUser?.uid ||"",
        email: currentUser?.email ||"",
        emailVerified: currentUser?.emailVerified || false,
        isAnonymous: currentUser?.isAnonymous || true,
        providerInfo:
          currentUser?.providerData.map((p) => ({
            providerId: p.providerId,
            displayName: p.displayName ||"",
            email: p.email ||"",
          })) || [],
      },
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}
