import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from "../context/UserContext";
import { normalizeRole } from "../utils/roles";
import { Megaphone, AlertTriangle } from "lucide-react";

/** Live-reads /platform/config and shows an announcement banner, or blocks
 * non-admins entirely when maintenanceMode is on. Mounted once near the app root. */
export default function PlatformBanner() {
  const { user } = useUser();
  const [config, setConfig] = useState<{ announcement?: string; maintenanceMode?: boolean } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "platform", "config"), (snap) => {
      setConfig(snap.exists() ? (snap.data() as any) : null);
    });
    return unsub;
  }, []);

  if (!config) return null;
  const isAdmin = user && normalizeRole(user.role) === "admin";

  if (config.maintenanceMode && !isAdmin) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur flex items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <AlertTriangle className="mx-auto text-amber-500 mb-4" size={36} />
          <p className="text-white font-bold text-lg">Down for maintenance</p>
          <p className="text-slate-400 text-sm mt-2">We'll be back shortly. Thanks for your patience.</p>
        </div>
      </div>
    );
  }

  if (!config.announcement || dismissed) return null;
  return (
    <div className="bg-brand text-white text-sm px-4 py-2 flex items-center justify-center gap-2 relative">
      <Megaphone size={14} className="shrink-0" />
      <span className="truncate">{config.announcement}</span>
      <button onClick={() => setDismissed(true)} className="absolute right-3 text-white/80 hover:text-white text-xs">✕</button>
    </div>
  );
}
