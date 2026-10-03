# Role-Based Access Control (RBAC) Specification — Marks App

> **Security Model**: Strict Role-Based Separation with Principle of Least Privilege  
> **Enforcement Points**: Client Route Guards + Server Firestore Rules + Cloud Functions  

---

## 1. System Role Hierarchy & Descriptions

| Role Key | Display Name | Domain | Primary Purpose |
|---|---|---|---|
| `student` | Aspirant / Student | `/app/*` | Takes tests, practices PYQs, tracks personal progress & mistake log. |
| `teacher` | Faculty / Educator | `/teacher/*` | Creates tests, uploads questions, records attendance and remarks. |
| `parent` | Guardian / Parent | `/parent/*` | Monitors linked students' attendance, remarks, and score trends. |
| `branch_admin` | Campus Administrator | `/admin/*` | Manages batches, students, and faculty within a specific branch. |
| `institute_admin`| Institute Director | `/admin/*` | Oversees all branches, branding, exam groups, and institute analytics. |
| `admin` | Super Administrator | `/admin/*` | Full global access across all institutes, platform configs, and audit logs. |

---

## 2. Granular Permissions Matrix

| Capability / Resource | Student | Teacher | Parent | Branch Admin | Institute Admin | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Attempt CBT Test** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View Own Test Attempts** | ✅ | ✅ (All in batch) | ✅ (Linked child) | ✅ | ✅ | ✅ |
| **Create / Edit Group Tests** | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Publish / Delete Tests** | ❌ | ✅ (Own tests) | ❌ | ✅ | ✅ | ✅ |
| **Mark Daily Attendance** | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Write Student Remarks** | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **View Student Remarks** | ❌ | ✅ | ✅ (If parent-visible) | ✅ | ✅ | ✅ |
| **Upload Questions (CSV/Form)**| ❌ | ✅ (Pending review)| ❌ | ✅ | ✅ | ✅ |
| **Approve / Reject Questions**| ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Create Batches / Branches** | ❌ | ❌ | ❌ | ✅ (Branch only) | ✅ | ✅ |
| **Change User Roles** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **View Platform Audit Logs** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Toggle Maintenance Mode** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 3. Client Route Protection Pattern

Client routes are secured using higher-order wrapper components in `src/App.tsx`:

```tsx
interface ProtectedRouteProps {
  allowedRoles: Array<"student" | "teacher" | "admin" | "parent">;
  children: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <SkeletonPage />;
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  const normalized = normalizeRole(profile.role);
  if (!allowedRoles.includes(normalized)) {
    // Redirect unauthorized user to their own home dashboard
    return <Navigate to={ROLE_HOME[normalized] || "/login"} replace />;
  }

  return <>{children}</>;
}
```

### Route Declaration Example:
```tsx
<Route
  path="/teacher/*"
  element={
    <ProtectedRoute allowedRoles={["teacher", "admin"]}>
      <TeacherModule />
    </ProtectedRoute>
  }
/>
```

---

## 4. Firestore Security Rule Helpers for RBAC

Within `firebase/firestore.rules`, roles are verified via helper functions:

```javascript
function isSignedIn() {
  return request.auth != null;
}

function getUserData() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
}

function hasRole(targetRole) {
  return isSignedIn() && getUserData().role == targetRole;
}

function isAdmin() {
  return isSignedIn() && (
    getUserData().role == "admin" ||
    getUserData().role == "institute_admin" ||
    getUserData().role == "branch_admin"
  );
}

function isTeacher() {
  return isSignedIn() && (getUserData().role == "teacher" || isAdmin());
}

function isParent() {
  return isSignedIn() && getUserData().role == "parent";
}
```
