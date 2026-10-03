import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

import { connectMongoDB } from "./db/mongo.js";

import mongoose from "mongoose";

async function main() {
  console.log("Testing Atlas connection...");
  try {
    const success = await connectMongoDB();
    if (success) {
      console.log("Atlas Connected successfully! Ready State:", mongoose.connection.readyState);
      const collections = await mongoose.connection.db?.listCollections().toArray();
      console.log("Existing collections:", collections?.map((c: any) => c.name));
    } else {
      console.log("Atlas connection failed to establish.");
    }
    process.exit(0);
  } catch (err: any) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
}

main();
