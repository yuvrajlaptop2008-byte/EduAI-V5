import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "motion/react";
import { GitBranch, Plus, Trash2, Layers } from "lucide-react";
import { listBranches, createBranch, deleteBranch } from "../../services/branchDB";
import { listBatches, createBatch, deleteBatch } from "../../services/batchDB";
import { listExamGroups } from "../../services/examGroupsDB";
import { useUser } from "../../context/UserContext";
import type { Branch, Batch, ExamGroup } from "../../types/schema";
import { toast } from "sonner";

export default function Branches() {
  const { instituteId = "" } = useParams();
  const { user } = useUser();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [groups, setGroups] = useState<ExamGroup[]>([]);
  const [branchName, setBranchName] = useState("");
  const [batchName, setBatchName] = useState("");
  const [selBranch, setSelBranch] = useState("");
  const [selGroup, setSelGroup] = useState("");
  const [tab, setTab] = useState<"branches" | "batches">("branches");

  const load = () => {
    listBranches(instituteId).then(setBranches);
    listBatches(instituteId).then(setBatches);
    listExamGroups(instituteId).then(g => { setGroups(g); if (g[0]) setSelGroup(g[0].id); });
  };
  useEffect(load, [instituteId]);

  const addBranch = async () => {
    if (!branchName.trim()) return;
    await createBranch({ instituteId, name: branchName, adminUids: [], address: "" });
    toast.success("Branch created."); setBranchName(""); load();
  };
  const addBatch = async () => {
    if (!batchName.trim() || !selBranch || !selGroup) { toast.error("Fill all fields."); return; }
    await createBatch({ instituteId, branchId: selBranch, name: batchName, examGroupId: selGroup, teacherIds: [], studentIds: [], startDate: new Date().toISOString().slice(0, 10) });
    toast.success("Batch created."); setBatchName(""); load();
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <GitBranch className="text-brand" size={20} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Branches & Batches</h1>
      </div>
      <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-fit mb-5">
        {(["branches", "batches"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize ${tab === t ? "bg-white dark:bg-slate-800 text-brand shadow-sm" : "text-slate-500"}`}>{t}</button>
        ))}
      </div>

      {tab === "branches" && (
        <>
          <div className="flex gap-2 max-w-md mb-5">
            <input className="input flex-1" placeholder="Branch name (e.g. Kota Centre)" value={branchName} onChange={e => setBranchName(e.target.value)} onKeyDown={e => e.key === "Enter" && addBranch()} />
            <button onClick={addBranch} className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold flex items-center gap-1"><Plus size={15} /> Add</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {branches.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{b.name}</p>
                    {b.address && <p className="text-xs text-slate-500">{b.address}</p>}
                    <p className="text-xs text-slate-400 mt-1">{batches.filter(bt => bt.branchId === b.id).length} batches</p>
                  </div>
                  <button onClick={() => deleteBranch(b.id).then(load)} className="text-red-500 p-1.5 hover:bg-red-500/5 rounded-lg"><Trash2 size={15} /></button>
                </div>
              </motion.div>
            ))}
            {branches.length === 0 && <p className="text-sm text-slate-500">No branches yet.</p>}
          </div>
        </>
      )}

      {tab === "batches" && (
        <>
          <div className="flex flex-wrap gap-2 mb-5 items-end bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
            <div><label className="text-xs text-slate-500 block mb-1">Batch Name</label><input className="input" value={batchName} onChange={e => setBatchName(e.target.value)} placeholder="Morning JEE 2025" /></div>
            <div><label className="text-xs text-slate-500 block mb-1">Branch</label>
              <select className="input" value={selBranch} onChange={e => setSelBranch(e.target.value)}>
                <option value="">—</option>{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select></div>
            <div><label className="text-xs text-slate-500 block mb-1">Exam Group</label>
              <select className="input" value={selGroup} onChange={e => setSelGroup(e.target.value)}>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select></div>
            <button onClick={addBatch} className="px-4 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold flex items-center gap-1"><Plus size={15} /> Create</button>
          </div>
          <div className="space-y-2">
            {batches.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center"><Layers size={16} className="text-brand" /></div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{b.name}</p>
                    <p className="text-xs text-slate-500">{branches.find(br => br.id === b.branchId)?.name || "—"} · {b.studentIds.length} students</p>
                  </div>
                </div>
                <button onClick={() => deleteBatch(b.id).then(load)} className="text-red-500 p-1.5"><Trash2 size={15} /></button>
              </motion.div>
            ))}
            {batches.length === 0 && <p className="text-sm text-slate-500">No batches yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}
