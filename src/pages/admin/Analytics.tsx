import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { dataService } from "../../services/dataService";
import { listInstitutes } from "../../services/institutesDB";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import StatCard from "../../components/layout/StatCard";
import { TrendingUp, Users, FileQuestion, ClipboardList, BarChart3 } from "lucide-react";

const COLORS = ["#ff6b00","#6366f1","#10b981","#f59e0b","#ef4444","#06b6d4"];

export default function Analytics() {
  const [stats, setStats] = useState({ users: 0, questions: 0, tests: 0, attempts: 0, institutes: 0 });
  const [attemptsByDay, setAttemptsByDay] = useState<{day:string;count:number}[]>([]);
  const [roleBreakdown, setRoleBreakdown] = useState<{name:string;value:number}[]>([]);
  const [topStudents, setTopStudents] = useState<{name:string;score:number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [users, qCount, tests, attempts, institutes] = await Promise.all([
        getDocs(collection(db,"users")),
        dataService.getQuestionCount(),
        getDocs(collection(db,"groupTests")),
        getDocs(collection(db,"groupTestAttempts")),
        listInstitutes(),
      ]);

      // Role breakdown
      const roles: Record<string,number> = {};
      users.forEach(d => { const r = (d.data() as any).role || "user"; roles[r] = (roles[r]||0)+1; });
      setRoleBreakdown(Object.entries(roles).map(([name,value])=>({name: name==="user"?"student":name, value})));

      // Attempts by day (last 14 days)
      const dayMap: Record<string,number> = {};
      attempts.forEach(d => {
        const dt = new Date((d.data() as any).submittedAt || Date.now()).toISOString().slice(5,10);
        dayMap[dt] = (dayMap[dt]||0)+1;
      });
      setAttemptsByDay(Object.entries(dayMap).sort().slice(-14).map(([day,count])=>({day,count})));

      // Top students by score
      const sorted = attempts.docs.sort((a,b)=>((b.data() as any).score||0)-((a.data() as any).score||0)).slice(0,8);
      setTopStudents(sorted.map(d=>({ name: (d.data() as any).studentName||"Student", score: (d.data() as any).score||0 })));

      setStats({ users: users.size, questions: qCount, tests: tests.size, attempts: attempts.size, institutes: institutes.length });
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-5"><BarChart3 className="text-brand" size={20}/><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Analytics</h1></div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Users" value={stats.users} icon={Users} gradient="from-sky-500 to-blue-600"/>
        <StatCard label="Questions" value={stats.questions} icon={FileQuestion} gradient="from-orange-500 to-pink-600" delay={0.05}/>
        <StatCard label="Tests" value={stats.tests} icon={ClipboardList} gradient="from-violet-500 to-indigo-600" delay={0.1}/>
        <StatCard label="Attempts" value={stats.attempts} icon={TrendingUp} gradient="from-emerald-500 to-teal-600" delay={0.15}/>
        <StatCard label="Institutes" value={stats.institutes} icon={Users} gradient="from-rose-500 to-red-600" delay={0.2}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Test Attempts (last 14 days)</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attemptsByDay}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15}/>
                <XAxis dataKey="day" fontSize={10}/><YAxis fontSize={10}/>
                <Tooltip/>
                <Bar dataKey="count" fill="#ff6b00" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">User Breakdown</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleBreakdown} dataKey="value" nameKey="name" outerRadius={80} label={({name,percent})=>`${name} ${percent != null ? (percent*100).toFixed(0) : 0}%`} labelLine={false} fontSize={10}>
                  {roleBreakdown.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">🏆 Top Performers (All Time)</p>
        <div className="space-y-2">
          {topStudents.map((s,i)=>(
            <motion.div key={i} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.03}}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-white/5">
              <span className="text-sm text-slate-700 dark:text-slate-200">#{i+1} {s.name}</span>
              <span className="font-bold text-brand text-sm">{s.score} pts</span>
            </motion.div>
          ))}
          {topStudents.length===0 && <p className="text-sm text-slate-500">No attempts yet.</p>}
        </div>
      </div>
    </div>
  );
}
