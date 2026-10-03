import React from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface ExamTimerProps {
  secondsRemaining: number;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({ secondsRemaining }) => {
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  const isUrgent = secondsRemaining < 300; // < 5 minutes remaining

  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
        isUrgent
          ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
          : "bg-slate-800/80 text-slate-200 border-slate-700/60"
      }`}
    >
      {isUrgent ? <AlertTriangle size={16} className="text-rose-400" /> : <Clock size={16} className="text-slate-400" />}
      <span>{formattedTime}</span>
    </div>
  );
};
