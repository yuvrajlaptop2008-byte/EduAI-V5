import { useEffect, useState } from "react";
import { listRemarksForStudent } from "../../services/remarksDB";
import { useParentChild } from "./useParentChild";
import type { RemarkDoc } from "../../types/schema";
import { MessageSquare } from "lucide-react";

export default function ParentRemarks() {
  const { child } = useParentChild();
  const [remarks, setRemarks] = useState<RemarkDoc[]>([]);

  useEffect(() => { if (child) listRemarksForStudent(child.uid, true).then(setRemarks); }, [child]);

  return (
    <div>
      <div className="flex items-center gap-2"><MessageSquare className="text-brand" size={20} /><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Remarks {child ? `· ${child.name}` : ""}</h1></div>
      <div className="space-y-2 mt-5">
        {remarks.map((r) => (
          <div key={r.id} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
            <p className="text-sm text-slate-800 dark:text-slate-100">{r.text}</p>
            <p className="text-xs text-slate-500 mt-1">{r.subject} · {r.teacherName} · {new Date(r.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
        {remarks.length === 0 && <p className="text-sm text-slate-500">No remarks yet.</p>}
      </div>
    </div>
  );
}
