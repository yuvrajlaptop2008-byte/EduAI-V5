# Authentication & Identity Architecture — Marks App

> **Identity Provider**: Firebase Authentication (Google Cloud Identity Platform)  
> **Session Strategy**: Client-side JWT persistence + Firestore Role Verification  

---

## 1. Authentication Lifecycle & Architecture

Marks App decouples user authentication from authorization:
1. **Authentication (Identity)**: Managed by Firebase Auth, issuing signed RS256 JSON Web Tokens (JWT) containing basic identity claims (`uid`, `email`, `email_verified`).
2. **Authorization (Role & Institute Context)**: Resolved by reading the user's root document `users/{uid}` in Firestore upon auth state changes.

```
[ User Action: Sign In ]
       │
       ▼
[ Firebase Auth SDK: signInWithEmailAndPassword / signInWithPopup ]
       │
       ▼  (Valid JWT Token Received)
[ onAuthStateChanged Listener Fires in useAuth ]
       │
       ▼
[ Firestore Lookup: getDoc(doc(db, "users", uid)) ]
       │
       ├── Case A: Document Exists ────────► Extract role -> Redirect to ROLE_HOME[role]
       │
       └── Case B: Document Does Not Exist ─► Check pending invite token in localStorage
                                                  │
                                                  ├─ If invite exists -> Consume invite & create user doc
                                                  └─ If no invite -> Create default "student" user doc
```

---

## 2. Role Resolution Engine & Redirect Mapping

Post-authentication redirection is governed by `src/utils/roles.ts`:

```typescript
export const ROLE_HOME: Record<string, string> = {
  student: "/app",
  teacher: "/teacher",
  admin: "/admin",
  parent: "/parent",
  institute_admin: "/admin",
  branch_admin: "/admin",
};

export function normalizeRole(rawRole?: string): "student" | "teacher" | "admin" | "parent" {
  if (!rawRole) return "student";
  const r = rawRole.toLowerCase();
  if (r === "admin" || r === "institute_admin" || r === "branch_admin") return "admin";
  if (r === "teacher" || r === "faculty") return "teacher";
  if (r === "parent") return "parent";
  return "student";
}
```

---

## 3. Invite-Based Role Onboarding Flow

To onboard faculty or institute staff without granting public role-selection dropdowns:

1. **Admin Generates Invite**:
   In `/admin/institutes/:id`, an administrator creates an invite document:
   ```json
   {
     "id": "inv_987654321",
     "email": "teacher.sharma@allen.ac.in",
     "role": "teacher",
     "instituteId": "inst_allen_01",
     "consumed": false,
     "createdAt": 1727800000000
   }
   ```
2. **Recipient Receives URL**:
   The teacher receives an onboarding link: `https://marksapp.io/signup?invite=inv_987654321`.
3. **Consumption on Signup**:
   When the user signs up with that email, the frontend invokes `consumeInviteForEmail()`:
   - Validates that the signed-in email matches the invite email.
   - Marks `consumed: true` on the invite document.
   - Initializes `users/{uid}` with `role: "teacher"` and `instituteId: "inst_allen_01"`.
   - Optionally calls Cloud Function `assignRole` to mint a custom auth claim `{ role: "teacher" }`.

---

## 4. Parent-Student Account Linking

Parents track student progress without sharing login credentials:
1. **Student Code Generation**:
   A student navigates to `/app/profile` and generates a 6-digit linking PIN or displays their registered student email.
2. **Parent Link Request**:
   The parent inputs the student's email or PIN in `/parent`.
3. **Verification & Storage**:
   The parent's user document is updated:
   ```typescript
   await updateDoc(doc(db, "users", parentUid), {
     linkedStudentIds: arrayUnion(studentUid)
   });
   ```
4. **Security Enforcement**:
   Firestore rules allow parents to read attempts, remarks, and attendance records only if `request.auth.uid` is associated in the parent's `linkedStudentIds` array.

---

## 5. Session Resilience & Token Refresh

- **Persistence Mode**: Set to `browserLocalPersistence`. Active sessions survive browser restarts, window closes, and multi-tab workflows.
- **Token Refresh**: The Firebase SDK automatically refreshes the short-lived ID token (1 hour lifespan) using a long-lived refresh token in the background.
- **Sign Out**:
  ```typescript
  import { signOut } from "firebase/auth";
  import { auth } from "@/services/firebase";

  export async function logoutUser(): Promise<void> {
    localStorage.removeItem("active_exam_state");
    await signOut(auth);
    window.location.href = "/login";
  }
  ```
