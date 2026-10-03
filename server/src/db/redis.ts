import { Redis } from "ioredis";
import { config } from "../config/env.js";

let redisClient: Redis | null = null;
let isRedisConnected = false;
let lastRedisError: string | null = null;

// In-memory fallback cache and leaderboard for environments without active Redis daemon
const memoryCache = new Map<string, { value: any; expiresAt: number | null }>();
const memoryLeaderboards = new Map<string, Map<string, number>>();

export async function connectRedis(): Promise<boolean> {
  try {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // Don't hang or spam retries if offline
      connectTimeout: 2000,
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    redisClient.on("error", (err) => {
      // Catch error silently so unhandled error event is not emitted
      lastRedisError = err.message;
      isRedisConnected = false;
    });

    await redisClient.connect();
    isRedisConnected = true;
    lastRedisError = null;
    console.log("[Redis] Connected successfully to Redis server.");
    return true;
  } catch (err: any) {
    isRedisConnected = false;
    lastRedisError = err.message;
    console.warn("⚠️  [Redis] Server not detected, using high-speed in-memory cache/leaderboard engine.");
    return false;
  }
}

export function getRedisStatus() {
  return {
    connected: isRedisConnected,
    mode: isRedisConnected ? "redis-server" : "in-memory-engine",
    error: lastRedisError,
  };
}

// Universal Redis Service (Delegates to Redis if online, otherwise in-memory fallback)
export const cacheService = {
  async get<T = any>(key: string): Promise<T | null> {
    if (isRedisConnected && redisClient) {
      try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
      } catch {
        // Fall back to memory
      }
    }
    const item = memoryCache.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    return item.value;
  },

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (isRedisConnected && redisClient) {
      try {
        const str = JSON.stringify(value);
        if (ttlSeconds) {
          await redisClient.set(key, str, "EX", ttlSeconds);
        } else {
          await redisClient.set(key, str);
        }
        return;
      } catch {
        // Fall back to memory
      }
    }
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    memoryCache.set(key, { value, expiresAt });
  },

  async delete(key: string): Promise<void> {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.del(key);
      } catch {}
    }
    memoryCache.delete(key);
  },
};

// Universal Leaderboard Service (ZSET operations)
export const leaderboardService = {
  async recordScore(boardKey: string, memberId: string, score: number): Promise<void> {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.zadd(boardKey, score, memberId);
        return;
      } catch {}
    }
    if (!memoryLeaderboards.has(boardKey)) {
      memoryLeaderboards.set(boardKey, new Map());
    }
    memoryLeaderboards.get(boardKey)!.set(memberId, score);
  },

  async getTopRanks(boardKey: string, limit: number = 20): Promise<Array<{ memberId: string; score: number; rank: number }>> {
    if (isRedisConnected && redisClient) {
      try {
        // ZREVRANGE boardKey 0 limit-1 WITHSCORES
        const results = await redisClient.zrevrange(boardKey, 0, limit - 1, "WITHSCORES");
        const list: Array<{ memberId: string; score: number; rank: number }> = [];
        for (let i = 0; i < results.length; i += 2) {
          list.push({
            memberId: results[i],
            score: parseFloat(results[i + 1]),
            rank: i / 2 + 1,
          });
        }
        return list;
      } catch {}
    }

    const board = memoryLeaderboards.get(boardKey);
    if (!board) return [];

    const sorted = Array.from(board.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    return sorted.map(([memberId, score], idx) => ({
      memberId,
      score,
      rank: idx + 1,
    }));
  },

  async getMemberRank(boardKey: string, memberId: string): Promise<{ rank: number; score: number } | null> {
    if (isRedisConnected && redisClient) {
      try {
        const rank = await redisClient.zrevrank(boardKey, memberId);
        const score = await redisClient.zscore(boardKey, memberId);
        if (rank !== null && score !== null) {
          return { rank: rank + 1, score: parseFloat(score) };
        }
      } catch {}
    }

    const board = memoryLeaderboards.get(boardKey);
    if (!board || !board.has(memberId)) return null;

    const score = board.get(memberId)!;
    const sorted = Array.from(board.entries()).sort((a, b) => b[1] - a[1]);
    const rank = sorted.findIndex(([id]) => id === memberId) + 1;
    return { rank, score };
  },
};
