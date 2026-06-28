/**
 * EduAI Cloud Functions — server-side counterparts to the client-side logic
 * in src/services/groupTestsDB.ts and src/services/invitesDB.ts.
 *
 * NOT deployed by default. Deploy with:
 *   cd functions && npm install && npm run deploy
 *
 * Why these exist (see PROJECT_MEMORY.md):
 * 1. onTestSubmit  — moves rank/percentile calculation server-side and keeps
 *    EVERY attempt's rank fresh (the client-side version in groupTestsDB.ts
 *    only recalculates the newly-submitted doc, so older docs go stale as
 *    more students submit).
 * 2. assignRole — hardens the invite system. Right now Firestore rules trust
 *    a freshly-signed-up user to self-report role:"teacher"/"parent" (see
 *    firestore.rules isValidUserCreate). This callable lets the client ask a
 *    trusted server to verify the invite and set the role + a matching
 *    Firebase Auth custom claim instead.
 */
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

initializeApp();
const db = getFirestore();

export const onTestSubmit = onDocumentCreated("groupTestAttempts/{attemptId}", async (event) => {
  const snap = event.data;
  if (!snap) return;
  const attempt = snap.data();
  const testId = attempt.testId as string;

  const allForTest = await db.collection("groupTestAttempts").where("testId", "==", testId).get();
  const scores = allForTest.docs
    .map((d) => ({ id: d.id, score: d.data().score as number }))
    .sort((a, b) => b.score - a.score);

  const batch = db.batch();
  scores.forEach((s, i) => {
    const rank = i + 1;
    const percentile = scores.length > 1 ? Math.round(((scores.length - rank) / (scores.length - 1)) * 100) : 100;
    batch.update(db.collection("groupTestAttempts").doc(s.id), { rank, percentile });
  });
  await batch.commit();

  // Keep a lightweight aggregate for fast dashboard reads.
  const avg = scores.reduce((s, x) => s + x.score, 0) / (scores.length || 1);
  await db.doc(`testAnalytics/${testId}`).set(
    { attempts: scores.length, avgScore: Math.round(avg), topScore: scores[0]?.score ?? 0, updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
});

export const assignRole = onCall(async (request) => {
  const uid = request.auth?.uid;
  const email = request.auth?.token.email;
  if (!uid || !email) throw new HttpsError("unauthenticated", "Sign in first.");

  const inviteSnap = await db.collection("invites").where("email", "==", email.toLowerCase()).limit(1).get();
  if (inviteSnap.empty) throw new HttpsError("not-found", "No pending invite for this email.");

  const invite = inviteSnap.docs[0].data();
  await db.doc(`users/${uid}`).set(
    { role: invite.role, instituteId: invite.instituteId, examGroupId: invite.examGroupId ?? null, linkedStudentIds: invite.linkedStudentIds ?? [] },
    { merge: true },
  );
  await getAuth().setCustomUserClaims(uid, { role: invite.role, instituteId: invite.instituteId });
  await inviteSnap.docs[0].ref.delete();

  return { role: invite.role };
});

/** Resets streak to 0 for users who didn't practice yesterday. Schedule: daily, e.g. via Cloud Scheduler trigger. */
export const dailyStreakReset = onCall(async (request) => {
  if (request.auth?.token.role !== "admin") throw new HttpsError("permission-denied", "Admin only.");
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const stale = await db.collection("users").where("lastActive", "<", cutoff).get();
  const batch = db.batch();
  stale.docs.forEach((d) => batch.update(d.ref, { streak: 0 }));
  await batch.commit();
  return { reset: stale.size };
});


// ── Daily streak reset ─────────────────────────────────────────────────────────
import { onSchedule } from "firebase-functions/v2/scheduler";

export const dailyStreakReset = onSchedule("every 24 hours", async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const staleUsers = await db.collection("users")
    .where("lastCompletedDate", "<", yesterdayStr)
    .where("streak", ">", 0)
    .get();

  const batch = db.batch();
  staleUsers.docs.forEach((d) => batch.update(d.ref, { streak: 0 }));
  if (!staleUsers.empty) await batch.commit();
  console.log(`Reset streak for ${staleUsers.size} users.`);
});
