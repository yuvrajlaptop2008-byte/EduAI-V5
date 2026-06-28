import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useUser } from "../context/UserContext";
import { unreadCount } from "../services/notificationsDB";
import { useNavigate } from "react-router-dom";
import { normalizeRole } from "../utils/roles";

export default function NotificationBell() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  useEffect(()=>{
    if (!user) return;
    unreadCount(user.uid).then(setCount);
    const t = setInterval(()=>unreadCount(user.uid).then(setCount), 30000);
    return ()=>clearInterval(t);
  },[user?.uid]);

  const role = user ? normalizeRole(user.role) : "student";
  const dest = role === "parent" ? "/parent/notifications" : "/app";

  return (
    <button onClick={()=>navigate(dest)} className="relative p-2 rounded-xl hover:bg-white/10 transition-colors">
      <Bell size={20} className="text-slate-400" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
