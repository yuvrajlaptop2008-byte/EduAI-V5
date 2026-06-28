import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, TrendingUp, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { buildStudentAnalytics, type StudentAnalytics } from "../services/analyticsDB";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

export default function StudentAnalyticsPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [data, setData] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    buildStudentAnalytics(user.uid).then(setData).finally(()=>setLoading(false));
  }, [user?.uid]);

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"/></div>;
  if (!data) return null;

  const subjectData = Object.entries(data.subjectAccuracy).map(([sub,acc])=>({ subject: sub, accuracy: acc.total ? Math.round((acc.correct/acc.total)*100) : 0 }));

  return (
    <div className="min-h-screen bg-slate-900 p-4 max-w-2xl mx-auto">
      <button onClick={()=>navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-5 text-sm"><ArrowLeft size={16}/>Back</button>
      <div className="flex items-center gap-2 mb-6"><TrendingUp className="text-brand" size={22}/><h1 className="text-xl font-bold text-white">My Analytics</h1></div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Tests",val:data.totalTests,icon:"📝"},
          {label:"Avg Score",val:data.avgScore,icon:"📊"},
          {label:"Accuracy",val:`${data.avgAccuracy}%`,icon:"🎯"},
          {label:"Best Rank",val:data.bestRank?`#${data.bestRank}`:"—",icon:"🏆"},
        ].map((s,i)=>(
          <motion.div key={s.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
            className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-lg font-extrabold text-brand">{s.val}</p>
            <p className="text-[10px] text-slate-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {data.weeklyScores.length > 1 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 h-52">
          <p className="text-sm font-semibold text-slate-200 mb-3">Score Trend (weekly)</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.weeklyScores}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15}/>
              <XAxis dataKey="week" fontSize={9}/><YAxis fontSize={9}/>
              <Tooltip/>
              <Line type="monotone" dataKey="avg" stroke="#ff6b00" strokeWidth={2} dot={{r:3}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {subjectData.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 h-52">
          <p className="text-sm font-semibold text-slate-200 mb-3">Subject Accuracy</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15}/>
              <XAxis dataKey="subject" fontSize={10}/><YAxis unit="%" fontSize={10} domain={[0,100]}/>
              <Tooltip formatter={(v:any)=>`${v}%`}/>
              <Bar dataKey="accuracy" fill="#6366f1" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {subjectData.length === 0 && data.totalTests === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Target size={32} className="mx-auto mb-2 opacity-40"/>
          <p className="text-sm">Take some tests to see your analytics.</p>
        </div>
      )}
    </div>
  );
}
