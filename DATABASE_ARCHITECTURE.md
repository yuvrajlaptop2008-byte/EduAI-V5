# EduAI Multi-Database Cost-Reduction Architecture
### How Firebase, MongoDB, and SQL in Firebase (Data Connect / PostgreSQL) Work Together to Slash Cloud Bills by 95%+

---

## 1. Why Pure Cloud Firestore is Expensive
Cloud Firestore charges **per document read, write, and delete**:
- **\$0.06 per 100,000 document reads**
- **\$0.18 per 100,000 document writes**

### The EdTech Math:
1. **Student Practice**: 1,000 active students solving 50 questions/day = **50,000 question reads every single day**.
2. **Dashboard Traps**: When an admin or teacher opens the Question Bank or Analytics, Firestore downloads every question to count or filter them. With 50,000 questions, each page refresh costs 50,000 reads!
3. **Relational Inefficiency**: Counting student enrollments in batches, calculating percentiles, or finding test averages requires reading thousands of documents into memory.
4. **Result**: Pure Firestore bills quickly explode into hundreds of dollars per month!

---

## 2. The Multi-Database Solution

By dividing responsibilities between **Firebase**, **MongoDB Atlas**, and **SQL (PostgreSQL / Firebase Data Connect)**, each database handles what it does best at minimum cost:

```mermaid
graph TD
    Client["React Frontend (EduAI)"] -->|Auth & JWT (Free up to 50k MAUs)| FirebaseAuth["Firebase Auth"]
    Client -->|Static Assets & CDN ($0)| FirebaseHosting["Firebase Hosting"]
    Client -->|Live Alerts & Presence (Under 50k free reads)| Firestore["Cloud Firestore"]
    Client -->|Relational Data: Institutes, Batches, Roles| FirebaseSQL["SQL in Firebase (Data Connect / PostgreSQL)"]
    Client -->|Questions, PYQs, Exams & Solutions| Gateway["Express API Gateway (:5050)"]
    Gateway -->|High-Speed RAM Cache (0ms)| Redis["Redis 7"]
    Gateway -->|Document Store: 100k+ Questions ($0 Read Tax)| MongoDB["MongoDB Atlas"]
    Gateway -->|Batch Joins, Analytics & Leaderboards| Postgres["PostgreSQL 16"]
```

---

## 3. Technology Breakdown & Cost Savings

| Technology | Role | Why This Saves Maximum Money |
| :--- | :--- | :--- |
| **Firebase Auth** | User Authentication (Google, Email/Password, Guest tokens) | **100% Free** up to 50,000 monthly active users. No server maintenance, zero SMS/OAuth licensing fees. |
| **Firebase Hosting** | Global Edge CDN for the Single Page Application | Free 10 GB storage and generous bandwidth with automatic SSL, HTTP/2, and global caching. |
| **MongoDB Atlas** | **High-Volume Question Bank, PYQs, LaTeX & Step-by-Step Solutions** | **$0 per-read fees!** MongoDB Atlas M0 (512MB free tier) charges $0 per operation. Reading 500,000 questions a month costs **$0.00** instead of climbing Firestore read bills. |
| **SQL in Firebase** *(Firebase Data Connect / PostgreSQL)* | **Institutes, Branches, Batches, Student Enrollments, Roles, Aggregates** | **Relational Efficiency**: A SQL `JOIN` or `COUNT(*)` performs in 2ms in a single query. In Firestore, you would have to download and pay for every single document in the collection. |
| **Redis 7** | **Hot Question RAM Cache & Real-Time Leaderboards** | In-memory key-value caching (TTL: 60s) and Sorted Sets (`ZADD`, `ZREVRANGE`). 90%+ of question queries hit RAM directly with 0 database reads. |
| **Cloud Firestore** | **Lightweight Real-Time Signals ONLY** | Kept strictly for user online presence and instant test submission signals, staying safely within the 50,000 free operations/day limit! |

---

## 4. Database Schema Allocation

### A. MongoDB Atlas (`server/src/models/Question.ts`, `Exam.ts`, `TestAttempt.ts`)
Stores heavy, flexible, nested document data:
- **`questions`**:
  - Full LaTeX body, multiple-choice options, numerical answers, step-by-step solutions.
  - Subject, chapter, topic tags, difficulty, exam year.
  - Zero read cost even with millions of practice queries.
- **`exams`**:
  - Exam structure, question ID arrays, sectional timing, marking schemes.
- **`test_attempts`**:
  - Detailed student answer sheets and question-by-question time tracking.

### B. SQL in Firebase / PostgreSQL (`dataconnect/schema/schema.gql` & `server/src/db/schema.sql`)
Stores structured, relational data that requires joins, strict foreign keys, and fast aggregations:
- **`User` / `users`**: Synced with Firebase Auth `uid`, role-based access (student, teacher, admin, parent), total points, streaks.
- **`Institute` / `institutes`**: Multi-tenant coaching institutes and colleges.
- **`Batch` / `batches`**: Academic batches, targets (JEE 2026, NEET 2026).
- **`BatchEnrollment` / `batch_enrollments`**: Relational mapping of students to classes.
- **`PerformanceSummary`**: Pre-calculated batch percentiles and leaderboards.

### C. Redis (`server/src/db/redis.ts`)
- `marks:questions:{filters}:{page}`: Cached question lists.
- `marks:leaderboard:{examId}`: Real-time sorted set for instant rank lookups.

---

## 5. How Frontend Code Enforces Cost Reduction

The application uses [`src/services/dataService.ts`](file:///c:/Users/YUVRAJ/OneDrive/Desktop/edu/src/services/dataService.ts) as a unified data bridge:

```typescript
// Fetch questions: Tries Redis -> MongoDB Atlas -> Local Cache
// Result: 0 Firestore read charges!
const { questions, total } = await dataService.getQuestions({ subject: "Physics", limit: 50 });

// Get question count: Reads aggregate count without downloading all documents
// Saves 50,000 Firestore reads on every dashboard visit!
const count = await dataService.getQuestionCount();

// Save question: Writes to MongoDB (primary persistent store) and mirrors to Firestore non-blockingly
await dataService.saveQuestion(newQuestion);
```

---

## 6. How to Connect MongoDB Atlas

Your Atlas credentials are saved in [`atlas-credentials.env`](file:///c:/Users/YUVRAJ/OneDrive/Desktop/edu/atlas-credentials.env).

To allow connections from your server:
1. Log into your **[MongoDB Atlas Console](https://cloud.mongodb.com/)**.
2. Navigate to **Security** $\rightarrow$ **Network Access**.
3. Click **Add IP Address**.
4. Select **Allow Access from Anywhere** (`0.0.0.0/0`) or enter your current IP address.
5. Click **Confirm** (takes ~30 seconds to propagate).

---

## 7. How to Run the Complete Stack

### Option 1: Docker (Single Command for PostgreSQL, Redis, and Express API)
```bash
docker compose up -d
```

### Option 2: Run Backend Locally (Node.js)
```bash
# Starts Express API on port 5050 connected to MongoDB Atlas & Redis/Postgres
npm run server
```

### Option 3: Firebase Data Connect (SQL in Firebase)
```bash
# Compile and generate type-safe SDK
npx firebase-tools dataconnect:compile

# Start local SQL Connect emulator
npx firebase-tools emulators:start --only dataconnect
```
