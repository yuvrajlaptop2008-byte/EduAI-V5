import React, { useEffect, useState } from"react";
import { motion, AnimatePresence } from"motion/react";
import { Link, useNavigate } from"react-router-dom";
import {
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Layout,
  FileText,
  Download,
  ChevronRight,
  Star,
  Trophy,
  CheckCircle2,
  Menu,
  X,
  Target,
  Activity,
  Shield,
  Globe,
} from"lucide-react";
import { useUser } from"../context/UserContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-900/5 dark:border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[72px] items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand/70 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand/20 border border-slate-900/10 dark:border-white/10">
              M
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-md">
              EduAI
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {["Exams","Features","Resources","FAQ"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-brand transition-colors uppercase tracking-widest"
                >
                  {item}
                </a>
              ),
            )}

            {user ? (
              <Link
                to="/app"
                className="bg-brand text-slate-900 px-7 py-2.5 rounded-full font-bold hover:bg-brand/90 transition-all shadow-[0_0_20px_rgba(var(--brand-rgb),0.4)] border border-brand/50"
              >
                Go to App
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-brand text-slate-900 px-7 py-2.5 rounded-full font-bold hover:bg-brand/90 transition-all shadow-[0_0_20px_rgba(var(--brand-rgb),0.4)] border border-brand/50"
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height:"auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-900/5 dark:border-white/5 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {["Exams","Features","Resources","FAQ"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setIsOpen(false)}
                    className="block text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold uppercase tracking-widest text-sm p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {item}
                  </a>
                ),
              )}
              <div className="pt-4 border-t border-slate-900/5 dark:border-white/5">
                <Link
                  to={user ?"/app" :"/login"}
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-brand text-slate-900 px-6 py-4 rounded-xl font-bold text-center shadow-lg shadow-brand/20 border border-brand/50"
                >
                  {user ?"Go to App" :"Sign In"}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const { user } = useUser();

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white dark:bg-slate-900">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/20 via-[#0F172A] to-[#0F172A]" />
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%2523noiseFilter)%22/%3E%3C/svg%3E')] opacity-20 pointer-events-none mix-blend-overlay" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease:"easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(var(--brand-rgb),0.3)]">
              <Star size={14} fill="currentColor" className="animate-pulse" />
              <span>Trusted by 5 Million+ Students</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
              Master Your Prep <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-orange-400 drop-shadow-lg">
                With EduAI
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-lg leading-relaxed font-medium">
              The ultimate preparation app for IIT JEE, NEET & CUET. Practice
              chapter-wise questions, take custom tests, and track your progress
              in real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={user ?"/app" :"/signup"}
                className="flex flex-1 sm:flex-none items-center justify-center gap-3 bg-brand text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-wide hover:bg-brand/90 transition-all shadow-[0_0_30px_rgba(var(--brand-rgb),0.4)] border border-brand/50 group"
              >
                <Download
                  size={20}
                  className="group-hover:-translate-y-1 transition-transform"
                />
                <span>Download App</span>
              </Link>
              <Link
                to={user ?"/app" :"/login"}
                className="flex flex-1 sm:flex-none items-center justify-center gap-3 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-wide hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-500 transition-all shadow-xl group"
              >
                <span>{user ?"Go to Dashboard" :"Try Web Version"}</span>
                <ChevronRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform text-slate-500 dark:text-slate-400"
                />
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://api.dicebear.com/9.x/adventurer/svg?seed=user${i}`}
                    alt="Uses"
                    className="w-12 h-12 rounded-full border-2 border-[#0F172A] shadow-md z-10 relative pointer-events-none"
                  />
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center text-orange-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-1">
                  4.8/5 from 100K+ reviews
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right side floating UI mockups */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center perspective-1000"
          >
            {/* Main Mockup */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 6, repeat: Infinity, ease:"easeInOut" }}
              className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[8px] border-slate-100 dark:border-slate-800 aspect-[9/18] w-full max-w-[280px] bg-slate-950 mx-auto transform rotate-y-[-10deg] rotate-z-[2deg] flex flex-col p-5 text-white"
            >
              {/* Fake Status Bar */}
              <div className="flex justify-between items-center text-[9px] text-slate-500 mb-5 font-bold">
                <span>9:41</span>
                <div className="flex gap-1">
                  <span className="w-2.5 h-1.5 bg-slate-500 rounded-sm"></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
                </div>
              </div>
              {/* App Brand */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs">M</div>
                <span className="font-extrabold text-xs tracking-wider">EduAI</span>
              </div>
              {/* Stats Card */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-3 mb-3">
                <span className="text-[8px] uppercase font-bold text-slate-400">Total Solved</span>
                <h3 className="text-xl font-black mt-0.5">12,450+</h3>
                <p className="text-[8px] text-emerald-400 font-bold mt-0.5">▲ 12% this week</p>
              </div>
              {/* Target Chart representation */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-3 flex-1 flex flex-col justify-between">
                <span className="text-[8px] uppercase font-bold text-slate-400">Accuracy Trend</span>
                <div className="h-16 flex items-end gap-1 mt-2">
                  {[30, 50, 40, 70, 45, 85, 65].map((h, i) => (
                    <div key={i} className="flex-1 bg-blue-600 rounded-t-[2px]" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Floating Card 1: Goal */}
            <motion.div
              animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease:"easeInOut",
                delay: 1,
              }}
              className="absolute top-[20%] -left-8 md:-left-16 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-xl p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-4 border border-slate-900/10 dark:border-white/10 z-20"
            >
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80 mb-0.5">
                  Daily Goal
                </p>
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  100% Completed
                </p>
              </div>
            </motion.div>

            {/* Floating Card 2: Rank */}
            <motion.div
              animate={{ y: [0, 15, 0], x: [0, -5, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease:"easeInOut",
                delay: 2,
              }}
              className="absolute bottom-[25%] -right-8 md:-right-12 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-xl p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-4 border border-slate-900/10 dark:border-white/10 z-20"
            >
              <div className="w-12 h-12 bg-brand/20 rounded-xl flex items-center justify-center text-brand border border-brand/30">
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand/80 mb-0.5">
                  Global Rank
                </p>
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  #12 in Physics
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const MetricCard = ({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-900/5 dark:border-white/5 rounded-3xl p-8 text-center relative overflow-hidden group hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-900/10 dark:hover:border-white/10 transition-all"
  >
    <div className="absolute inset-0 bg-gradient-to-t from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 drop-shadow-md">
      {value}
    </p>
    <p className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
      {label}
    </p>
  </motion.div>
);

const Stats = () => {
  return (
    <section className="py-12 bg-white dark:bg-slate-900 relative z-20 -mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <MetricCard value="5M+" label="Downloads" delay={0} />
          <MetricCard value="4.8" label="App Rating" delay={0.1} />
          <MetricCard value="100M+" label="Qs Solved" delay={0.2} />
          <MetricCard value="10k+" label="Selections" delay={0.3} />
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      icon: <BookOpen />,
      title:"Chapter-wise PYQs",
      desc:"Decade-long previous year questions sorted meticulously by chapter and topic.",
      color:"text-blue-400",
      bg:"bg-blue-400/10",
      border:"border-blue-400/20",
    },
    {
      icon: <Layout />,
      title:"Bespoke Custom Tests",
      desc:"Forge your own gauntlet. Select chapters, set difficulty, and race the clock.",
      color:"text-purple-400",
      bg:"bg-purple-400/10",
      border:"border-purple-400/20",
    },
    {
      icon: <Activity />,
      title:"Surgical Analytics",
      desc:"X-ray your performance. Discover latent weaknesses and double down on strengths.",
      color:"text-emerald-400",
      bg:"bg-emerald-400/10",
      border:"border-emerald-400/20",
    },
    {
      icon: <Trophy />,
      title:"Global Leaderboards",
      desc:"Clash against peers nationally. The forge that tempers raw talent into rankers.",
      color:"text-amber-400",
      bg:"bg-amber-400/10",
      border:"border-amber-400/20",
    },
    {
      icon: <Shield />,
      title:"Automated Error Log",
      desc:"Never repeat a mistake. Your errors are captured, categorized, and served for review.",
      color:"text-rose-400",
      bg:"bg-rose-400/10",
      border:"border-rose-400/20",
    },
    {
      icon: <Target />,
      title:"Daily Heatmaps",
      desc:"Build an unbreakable streak. Small daily conquests leading to ultimate victory.",
      color:"text-brand",
      bg:"bg-brand/10",
      border:"border-brand/20",
    },
  ];

  return (
    <section
      id="features"
      className="py-24 bg-white dark:bg-slate-900 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-xs font-black uppercase tracking-widest text-brand mb-4">
            The Arsenal
          </h2>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
            Weapons of Mass Preparation
          </h3>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">
            Tools forged specifically to dismantle complexity and accelerate
            mastery.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-slate-50/30 dark:bg-slate-800/30 backdrop-blur p-8 rounded-[2rem] border border-slate-900/5 dark:border-white/5 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 hover:border-slate-900/10 dark:hover:border-white/10 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 dark:bg-slate-900/5 rounded-full blur-3xl group-hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" />
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feat.bg} ${feat.border} border shadow-inner transition-transform group-hover:scale-110`}
              >
                {React.cloneElement(feat.icon as React.ReactElement, {
                  className: feat.color,
                  size: 28,
                })}
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {feat.title}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ExamCoverage = () => {
  const exams = [
    {
      name:"JEE Main",
      tag:"Engineering",
      color:"from-blue-500/20 to-blue-900/40",
      border:"border-blue-500/30",
      text:"text-blue-400",
    },
    {
      name:"JEE Adv.",
      tag:"Engineering",
      color:"from-indigo-500/20 to-indigo-900/40",
      border:"border-indigo-500/30",
      text:"text-indigo-400",
    },
    {
      name:"NEET",
      tag:"Medical",
      color:"from-emerald-500/20 to-emerald-900/40",
      border:"border-emerald-500/30",
      text:"text-emerald-400",
    },
    {
      name:"BITSAT",
      tag:"Engineering",
      color:"from-amber-500/20 to-amber-900/40",
      border:"border-amber-500/30",
      text:"text-amber-400",
    },
    {
      name:"CUET",
      tag:"University",
      color:"from-purple-500/20 to-purple-900/40",
      border:"border-purple-500/30",
      text:"text-purple-400",
    },
    {
      name:"NDA",
      tag:"Defence",
      color:"from-rose-500/20 to-rose-900/40",
      border:"border-rose-500/30",
      text:"text-rose-400",
    },
  ];

  return (
    <section
      id="exams"
      className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%2523noiseFilter)%22/%3E%3C/svg%3E')] opacity-10 mix-blend-overlay pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-xs font-black uppercase tracking-widest text-brand mb-4">
              Battlegrounds
            </h2>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
              Choose Your Arena
            </h3>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">
              Surgical preparation environments individually calibrated for
              India's fiercest examinations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {exams.map((exam, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className={`bg-gradient-to-b ${exam.color} rounded-[2rem] p-6 text-center border ${exam.border} backdrop-blur shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] cursor-pointer group`}
            >
              <div className="mb-4 flex justify-center">
                <Target
                  size={28}
                  className={`${exam.text} opacity-50 group-hover:opacity-100 transition-opacity`}
                />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                {exam.name}
              </h4>
              <p
                className={`text-[10px] font-bold uppercase tracking-widest ${exam.text} mb-0`}
              >
                {exam.tag}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  const features = [
    "Full PYQ database (JEE Main, Advanced, NEET)",
    "Unlimited practice and custom tests",
    "NTA-style test engine with timer",
    "Subject and chapter analytics",
    "AI-powered doubt explanation",
    "Teacher test assignments and remarks",
    "Attendance tracking",
    "Parent progress dashboard",
    "Notebook and formula library",
    "Admin institute management",
  ];
  return (
    <section id="pricing" className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xs font-black uppercase tracking-widest text-brand mb-4">Pricing</h2>
        <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4">100% Free. No Catch.</h3>
        <p className="text-xl text-slate-500 dark:text-slate-400 font-medium mb-12">
          Every feature, every student, every teacher — free forever. We believe access to great education shouldn't depend on your budget.
        </p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-b from-brand/10 to-slate-50 dark:to-slate-800/60 rounded-[2.5rem] p-10 border border-brand/20 shadow-xl shadow-brand/5 text-left"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-4xl font-black text-slate-900 dark:text-white">₹0</p>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Forever free</p>
            </div>
            <div className="bg-brand text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full">Everything Included</div>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium text-sm">
                <CheckCircle2 size={16} className="text-brand shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            to="/signup"
            className="block w-full text-center py-4 rounded-2xl bg-brand text-white font-black uppercase text-sm tracking-widest hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
          >
            Get Started Free →
          </Link>
        </motion.div>
      </div>
    </section>
  );
};


const CTA = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-brand/20 via-slate-100 dark:via-slate-800 to-indigo-100/20 dark:to-indigo-900/20 rounded-[3rem] p-12 md:p-20 border border-slate-900/10 dark:border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%2523noiseFilter)%22/%3E%3C/svg%3E')] opacity-10 mix-blend-overlay pointer-events-none" />
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight relative z-10">
            Your Rank Starts Here.
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto font-medium relative z-10">
            Join thousands of students, teachers, and institutes already using EduAI — the complete JEE & NEET platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link
              to="/signup"
              className="bg-brand text-slate-900 px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-wide hover:bg-brand/90 transition-all shadow-[0_0_30px_rgba(var(--brand-rgb),0.5)] border border-brand/50"
            >
              Start for Free →
            </Link>
          </div>
          <div className="mt-8 flex justify-center gap-8 relative z-10 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-brand" /> No Credit Card
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-brand" /> Completely Free
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-white dark:bg-slate-900 border-t border-slate-900/5 dark:border-white/5 pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
        <div className="col-span-2 lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white font-black text-2xl">
              E
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              EduAI
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mb-8 leading-relaxed">
            The architect of top ranks. We build the tools that forge raw
            potential into unparalleled academic dominance.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-brand hover:text-slate-900 transition-all border border-slate-900/5 dark:border-white/5"
            >
              <Globe size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-brand hover:text-slate-900 transition-all border border-slate-900/5 dark:border-white/5"
            >
              <Star size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-wide">
            Armory
          </h4>
          <ul className="space-y-4">
            {["JEE Main","JEE Advanced","NEET Basecamp","BITSAT"].map(
              (link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-slate-500 dark:text-slate-400 hover:text-brand transition-colors font-medium"
                  >
                    {link}
                  </a>
                </li>
              ),
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-wide">
            Intel
          </h4>
          <ul className="space-y-4">
            {["Strategy Blog","Formula Vault","Previous Rankers","Study Manifestos",
            ].map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-slate-500 dark:text-slate-400 hover:text-brand transition-colors font-medium"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-wide">
            Base
          </h4>
          <ul className="space-y-4">
            {["About HQ","Contact Comms","Privacy Protocol","Terms of Siege",
            ].map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-slate-500 dark:text-slate-400 hover:text-brand transition-colors font-medium"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-900/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
          © {new Date().getFullYear()} EduAI. All systems operational.
        </p>
        <div className="flex gap-6 text-sm font-bold text-slate-500 dark:text-slate-400">
          <a
            href="#"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Privacy
          </a>
          <a
            href="#"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Terms
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();

  useEffect(() => {
    if (user && !loading) {
      navigate("/app");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 selection:bg-brand/30 selection:text-slate-900">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <ExamCoverage />
      <CTA />
      <Footer />
    </div>
  );
};
