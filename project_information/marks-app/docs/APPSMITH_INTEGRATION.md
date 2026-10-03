# Appsmith Advanced Internal Dashboards Specification — Marks App

> **Engine**: Appsmith Community Edition (Self-Hosted on Docker Port 8090)  
> **Role**: Internal Operations, Support Backoffice, Institute License Management, Quality Assurance  

---

## 1. Role of Appsmith in Marks App

Building internal administrative backoffices from scratch in custom React is time-consuming and expensive. Marks App delegates internal operations, billing verification, and technical support to **Appsmith**, connected directly to our Docker databases:

```
[ Appsmith Operations Console (Port 8090) ]
        │
        ├── PostgreSQL Datasource ──► Institute Licensing, User Roles, Attendance Audits
        ├── MongoDB Datasource    ──► Raw Question Document Inspector, Test Attempt Logs
        ├── Redis Datasource      ──► Live Leaderboard ZSET Inspector, Cache Clearing
        └── REST API Datasource   ──► Trigger BullMQ Percentile Re-Rank, Broadcast Banner
```

---

## 2. Pre-Configured Internal Dashboards

### 2.1 Dashboard 1: Institute Onboarding & License Manager
- **Datasource**: PostgreSQL (`marksapp_core`)
- **UI Widgets**:
  - Table of active institutes with search by name/slug.
  - Form to provision a new Institute, generate default Super Admin credentials, and create the first branch.
  - License allocation widget (Max allowed students, valid until date).
- **Sample Appsmith Query (`get_institutes.sql`)**:
  ```sql
  SELECT i.id, i.name, i.slug, COUNT(DISTINCT b.id) AS branch_count, COUNT(DISTINCT u.id) AS student_count
  FROM institutes i
  LEFT JOIN branches b ON b.institute_id = i.id
  LEFT JOIN users u ON u.institute_id = i.id AND u.role = 'student'
  GROUP BY i.id, i.name, i.slug
  ORDER BY student_count DESC;
  ```

---

### 2.2 Dashboard 2: Question Quality Assurance & Approval Desk
- **Datasource**: MongoDB (`marksapp_questions`)
- **UI Widgets**:
  - Filter questions where `status == "pending"`.
  - Side-by-side comparison: Raw LaTeX code vs rendered formula preview.
  - One-click buttons:
    - **Approve**: Updates document to `{ status: "active" }` and triggers Meilisearch index.
    - **Reject**: Updates document to `{ status: "rejected", rejectReason: Input_Reason.text }`.
- **Sample Appsmith Mongo Aggregation (`fetch_pending_questions.json`)**:
  ```javascript
  {
    "find": "custom_questions",
    "filter": { "status": "pending" },
    "sort": { "createdAt": -1 },
    "limit": 50
  }
  ```

---

### 2.3 Dashboard 3: Live Exam Proctoring & Attempt Investigator
- **Datasource**: MongoDB & Redis
- **Use Case**: When a student or parent reports an exam disconnect or dispute.
- **UI Widgets**:
  - Search by Student Email or Exam Attempt ID.
  - Inspect timestamped answer logs, marked-for-review counts, and time-taken seconds.
  - "Reset Exam Session" action: Flushes Redis keys `active_exam:student_id` allowing a re-attempt in exceptional circumstances.

---

### 2.4 Dashboard 4: Redis Queue & BullMQ Monitor
- **Datasource**: Redis (`marksapp_redis`)
- **UI Widgets**:
  - Monitored Redis Keys: `bull:percentile-queue:wait`, `bull:percentile-queue:failed`.
  - Retry failed percentile re-ranking jobs with a single click.
  - Live inspection of `leaderboard:global` top 50 scores.
