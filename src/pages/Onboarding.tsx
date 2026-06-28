import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Calculator,
  Dna,
  Target,
  Check,
  User,
  GraduationCap,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { toast } from "sonner";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, setOnboarded } = useUser();

  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.name || "Student");
  const [field, setField] = useState("Engineering");
  const [dailyGoal, setDailyGoal] = useState(50);
  const [targetYear, setTargetYear] = useState("2026");

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await updateUserProfile({
        name,
        field,
        dailyGoal,
        targetExam: field === "Medical" ? "NEET" : "JEE Main",
        dob: targetYear, // hijack dob or target year field if targetExam details
      });
      // Set onboarded status to true
      setOnboarded(true);
      toast.success(`Welcome to MARKS, ${name}!`);
      navigate("/app");
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete onboarding. Please try again.");
    }
  };

  // Onboarding slides configurations
  const renderWelcome = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 bg-brand/10 border border-brand/20 rounded-[2rem] flex items-center justify-center text-brand mx-auto shadow-lg shadow-brand/10 relative group">
        <div className="absolute inset-0 bg-brand/20 rounded-[2rem] blur-xl scale-125 opacity-50" />
        <Sparkles size={40} className="relative z-10 animate-pulse" />
      </div>
      <div className="space-y-3">
        <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
          Welcome to <span className="text-brand">MARKS</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-sm mx-auto leading-relaxed">
          Your premium, curriculum-aligned exam preparation and smart revision assistant.
        </p>
      </div>
      <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-900/5 dark:border-white/5 space-y-4 max-w-sm mx-auto text-left shadow-inner">
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm shrink-0">1</div>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Setup your target stream (JEE / NEET) and daily question practice goals.
          </p>
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm shrink-0">2</div>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Personalize your Snapchat-like 3D Avatar profile.
          </p>
        </div>
      </div>
    </motion.div>
  );

  const renderNameInput = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6 text-center"
    >
      <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 mx-auto">
        <User size={32} />
      </div>
      <div className="space-y-2">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Confirm Your Name</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">How should we address you in the leaderboard?</p>
      </div>
      <div className="max-w-xs mx-auto relative">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          maxLength={30}
          className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-slate-900 dark:text-white font-bold text-center outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all shadow-inner placeholder:text-slate-500"
          autoFocus
        />
      </div>
    </motion.div>
  );

  const renderStreamSelect = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6 text-center"
    >
      <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center text-violet-500 mx-auto">
        <GraduationCap size={32} />
      </div>
      <div className="space-y-2">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Select Target Stream</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">We'll tailor your formulas, tests, and DPPs accordingly.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        {[
          {
            id: "Engineering",
            label: "Engineering",
            sub: "JEE Main / Advanced",
            desc: "Physics, Chemistry, Mathematics",
            icon: <Calculator size={32} />,
            color: "border-blue-500/30 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/10 text-blue-500",
            activeColor: "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30 text-blue-500",
          },
          {
            id: "Medical",
            label: "Medical",
            sub: "NEET Exam",
            desc: "Physics, Chemistry, Biology",
            icon: <Dna size={32} />,
            color: "border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500",
            activeColor: "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 text-emerald-500",
          },
        ].map((stream) => {
          const isSelected = field === stream.id;
          return (
            <button
              key={stream.id}
              onClick={() => setField(stream.id)}
              className={`p-6 rounded-[2rem] border text-left flex flex-col justify-between h-56 transition-all duration-300 relative group active:scale-95 ${isSelected ? stream.activeColor : stream.color}`}
            >
              <div className="w-12 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                {stream.icon}
              </div>
              <div className="mt-4">
                <h4 className="font-black text-lg leading-none mb-1 text-slate-900 dark:text-white">{stream.label}</h4>
                <p className="text-xs font-bold opacity-80 mb-2">{stream.sub}</p>
                <p className="text-[10px] opacity-60 leading-tight">{stream.desc}</p>
              </div>
              {isSelected && (
                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-white ${stream.id === "Engineering" ? "bg-blue-500" : "bg-emerald-500"}`}>
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  const renderDailyGoal = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6 text-center"
    >
      <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500 mx-auto">
        <Target size={32} />
      </div>
      <div className="space-y-2">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Set Daily Goal</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Choose the number of MCQs you aim to solve daily.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        {[
          { value: 10, label: "Casual", pts: "10 MCQ/day" },
          { value: 30, label: "Focused", pts: "30 MCQ/day" },
          { value: 50, label: "Dedicated", pts: "50 MCQ/day" },
          { value: 100, label: "Intense", pts: "100 MCQ/day" },
        ].map((goal) => {
          const isSelected = dailyGoal === goal.value;
          return (
            <button
              key={goal.value}
              onClick={() => setDailyGoal(goal.value)}
              className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                isSelected
                  ? "border-brand bg-brand/10 ring-2 ring-brand/30 text-brand"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${isSelected ? "bg-brand/20 text-brand" : "bg-slate-200/50 dark:bg-slate-700/50 text-slate-500"}`}>
                  {goal.label}
                </span>
                <h4 className={`font-black text-2xl tracking-tighter mt-2 leading-none ${isSelected ? "text-brand" : "text-slate-900 dark:text-white"}`}>
                  {goal.pts}
                </h4>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  const renderTargetYear = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6 text-center"
    >
      <div className="w-16 h-16 bg-pink-500/10 border border-pink-500/20 rounded-2xl flex items-center justify-center text-pink-500 mx-auto">
        <GraduationCap size={32} />
      </div>
      <div className="space-y-2">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Class & Target Year</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Select your current academic profile status.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 max-w-xs mx-auto">
        {[
          { id: "2026", label: "Class 12 / Dropper", sub: "Target Exam 2026" },
          { id: "2027", label: "Class 11 Going to 12", sub: "Target Exam 2027" },
          { id: "2028", label: "Class 10 Going to 11", sub: "Target Exam 2028" },
        ].map((yr) => {
          const isSelected = targetYear === yr.id;
          return (
            <button
              key={yr.id}
              onClick={() => setTargetYear(yr.id)}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                isSelected
                  ? "border-pink-500 bg-pink-500/10 text-pink-500 ring-2 ring-pink-500/20"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <div>
                <h4 className={`font-bold ${isSelected ? "text-pink-500" : "text-slate-900 dark:text-white"}`}>{yr.label}</h4>
                <p className="text-xs opacity-60 mt-0.5">{yr.sub}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? "border-pink-500 bg-pink-500" : "border-slate-300 dark:border-slate-600"}`}>
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-between items-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header / Progress Indicator */}
      <header className="w-full max-w-md flex items-center justify-between pt-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold font-sans tracking-tight text-lg shadow-md">
            M
          </div>
          <span className="font-bold tracking-wider text-slate-900 dark:text-white text-sm">
            MARKS
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-brand" : i < step ? "w-2 bg-brand/45" : "w-2 bg-slate-200 dark:bg-slate-700"}`}
            />
          ))}
        </div>
      </header>

      {/* Main Slides Content */}
      <main className="w-full max-w-md flex-1 flex items-center justify-center py-8 relative z-10">
        <AnimatePresence mode="wait">
          {step === 0 && renderWelcome()}
          {step === 1 && renderNameInput()}
          {step === 2 && renderStreamSelect()}
          {step === 3 && renderDailyGoal()}
          {step === 4 && renderTargetYear()}
        </AnimatePresence>
      </main>

      {/* Bottom Actions Bar */}
      <footer className="w-full max-w-md flex gap-4 pb-4 relative z-10">
        {step > 0 && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center gap-2 py-4 px-6 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            <ArrowLeft size={20} /> Back
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 bg-brand text-slate-900 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {step === 4 ? "Complete Setup" : "Continue"}
          <ArrowRight size={20} />
        </button>
      </footer>
    </div>
  );
};

export default Onboarding;
