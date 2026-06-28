# EduAI — Production Deploy Guide

## Prerequisites
- Node.js 20+
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project with **Blaze (pay-as-you-go)** plan (required for Cloud Functions and Storage)

---

## Step 1 — Firebase Project Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → Create project
2. Enable these services:
   - **Authentication** → Email/Password + Google
   - **Firestore** → Production mode, region `nam5` (or nearest to you)
   - **Storage** → Default bucket
   - **Functions** → Requires Blaze plan
   - **Hosting** → Connected to your domain

3. Download your Firebase config:
   - Project Settings → Your apps → Web app → Config
   - Replace `firebase-applet-config.json` with your actual config:

```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "YOUR_SENDER_ID",
  "appId": "YOUR_APP_ID",
  "firestoreDatabaseId": "(default)"
}
```

---

## Step 2 — Bootstrap Admin Account

You must manually set the first admin account in Firestore — the app can't do this itself (by design — no one can self-promote to admin).

1. Create your account by signing up in the app normally
2. Go to Firebase Console → Firestore → `users` collection
3. Find your user document (it's your Firebase UID)
4. Edit the `role` field: change `"user"` → `"admin"`
5. Log out and log back in — you're now an Admin

---

## Step 3 — Deploy

```bash
# 1. Install dependencies
npm install
cd functions && npm install && cd ..

# 2. Build the frontend
npm run build

# 3. Login to Firebase
firebase login

# 4. Link to your project
firebase use your-project-id

# 5. Deploy everything
firebase deploy

# Or deploy parts separately:
firebase deploy --only hosting          # Frontend
firebase deploy --only firestore        # Rules + indexes
firebase deploy --only functions        # Cloud Functions (needs Blaze)
firebase deploy --only storage          # Storage rules
```

---

## Step 4 — Seed Demo Data (optional)

After your first admin login:
1. Go to Admin → Settings
2. Click **Seed Demo Data**
3. This creates: 1 demo institute, 4 exam groups (JEE Main/Adv/NEET/School), 20 sample questions, 2 teachers, 5 students

---

## Step 5 — Custom Domain (optional)

1. Firebase Console → Hosting → Add custom domain
2. Add your domain (e.g. `app.yourinstitute.com`)
3. Copy the DNS records Firebase gives you to your domain registrar
4. Wait 24–48h for propagation

Update `public/sitemap.xml` and `index.html` og:url with your real domain.

---

## Firestore Indexes

All required composite indexes are in `firestore.indexes.json` and deploy automatically with `firebase deploy --only firestore`.

If you see "index required" errors in the browser console, the indexes are still building — wait 5–10 minutes after first deploy.

---

## Cloud Functions

Functions are in `functions/src/index.ts`. Key functions:

| Function | Trigger | What it does |
|---|---|---|
| `onTestSubmit` | New doc in `groupTestAttempts` | Recalculates rank+percentile for ALL students on that test |
| `assignRole` | HTTPS callable | Server-side invite verification → assigns Firebase Auth custom claim |
| `dailyStreakReset` | Scheduled (every 24h) | Resets streak for users who didn't study yesterday |

---

## Environment (no .env needed)

Firebase config comes from `firebase-applet-config.json` (not environment variables). This is intentional — it's a client-side app and Firebase security is enforced via Firestore Rules, not by hiding the config.

**Never commit `.env` files or private keys.** The `firebase-applet-config.json` is public-safe (Firebase API keys are rate-limited by domain in the Firebase Console).

---

## Scaling Considerations

### Firestore
- All queries have composite indexes (in `firestore.indexes.json`)
- Avoid unbounded collection reads — all list queries have `limit()` applied
- For > 100k questions: add Algolia search (free tier handles 10k records/month)
- For > 1M questions: shard by `subject` across subcollections

### Functions
- `onTestSubmit` does a full re-rank on every submission — fine up to ~500 concurrent students per test. For larger cohorts, switch to scheduled re-ranking.
- Cold start: ~1s for Gen2 functions. Use `minInstances: 1` in production for zero cold start on `assignRole`.

### Storage
- PDF imports go to `pdf-imports/{uid}/...` — set a lifecycle rule to auto-delete after 7 days (Firebase Console → Storage → Rules or Lifecycle)
- User avatars: compress to < 200KB client-side before upload

### Authentication
- Rate limits: Firebase Auth allows 100 signups/IP/hour by default — fine for launch
- Google Sign-In: enable in Firebase Console → Authentication → Sign-in methods

### Hosting
- Firebase Hosting CDN is global — no further CDN setup needed
- JS chunks are cache-immutable (1-year cache) — update happens automatically on next deploy via content hash

---

## Monitoring

- **Firebase Console → Functions → Logs** — function errors and latency
- **Firebase Console → Firestore → Usage** — reads/writes/deletes (watch for unexpected spikes)
- **Firebase Console → Hosting → Analytics** — page views, bounce rate
- Add Firebase Performance Monitoring: `npm install firebase/performance` + `import { getPerformance } from 'firebase/performance'; getPerformance(app);`

---

## Security Checklist Before Launch

- [ ] Replace `firebase-applet-config.json` with real project config
- [ ] Bootstrap first admin account in Firestore Console
- [ ] Find `isAdmin()` in `firestore.rules` — remove any hardcoded email backdoor from the original dev account
- [ ] Test Firestore rules: `firebase emulators:start` then run your test scenarios
- [ ] Enable App Check in Firebase Console to block non-app Firestore access
- [ ] Set Storage CORS rules if you're serving PDFs to the browser directly
- [ ] Set Firebase Auth Authorized Domains — add your custom domain
- [ ] Review Function IAM roles — Functions should only have Firestore read/write, not full admin
