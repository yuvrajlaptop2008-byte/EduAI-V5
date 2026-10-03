import pkg from "pg";
const { Pool } = pkg;
import { config } from "../config/env.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool: pkg.Pool | null = null;
let isPgConnected = false;
let lastPgError: string | null = null;

export async function connectPostgres(): Promise<boolean> {
  try {
    pool = new Pool({
      host: config.postgres.host,
      port: config.postgres.port,
      user: config.postgres.user,
      password: config.postgres.password,
      database: config.postgres.database,
      max: 10,
      connectionTimeoutMillis: 3000,
    });

    const client = await pool.connect();
    isPgConnected = true;
    lastPgError = null;
    console.log(`[PostgreSQL] Connected successfully to database: ${config.postgres.database}`);

    // Auto-apply schema migrations
    try {
      const schemaPath = path.resolve(__dirname, "./schema.sql");
      if (fs.existsSync(schemaPath)) {
        const sql = fs.readFileSync(schemaPath, "utf-8");
        await client.query(sql);
        console.log("[PostgreSQL] Relational schema tables verified/created.");
      }
    } catch (migErr: any) {
      console.warn("[PostgreSQL] Schema initialization warning:", migErr.message);
    } finally {
      client.release();
    }

    return true;
  } catch (error: any) {
    isPgConnected = false;
    lastPgError = error.message;
    console.warn("⚠️  [PostgreSQL] Connection not established:", error.message);
    return false;
  }
}

export function getPgPool(): pkg.Pool | null {
  return pool;
}

export function getPgStatus() {
  return {
    connected: isPgConnected,
    host: config.postgres.host,
    database: config.postgres.database,
    error: lastPgError,
  };
}
