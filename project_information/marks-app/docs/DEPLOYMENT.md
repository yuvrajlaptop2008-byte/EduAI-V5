# Production Deployment & DevOps Guide — Marks App

> **Deployment Targets**: Firebase Hosting (Global CDN) + Cloud Functions (Node.js 18/20)  
> **CI/CD Platform**: GitHub Actions  

---

## 1. Production Build & Optimization

### 1.1 Pre-Deployment Verification
Before pushing to production, execute the verification suite:
```bash
# 1. Type check
npx tsc --noEmit

# 2. Lint check
npm run lint

# 3. Production Vite build
npm run build
```
Verify that the `dist/` directory generates without bundle bloat warnings. Large libraries (KaTeX, Recharts) should be chunked into separate vendor bundles.

---

## 2. Firebase Hosting Configuration (`firebase.json`)

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/assets/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(woff|woff2|ttf)",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          },
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs20"
  }
}
```

---

## 3. Manual Deployment Commands

```bash
# Full deployment (Hosting + Rules + Indexes + Functions)
firebase deploy

# Target specific modules
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only functions
```

---

## 4. Automated CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml` in your repository:

```yaml
name: Deploy Marks App to Firebase

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install Dependencies
        run: npm ci

      - name: Type Check & Build
        run: |
          npx tsc --noEmit
          npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}

      - name: Deploy to Firebase Hosting & Rules
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
```

---

## 5. Custom Domain & SSL Setup

1. In the **Firebase Console** → **Hosting**, click **Add Custom Domain**.
2. Enter your coaching institute domain (e.g. `exam.allen.in` or `marks.eduai.io`).
3. Add the provided TXT and A records to your DNS provider (Cloudflare, GoDaddy, Route 53).
4. Google will provision a free managed SSL certificate automatically within 1 to 24 hours.
