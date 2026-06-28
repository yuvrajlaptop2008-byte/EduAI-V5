import { motion } from "motion/react";

export default function StatCard({
  label, value, icon: Icon, gradient, delay = 0, onClick,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string; // tailwind gradient classes e.g. "from-orange-500 to-pink-600"
  delay?: number;
  onClick?: () => void;
}) {
  const Comp: any = onClick ? motion.button : motion.div;
  return (
    <Comp
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={`text-left p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 relative overflow-hidden group ${onClick ? "hover:border-brand cursor-pointer" : ""}`}
    >
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity blur-xl`} />
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shadow-black/5 relative z-10`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3 relative z-10">{value}</p>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 relative z-10">{label}</p>
    </Comp>
  );
}
