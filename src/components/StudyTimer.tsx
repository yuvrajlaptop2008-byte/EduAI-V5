import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Clock, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useUser } from "../context/UserContext";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function StudyTimer() {
  const { user } = useUser();
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const incrementRef = useRef<NodeJS.Timeout | null>(null);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
    if (incrementRef.current) {
      clearInterval(incrementRef.current);
    }
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = async () => {
    if (incrementRef.current) {
      clearInterval(incrementRef.current);
    }
    const sessionSeconds = seconds;
    setSeconds(0);
    setIsActive(false);
    setIsPaused(false);

    if (sessionSeconds > 5 && user && user.uid !== "demo") {
      try {
        const sessionRef = collection(db, `users/${user.uid}/study_sessions`);
        await addDoc(sessionRef, {
          duration: sessionSeconds,
          date: new Date().toISOString(),
          createdAt: Date.now()
        });
        alert(`Great job studying for ${Math.round(sessionSeconds / 60)} minutes! Session saved.`);
      } catch (err) {
        console.error("Failed to save study session:", err);
      }
    }
  };

  useEffect(() => {
    if (isActive && !isPaused) {
      incrementRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (incrementRef.current) {
        clearInterval(incrementRef.current);
      }
    };
  }, [isActive, isPaused]);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-slate-800/80 dark:to-slate-900/80 p-6 rounded-[2rem] border border-indigo-500/20 dark:border-white/5 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[1rem] bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Study Timer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track your focus sessions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {formatTime(seconds)}
          </span>

          <div className="flex items-center gap-2">
            {!isActive ? (
              <button
                onClick={handleStart}
                className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
                title="Start session"
              >
                <Play size={18} className="ml-0.5" />
              </button>
            ) : isPaused ? (
              <>
                <button
                  onClick={handleResume}
                  className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
                  title="Resume"
                >
                  <Play size={18} className="ml-0.5" />
                </button>
                <button
                  onClick={handleStop}
                  className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/20"
                  title="Stop and Save"
                >
                  <Square size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handlePause}
                  className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/20"
                  title="Pause"
                >
                  <Pause size={18} />
                </button>
                <button
                  onClick={handleStop}
                  className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/20"
                  title="Stop and Save"
                >
                  <Square size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
