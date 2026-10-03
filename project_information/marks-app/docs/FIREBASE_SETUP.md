# Firebase Setup & Configuration Guide — Marks App

> **Active Project ID**: `sample-firebase-ai-app-92c68`  
> **Named Database ID**: `ai-studio-71126461-1f2b-45cc-aece-b69e3ddf0341`  
> **SDK Version**: Firebase JS SDK v12.x Modular (`firebase/app`, `firebase/firestore`, `firebase/auth`, `firebase/storage`, `firebase/functions`)  

---

## 1. Firebase Project Provisioning & Active Credentials

Marks App is wired to Firebase with the following production credentials:

```json
{
  "projectId": "sample-firebase-ai-app-92c68",
  "appId": "1:685190964883:web:f25b513d68c1f99d1c0f66",
  "apiKey": "AIzaSyBcvRZtoteabqpaFd0lGTLzNxdUj6yMkuM",
  "authDomain": "sample-firebase-ai-app-92c68.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-71126461-1f2b-45cc-aece-b69e3ddf0341",
  "storageBucket": "sample-firebase-ai-app-92c68.firebasestorage.app",
  "messagingSenderId": "685190964883"
}
```

---

## 2. Critical Constraint: Named Database ID

> [!IMPORTANT]
> This Firebase project uses a **named Firestore database**: `ai-studio-71126461-1f2b-45cc-aece-b69e3ddf0341` (not `(default)`).

When initializing Firestore in client code, the database ID must be explicitly passed:
```typescript
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true, // Prevents WebSocket aborts in strict network environments
  },
  "ai-studio-71126461-1f2b-45cc-aece-b69e3ddf0341"
);
```

---

## 3. Local Environment & Firebase CLI Setup

### 3.1 Install Firebase Tools
```bash
npm install -g firebase-tools
```

### 3.2 Authenticate CLI & Project Link
```bash
firebase login
firebase use sample-firebase-ai-app-92c68
```

### 3.3 Deploying Security Rules & Composite Indexes
Deploying to the named database:
```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firestore composite query indexes
firebase deploy --only firestore:indexes

# Deploy Cloud Storage rules
firebase deploy --only storage

# Deploy Firebase Hosting
firebase deploy --only hosting
```

---

## 4. Testing Firestore Connectivity on Boot

To verify that the named database ID and API credentials can communicate successfully with Google Cloud servers:

```typescript
import { doc, getDocFromServer } from "firebase/firestore";
import { db } from "./firebase";

export async function verifyConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("✅ Firestore connected successfully to database: ai-studio-71126461-1f2b-45cc-aece-b69e3ddf0341");
    return true;
  } catch (err: any) {
    if (err?.message?.includes("client is offline")) {
      console.error("❌ Connection failed: Client is offline or network blocked.");
    }
    return false;
  }
}
```

---

## 5. First Admin User Initialization

Because client-side self-promotion is blocked by `firestore.rules`:
1. Sign up a new account through the `/signup` screen using your admin email.
2. Open the **Firebase Console** → **Firestore Database** → select database `ai-studio-71126461-1f2b-45cc-aece-b69e3ddf0341`.
3. Locate the document `users/{your-uid}`.
4. Set the field `role: "admin"`.
5. Refresh the browser; you will now be granted full access to the `/admin` portal.
