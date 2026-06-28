import { db } from "../firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import type { LeaderboardEntry } from "../types/schema";

const col = () => collection(db, "leaderboard");
export const getGlobalLeaderboard = (period: "all" | "weekly" | "monthly" = "all", take = 50) =>
  getDocs(query(col(), where("period", "==", period), orderBy("rank", "asc"), limit(take)))
    .then(s => s.docs.map(d => ({ id: d.id, ...d.data() }) as LeaderboardEntry & { id: string }));
export const getGroupLeaderboard = (examGroupId: string, period = "all", take = 50) =>
  getDocs(query(col(), where("examGroupId", "==", examGroupId), where("period", "==", period), orderBy("rank", "asc"), limit(take)))
    .then(s => s.docs.map(d => ({ id: d.id, ...d.data() }) as LeaderboardEntry & { id: string }));
export const getBatchLeaderboard = (batchId: string, period = "all", take = 50) =>
  getDocs(query(col(), where("batchId", "==", batchId), where("period", "==", period), orderBy("rank", "asc"), limit(take)))
    .then(s => s.docs.map(d => ({ id: d.id, ...d.data() }) as LeaderboardEntry & { id: string }));
export const getInstituteLeaderboard = (instituteId: string, period = "all", take = 50) =>
  getDocs(query(col(), where("instituteId", "==", instituteId), where("period", "==", period), orderBy("rank", "asc"), limit(take)))
    .then(s => s.docs.map(d => ({ id: d.id, ...d.data() }) as LeaderboardEntry & { id: string }));
