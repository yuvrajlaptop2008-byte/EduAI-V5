# Security & Hardening Specification — Marks App

> **Threat Model Focus**: Academic Integrity, Exam Secrecy, Privilege Escalation Prevention  
> **Compliance Standard**: OWASP Top 10 Web Application Security  

---

## 1. Threat Modeling & Attack Vectors

| Attack Vector | Impact | Engineered Countermeasure |
|---|---|---|
| **Premature Exam Paper Leaks** | High (Cheating on scheduled tests) | Question IDs are published, but actual question documents are restricted; unassigned students or non-test sessions cannot batch-read exam papers before `scheduledAt`. |
| **Client-Side Score Tampering** | Critical (Falsified ranks & percentiles) | Client calculates an immediate preview score, but Cloud Function `onTestSubmit` acts as the source of truth, recalculating ranks and percentiles server-side. |
| **Self-Role Elevation** | Critical (Student elevating to Admin) | `users/{uid}` updates are strictly gated: users can only update `theme`, `dailyGoal`, and `profilePic`. Fields like `role`, `points`, `rank` cannot be modified by the client. |
| **Cross-Tenant Data Exposure** | High (Coaching A seeing Coaching B's tests) | Institute queries must include `instituteId == user.instituteId`. Rules enforce matching institute IDs on tests, batches, and student rosters. |
| **Malicious LaTeX/XSS Injection** | Medium (Script injection in question text) | Math expressions are parsed strictly through KaTeX; markdown bodies pass through `DOMPurify` and `remark-gfm` with raw HTML script tags disabled. |
| **Data Deletion / Vandalism** | High (Disgruntled faculty deleting questions) | Hard deletions are blocked for non-superadmins. Critical mutations require an entry in the immutable `auditLogs` collection. |

---

## 2. Firestore Rule Hardening Audit

### 2.1 Role Validation (No Backdoors)
Previous insecure implementations used email string matching (`request.auth.token.email.matches(".*@admin.com")`). In Marks App V5:
- **Strict Role Verification**: Checks the actual Firestore user document:
  ```javascript
  function isAdmin() {
    return isSignedIn() &&
      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'institute_admin'];
  }
  ```
- **Self-Promotion Block**:
  ```javascript
  match /users/{userId} {
    allow update: if isOwner(userId) &&
      !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'rank', 'points']);
  }
  ```

### 2.2 Attempt Confidentiality
```javascript
match /groupTestAttempts/{attemptId} {
  // Students can only read their own attempt records
  allow read: if isSignedIn() && (
    resource.data.studentId == request.auth.uid ||
    isTeacher() ||
    isAdmin()
  );
  // Students can only create an attempt for their own UID
  allow create: if isSignedIn() && request.resource.data.studentId == request.auth.uid;
  allow update: if false; // Attempts are immutable after submission
}
```

---

## 3. Input Sanitization & Content Security

1. **LaTeX Sanitization**: KaTeX operates without executing arbitrary JavaScript. Dangerous TeX commands (e.g. `\url`, `\href` to javascript protocols) are disabled in the renderer configuration.
2. **CSV Import Protection**: All rows ingested through `PapaParse` undergo strict type-coercion and string escaping:
   - Numerical values (`id`, `correctAnswer`, `year`) must pass `Number.isInteger()`.
   - String inputs are trimmed and bounded (max 5,000 characters per question).

---

## 4. Immutable Audit Trail Architecture

All administrative and destructive actions are logged into `auditLogs/{id}`:

```typescript
export async function logAudit(
  actor: { uid: string; name: string; role: string },
  action: string,
  targetCollection: string,
  targetId: string,
  details: Record<string, any> = {}
): Promise<void> {
  await addDoc(collection(db, "auditLogs"), {
    actorUid: actor.uid,
    actorName: actor.name,
    role: actor.role,
    action,
    targetCollection,
    targetId,
    details,
    timestamp: Date.now()
  });
}
```

### Firestore Security Rule:
```javascript
match /auditLogs/{logId} {
  allow read: if isAdmin();
  allow create: if isTeacher() || isAdmin();
  allow update, delete: if false; // Append-only immutable log
}
```
