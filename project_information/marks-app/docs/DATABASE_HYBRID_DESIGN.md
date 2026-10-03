# Hybrid Database Design (PostgreSQL + MongoDB + Redis) — Marks App

> **Design Strategy**: Polyglot Persistence Tailored to Query Workloads & Concurrency  
> **Consistency Strategy**: Strong ACID for Relational ERP; Eventual Consistency for Content & Analytics  

---

## 1. Data Distribution Mapping

```
                                  DATA ECOSYSTEM
                                        │
          ┌─────────────────────────────┼─────────────────────────────┐
          ▼                             ▼                             ▼
    [ PostgreSQL 16 ]             [ MongoDB 7.0 ]               [ Redis 7.2 ]
  ACID / Relational ERP       Unstructured / High-Volume      In-Memory Cache & ZSET
  ─────────────────────       ──────────────────────────      ──────────────────────
  • institutes                • custom_questions              • leaderboard:{testId} (ZSET)
  • branches                  • group_tests                   • leaderboard:global (ZSET)
  • batches                   • group_test_attempts           • session:{token} (String)
  • users                     • mistake_notebook              • active_exam:{userId} (Hash)
  • batch_students            • community_solutions           • rate_limit:{ip} (String)
  • batch_teachers            • solution_replies              • bullmq:* (Job Queues)
  • attendance_records
  • teacher_remarks
  • invites
  • audit_logs
```

---

## 2. PostgreSQL Relational Model

PostgreSQL guarantees referential integrity for coaching institutes. If a branch is deleted, cascading constraints cleanly handle associations.

### 2.1 Entity Relationship Diagram (PostgreSQL)
```
[ institutes ] 1 ──< N [ branches ] 1 ──< N [ batches ]
      │                                            │
      │ 1                                          │ N
      ▼ N                                          ▼ M
[ exam_groups ] ─────────────────────────────< [ users ]
      │                                            │
      │ 1                                          │ 1
      ▼ N                                          ▼ N
[ invites ]                                [ attendance_records ]
```

---

## 3. MongoDB Document Model

MongoDB stores entities that require hierarchical nesting, variable LaTeX syntax, and high-frequency writes during exams.

### 3.1 `custom_questions` Document Example
```json
{
  "_id": { "$oid": "651a2b3c4d5e6f7a8b9c0d1e" },
  "id": 10542,
  "subject": "Physics",
  "chapter": "Rotational Motion",
  "topic": "Moment of Inertia",
  "difficulty": "Hard",
  "text": "A circular disc of radius $R$ and mass $M$ has a concentric hole of radius $R/2$. The moment of inertia about an axis passing through its center is:",
  "options": [
    "$\\frac{5}{8} M R^2$",
    "$\\frac{3}{8} M R^2$",
    "$\\frac{1}{2} M R^2$",
    "$\\frac{5}{16} M R^2$"
  ],
  "correctAnswer": 0,
  "solution": "Density $\\sigma = \\frac{M}{\\pi R^2 - \\pi (R/2)^2} = \\frac{4M}{3\\pi R^2}$... $I = \\frac{5}{8} M R^2$.",
  "exam": "JEE Advanced",
  "year": 2024,
  "tags": ["Rotational Dynamics", "Moment of Inertia", "Calculus"],
  "status": "active",
  "createdAt": { "$date": "2026-10-01T10:00:00Z" }
}
```

### 3.2 `group_test_attempts` Document Example
```json
{
  "_id": { "$oid": "651a99887766554433221100" },
  "testId": "test_jee_mock_04",
  "studentId": "uuid-student-rahul-sharma",
  "studentName": "Rahul Sharma",
  "instituteId": "uuid-allen-kota",
  "answers": {
    "10542": "0",
    "10543": "2",
    "10544": "1"
  },
  "markedForReview": ["10544"],
  "score": 196,
  "totalMarks": 300,
  "rank": 4,
  "percentile": 94.25,
  "timeTakenSec": 9840,
  "submittedAt": { "$date": "2026-10-02T12:45:00Z" }
}
```

---

## 4. Redis In-Memory Data Structures

### 4.1 Real-Time Leaderboards via Sorted Sets (ZSET)
Every test attempt pushes the score to a Redis Sorted Set:
```bash
# Store student score: ZADD leaderboard:{testId} <score> <studentId>
ZADD leaderboard:test_jee_mock_04 196 "student_rahul"
ZADD leaderboard:test_jee_mock_04 220 "student_amit"
ZADD leaderboard:test_jee_mock_04 140 "student_priya"

# Fetch Top 10 Rankers with Scores:
ZREVRANGE leaderboard:test_jee_mock_04 0 9 WITHSCORES

# Fetch Specific Student's 1-Based Rank:
ZREVRANK leaderboard:test_jee_mock_04 "student_rahul"
# (Returns 1, meaning 2nd rank overall in O(log N))
```

### 4.2 Real-Time Exam State Buffer (Hash)
During the test, selections are saved to Redis before disk flush:
```bash
HSET exam_session:student_rahul current_q 14 remaining_time 5400
HSET exam_answers:student_rahul "10542" "0" "10543" "2"
EXPIRE exam_session:student_rahul 18000 # 5-hour TTL
```

---

## 5. Cross-Database Synchronization Patterns

1. **Transactional Outbox Pattern**:
   When a student completes a test, the Node.js API writes the primary record to MongoDB and enqueues a background job in Redis via BullMQ.
2. **Worker Processing**:
   The BullMQ worker pulls the job, updates the Redis Sorted Set leaderboard, calculates percentiles, and issues a light summary update to PostgreSQL (`UPDATE users SET points = points + 50 WHERE id = student_id`).
3. **Eventual Consistency Window**:
   Leaderboard standings and percentiles update within `< 500ms` of test submission without blocking the student's immediate confirmation response.
