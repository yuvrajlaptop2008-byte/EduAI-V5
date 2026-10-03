import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env.js";
import { connectMongoDB, getMongoStatus } from "./db/mongo.js";
import { connectPostgres, getPgStatus } from "./db/postgres.js";
import { connectRedis, getRedisStatus } from "./db/redis.js";

// Routes
import questionRoutes from "./routes/questionRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import attemptRoutes from "./routes/attemptRoutes.js";
import mistakeRoutes from "./routes/mistakeRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { runSeed } from "./scripts/seed.js";

const app = express();

// Security & Utility Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: config.corsOrigin === "*" ? true : config.corsOrigin,
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// System Health Check Endpoint
app.get("/api/health", (req: Request, res: Response) => {
  return res.json({
    status: "healthy",
    app: "Marks App Enterprise API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    services: {
      mongodb: getMongoStatus(),
      postgresql: getPgStatus(),
      redis: getRedisStatus(),
    },
  });
});

// Seed API endpoint for instant database population
app.post("/api/seed", async (req: Request, res: Response) => {
  try {
    const result = await runSeed();
    return res.json({ success: true, message: "Seed completed successfully", result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Mount Resource API Routes
app.use("/api/questions", questionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/mistakes", mistakeRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/analytics", analyticsRoutes);

// Root Welcome Endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Marks App / EduAI V5 Enterprise API Server",
    docs: "/api/health",
    endpoints: [
      "/api/questions",
      "/api/exams",
      "/api/attempts",
      "/api/mistakes",
      "/api/leaderboard",
      "/api/analytics",
      "/api/health",
      "/api/seed",
    ],
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.url} not found` });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[ServerError]:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

// Server Initialization
async function startServer() {
  console.log("=================================================");
  console.log("   🚀 Starting Marks App Enterprise Backend");
  console.log("=================================================");

  // Connect to databases in parallel
  await Promise.allSettled([
    connectMongoDB(),
    connectPostgres(),
    connectRedis(),
  ]);

  const server = app.listen(config.port, () => {
    console.log(`[HTTP] Server is listening on http://localhost:${config.port}`);
    console.log(`[HTTP] Health check: http://localhost:${config.port}/api/health`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\n[HTTP] Gracefully shutting down...");
    server.close(() => {
      console.log("[HTTP] Closed out remaining connections.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer();
