import dns from "node:dns";
import mongoose from "mongoose";
import { config } from "../config/env.js";

// Ensure DNS resolves SRV records properly on Windows networks
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {
  // Ignore in environments where setting DNS servers is restricted
}

let isConnected = false;
let lastError: string | null = null;

export async function connectMongoDB(): Promise<boolean> {
  if (isConnected) {
    return true;
  }

  try {
    console.log("[MongoDB] Connecting to MongoDB Atlas cluster...");
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      autoIndex: true,
    });

    isConnected = true;
    lastError = null;
    console.log(`[MongoDB] Connected successfully to host: ${mongoose.connection.host}, database: ${mongoose.connection.name}`);

    mongoose.connection.on("error", (err) => {
      console.error("[MongoDB] Connection error:", err.message);
      isConnected = false;
      lastError = err.message;
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[MongoDB] Disconnected from MongoDB Atlas.");
      isConnected = false;
    });

    return true;
  } catch (error: any) {
    lastError = error.message;
    console.warn("⚠️  [MongoDB] Atlas connection could not be established:", error.message);
    if (error.message.includes("IP that isn't whitelisted") || error.message.includes("whitelist")) {
      console.warn("👉  Tip: Whitelist your IP in MongoDB Atlas: Security > Network Access > Add IP Address (or 0.0.0.0/0 for anywhere).");
    }
    // Don't crash process, allow server to boot with in-memory fallback
    return false;
  }
}

export function getMongoStatus() {
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
    error: lastError,
  };
}
