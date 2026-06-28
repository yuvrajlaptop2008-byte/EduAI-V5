import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useUser } from "../../context/UserContext";
import { listInstitutes, createInstitute } from "../../services/institutesDB";
import { logAudit } from "../../services/auditLogDB";
import type { Institute } from "../../types/schema";
import { toast } from "sonner";
import { Plus, ChevronRight, Building2 } from "lucide-react";

export default function Institutes() {
  const { user } = useUser();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const load = () => { listInstitutes().then(setInstitutes); };
  useEffect(load, []);

  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await createInstitute({
        name, logoURL: "", primaryColor: "#ff6b00", tagline: "", createdBy: user!.uid,
      });
      toast.success("Institute created.");
      logAudit(user!.uid, user!.name, "institute.create", `Created institute "${name}"`);
      setName(""); load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to create institute.");
    } finally { setCreating(false); }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <Building2 className="text-brand" size={20} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Institutes</h1>
      </div>

      <div className="flex gap-2 mt-4 max-w-md">
        <input className="input flex-1" placeholder="New institute name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} />
        <button onClick={create} disabled={creating} className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold shadow-md shadow-brand/20 flex items-center gap-1 disabled:opacity-50">
          <Plus size={16} /> Create
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {institutes.map((i, idx) => (
          <motion.div key={i.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <Link
              to={`/admin/institutes/${i.id}`}
              className="block p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-brand hover:shadow-lg hover:shadow-brand/5 transition-all relative overflow-hidden group"
            >
              <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity" style={{ background: i.primaryColor }} />
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg" style={{ background: i.primaryColor }}>
                {i.name.charAt(0).toUpperCase()}
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mt-3 flex items-center justify-between">
                {i.name}
                <ChevronRight size={16} className="text-slate-300 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
              </p>
              {i.tagline && <p className="text-xs text-slate-500 mt-1">{i.tagline}</p>}
            </Link>
          </motion.div>
        ))}
        {institutes.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <Building2 size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No institutes yet — create the first one above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
