# Redis In-Memory Caching, Leaderboards & BullMQ Queues — Marks App

> **Engine**: Redis 7.2 Alpine  
> **Key Capabilities**: Sorted Set Leaderboards, Ephemeral Exam State, BullMQ Background Queues  

---

## 1. Real-Time Leaderboards via Redis Sorted Sets (ZSET)

During state-wide or nationwide JEE/NEET mock tests with 50,000+ concurrent students, relational SQL `ORDER BY score DESC` queries degrade performance. Redis Sorted Sets resolve rank queries in `O(log N)` time.

### 1.1 Key Patterns & Commands
```typescript
import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL || "redis://:redis_secure_pwd@localhost:6379");

/**
 * Record a student's final score in a test's leaderboard
 */
export async function recordScoreInLeaderboard(testId: string, studentId: string, score: number): Promise<void> {
  const key = `leaderboard:${testId}`;
  await redis.zadd(key, score, studentId);
  // Also update cumulative all-time global leaderboard
  await redis.zincrby("leaderboard:global", score, studentId);
}

/**
 * Fetch Top N students with scores
 */
export async function getTopPerformers(testId: string, limit: number = 10) {
  const key = `leaderboard:${testId}`;
  // ZREVRANGE returns highest scores first with their scores
  const results = await redis.zrevrange(key, 0, limit - 1, "WITHSCORES");
  
  const formatted: Array<{ studentId: string; score: number; rank: number }> = [];
  for (let i = 0; i < results.length; i += 2) {
    formatted.push({
      studentId: results[i],
      score: parseFloat(results[i + 1]),
      rank: Math.floor(i / 2) + 1,
    });
  }
  return formatted;
}

/**
 * Get a specific student's exact rank and percentile
 */
export async function getStudentRank(testId: string, studentId: string) {
  const key = `leaderboard:${testId}`;
  const zeroBasedRank = await redis.zrevrank(key, studentId);
  if (zeroBasedRank === null) return null;

  const totalCandidates = await redis.zcard(key);
  const oneBasedRank = zeroBasedRank + 1;
  const percentile = (((totalCandidates - oneBasedRank + 1) / totalCandidates) * 100).toFixed(2);

  return {
    rank: oneBasedRank,
    total: totalCandidates,
    percentile: parseFloat(percentile),
  };
}
```

---

## 2. In-Memory Exam State Caching (Hashes)

During an active 3-hour exam, saving every button click to disk MongoDB creates unnecessary I/O. Redis holds the hot state:

```typescript
// Buffer student's current question and answers
export async function saveExamProgress(studentId: string, testId: string, answers: Record<string, string>, remainingSec: number) {
  const sessionKey = `active_exam:${studentId}:${testId}`;
  await redis.hmset(sessionKey, {
    answers: JSON.stringify(answers),
    remainingSeconds: String(remainingSec),
    lastHeartbeat: String(Date.now()),
  });
  // Auto-expire after 5 hours to prevent memory leaks
  await redis.expire(sessionKey, 18000);
}
```

---

## 3. Background Job Queues (BullMQ)

Heavy operations are processed asynchronously through Redis-backed BullMQ queues:

```
[ HTTP Submit Request ] ──► [ BullMQ: "percentile-queue" ] ──► [ Worker: recomputePercentiles ]
                                                                      │
                                                (Batch Updates Mongo Documents in Chunks of 500)
```

### 3.1 Queue Worker Implementation
```typescript
import { Queue, Worker } from "bullmq";
import { redis } from "./redisClient";

export const percentileQueue = new Queue("percentile-queue", { connection: redis });

export const percentileWorker = new Worker(
  "percentile-queue",
  async (job) => {
    const { testId } = job.data;
    console.log(`[Worker] Re-ranking attempts for test: ${testId}`);
    // 1. Fetch total candidates from Redis ZSET
    // 2. Iterate and batch update MongoDB group_test_attempts documents
  },
  { connection: redis, concurrency: 5 }
);
```
