import { motion } from "motion/react";

function pulse(className: string) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={`bg-slate-200 dark:bg-white/10 rounded-lg ${className}`}
    />
  );
}

export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-4 mt-5`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
          {pulse("w-10 h-10 rounded-xl mb-3")}
          {pulse("w-16 h-7 mb-1")}
          {pulse("w-24 h-3")}
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
      <div className="bg-slate-50 dark:bg-white/5 p-3 grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => pulse("h-3 w-16"))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="border-t border-slate-100 dark:border-white/5 p-3 grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, c) => pulse(`h-3 ${c === 0 ? "w-28" : "w-16"}`))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
          {pulse("w-11 h-11 rounded-xl mb-4")}
          {pulse("w-32 h-4 mb-2")}
          {pulse("w-full h-3")}
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 mt-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            {pulse("w-9 h-9 rounded-full")}
            <div className="space-y-2">
              {pulse("w-32 h-3")}
              {pulse("w-24 h-2.5")}
            </div>
          </div>
          {pulse("w-16 h-7 rounded-full")}
        </div>
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-white/10 rounded-lg w-48 mb-2" />
      <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-72 mb-6" />
      <SkeletonStatCards />
      <SkeletonList />
    </div>
  );
}
