import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Medal } from "lucide-react";
import { useUser } from "../context/UserContext";
import { getGlobalLeaderboard, getGroupLeaderboard } from "../services/leaderboardDB";
import { getDocs, collection, orderBy, limit, query } from "firebase/firestore";
import { db } from "../firebase";

type Scope = "global" | "group";
type Period = "all" | "weekly" | "monthly";

interface Entry { uid:string; name:string; score:number; rank:number; accuracy:number; examGroupId?:string; }

const MEDAL = ["🥇","🥈","🥉"];

export default function Leaderboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [scope, setScope] = useState<Scope>("group");
  const [period, setPeriod] = useState<Period>("all");
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    setLoading(true);
    const load = async () => {
      try {
        let data: Entry[] = [];
        if (scope === "group" && user?.examGroupId) {
          data = await getGroupLeaderboard(user.examGroupId, period) as any[];
        } else {
          data = await getGlobalLeaderboard(period) as any[];
        }

        // Fallback: build live from groupTestAttempts if leaderboard collection empty
        if (data.length === 0) {
          const snap = await getDocs(query(collection(db,"groupTestAttempts"), orderBy("score","desc"), limit(50)));
          const seen = new Map<string,Entry>();
          snap.forEach(d=>{
            const a = d.data() as any;
            if (!seen.has(a.studentId)) seen.set(a.studentId,{ uid:a.studentId, name:a.studentName||"Student", score:a.score, rank:0, accuracy: a.totalMarks ? Math.round((a.score/a.totalMarks)*100):0 });
          });
          data = Array.from(seen.values()).sort((a,b)=>b.score-a.score).map((e,i)=>({...e,rank:i+1}));
        }
        setEntries(data);
      } catch { setEntries([]); }
      setLoading(false);
    };
    load();
  }, [scope, period, user?.examGroupId]);

  const myRank = entries.findIndex(e=>e.uid===user?.uid);

  return (
    <div className="min-h-screen bg-slate-900 p-4 max-w-lg mx-auto">
      <button onClick={()=>navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-5 text-sm"><ArrowLeft size={16}/>Back</button>
      <div className="flex items-center gap-2 mb-5"><Trophy className="text-amber-400" size={22}/><h1 className="text-xl font-bold text-white">Leaderboard</h1></div>

      <div className="flex gap-2 mb-4">
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
          {(["group","global"] as Scope[]).map(s=>(
            <button key={s} onClick={()=>setScope(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${scope===s?"bg-white/10 text-brand":"text-slate-400"}`}>{s}</button>
          ))}
        </div>
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
          {(["all","weekly","monthly"] as Period[]).map(p=>(
            <button key={p} onClick={()=>setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${period===p?"bg-white/10 text-brand":"text-slate-400"}`}>{p}</button>
          ))}
        </div>
      </div>

      {myRank >= 0 && (
        <div className="mb-4 p-3 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-between">
          <span className="text-sm text-slate-200">Your rank</span>
          <span className="font-extrabold text-brand">#{myRank+1}</span>
        </div>
      )}

      {loading ? <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-brand border-t-transparent rounded-full animate-spin"/></div> : (
        <div className="space-y-2">
          {entries.map((e,i)=>(
            <motion.div key={e.uid} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:Math.min(i*0.025,0.5)}}
              className={`flex items-center gap-3 p-3 rounded-xl border ${e.uid===user?.uid?"bg-brand/10 border-brand/30":"bg-white/5 border-white/10"}`}>
              <span className="w-7 text-center font-extrabold text-sm">{i<3?MEDAL[i]:`#${i+1}`}</span>
              <div className="w-8 h-8 rounded-full bg-brand/10 text-brand font-bold text-xs flex items-center justify-center">
                {e.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-100">{e.name}</p>
                <p className="text-[10px] text-slate-400">Accuracy {e.accuracy}%</p>
              </div>
              <span className="font-extrabold text-brand text-sm">{e.score}</span>
            </motion.div>
          ))}
          {entries.length===0 && <p className="text-sm text-slate-500 text-center py-12">No data yet — take tests to appear here.</p>}
        </div>
      )}
    </div>
  );
}
