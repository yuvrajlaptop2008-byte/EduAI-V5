import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { LeaderboardEntry } from "../types/schema";

export async function getGlobalLeaderboard(
  period: "all" | "weekly" | "monthly" = "all",
  topCount: number = 20
): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, "leaderboard"),
    where("period", "==", period),
    orderBy("score", "desc"),
    limit(topCount)
  );

  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as LeaderboardEntry);
}
