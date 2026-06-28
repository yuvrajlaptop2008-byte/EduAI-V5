import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Bell, CheckCheck } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { listNotifications, markAllRead } from "../../services/notificationsDB";
import type { Notification } from "../../types/schema";

const TYPE_ICON: Record<Notification["type"], string> = {
  low_score: "📉", missed_test: "⚠️", attendance: "📅",
  remark: "💬", announcement: "📣", homework: "📚",
};

export default function ParentNotifications() {
  const { user } = useUser();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const load = () => { if (user) listNotifications(user.uid).then(setNotifs); };
  useEffect(load, [user?.uid]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Bell className="text-brand" size={20} />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
        </div>
        {notifs.some(n => !n.read) && (
          <button onClick={() => user && markAllRead(user.uid).then(load)}
            className="flex items-center gap-1.5 text-sm text-brand hover:underline">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>
      <div className="space-y-2">
        {notifs.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className={`p-4 rounded-xl border ${n.read ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10" : "bg-brand/5 border-brand/20"}`}>
            <div className="flex items-start gap-3">
              <span className="text-xl">{TYPE_ICON[n.type]}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm text-slate-900 dark:text-white">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">{new Date(n.createdAt).toLocaleDateString()}</span>
            </div>
          </motion.div>
        ))}
        {notifs.length === 0 && <p className="text-sm text-slate-500 text-center py-12">No notifications yet.</p>}
      </div>
    </div>
  );
}
