import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "motion/react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { getInstitute, updateInstitute } from "../../services/institutesDB";
import { listExamGroups, createExamGroup, deleteExamGroup, DEFAULT_GROUPS } from "../../services/examGroupsDB";
import { createInvite, listInvites, deleteInvite, type Invite } from "../../services/invitesDB";
import { logAudit } from "../../services/auditLogDB";
import { useUser } from "../../context/UserContext";
import type { Institute, ExamGroup, GroupTestAttempt } from "../../types/schema";
import { toast } from "sonner";
import { Trash2, Palette, Users as UsersIcon, Layers, BarChart3, Trophy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

type Tab = "branding" | "members" | "groups" | "analytics";
const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "branding", label: "Branding", icon: Palette },
  { key: "members", label: "Members", icon: UsersIcon },
  { key: "groups", label: "Exam Groups", icon: Layers },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];
const PIE_COLORS = ["#ff6b00", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

interface MemberLite { uid: string; name: string; email: string; role: string; examGroupId?: string | null; }

export default function InstituteDetail() {
  const { instituteId = "" } = useParams();
  const { user } = useUser();
  const [tab, setTab] = useState<Tab>("branding");
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [groups, setGroups] = useState<ExamGroup[]>([]);
  const [members, setMembers] = useState<MemberLite[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [attempts, setAttempts] = useState<GroupTestAttempt[]>([]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Invite["role"]>("student");
  const [inviteGroup, setInviteGroup] = useState("");

  const load = async () => {
    setInstitute(await getInstitute(instituteId));
    const gs = await listExamGroups(instituteId);
    setGroups(gs);
    setInvites(await listInvites(instituteId));
    const snap = await getDocs(query(collection(db, "users"), where("instituteId", "==", instituteId)));
    setMembers(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) })));
    const attemptsSnap = await getDocs(query(collection(db, "groupTestAttempts"), where("instituteId", "==", instituteId)));
    setAttempts(attemptsSnap.docs.map((d) => d.data() as GroupTestAttempt));
  };
  useEffect(() => { load(); }, [instituteId]);

  const saveBranding = async (patch: Partial<Institute>) => {
    await updateInstitute(instituteId, patch);
    toast.success("Saved.");
    load();
  };

  const seedDefaultGroups = async () => {
    for (const g of DEFAULT_GROUPS) await createExamGroup({ instituteId, name: g.name, type: g.type });
    logAudit(user!.uid, user!.name, "examGroups.seed", `Created default exam groups for "${institute?.name}"`);
    toast.success("Default exam groups created.");
    load();
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    await createInvite({
      email: inviteEmail.toLowerCase(), role: inviteRole, instituteId,
      examGroupId: inviteRole === "student" ? inviteGroup || null : null,
      linkedStudentIds: [],
    });
    logAudit(user!.uid, user!.name, "invite.create", `Invited ${inviteEmail} as ${inviteRole} to "${institute?.name}"`);
    toast.success(`Invite created for ${inviteEmail}.`);
    setInviteEmail(""); load();
  };

  if (!institute) return <p className="text-slate-500">Loading…</p>;

  const groupSizeData = groups.map((g) => ({ name: g.name, students: g.studentIds.length }));
  const topPerformers = [...attempts].sort((a, b) => b.score - a.score).slice(0, 8);
  const avgScoreByGroup = groups.map((g) => {
    const gAttempts = attempts.filter((a) => a.examGroupId === g.id);
    const avg = gAttempts.length ? Math.round(gAttempts.reduce((s, a) => s + a.score, 0) / gAttempts.length) : 0;
    return { name: g.name, avg };
  });

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0" style={{ background: institute.primaryColor }}>
          {institute.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{institute.name}</h1>
      </div>

      <div className="flex gap-1 mt-5 border-b border-slate-200 dark:border-white/10 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${tab === t.key ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "branding" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md space-y-3 mt-5">
          <label className="text-xs text-slate-500">Tagline</label>
          <input className="input w-full" defaultValue={institute.tagline} onBlur={(e) => saveBranding({ tagline: e.target.value })} />
          <label className="text-xs text-slate-500 block">Primary Color</label>
          <input type="color" defaultValue={institute.primaryColor} onChange={(e) => saveBranding({ primaryColor: e.target.value })} className="w-16 h-9 rounded cursor-pointer" />
          <label className="text-xs text-slate-500 block">Logo URL</label>
          <input className="input w-full" defaultValue={institute.logoURL} onBlur={(e) => saveBranding({ logoURL: e.target.value })} />
        </motion.div>
      )}

      {tab === "groups" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
          {groups.length === 0 && (
            <button onClick={seedDefaultGroups} className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold shadow-md shadow-brand/20">
              Create default groups (JEE Main / JEE Advanced / NEET / School)
            </button>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {groups.map((g) => (
              <div key={g.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{g.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{g.studentIds.length} students</p>
                </div>
                <button onClick={() => { deleteExamGroup(g.id).then(load); logAudit(user!.uid, user!.name, "examGroup.delete", `Deleted exam group "${g.name}"`); }} className="text-red-500 p-1.5 hover:bg-red-500/5 rounded-lg"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {tab === "members" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
          <div className="flex flex-wrap gap-2 items-end bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Email</label>
              <input className="input" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="person@email.com" />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Role</label>
              <select className="input" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as Invite["role"])}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {inviteRole === "student" && (
              <div>
                <label className="text-xs text-slate-500 block mb-1">Exam Group</label>
                <select className="input" value={inviteGroup} onChange={(e) => setInviteGroup(e.target.value)}>
                  <option value="">—</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            )}
            <button onClick={sendInvite} className="px-4 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold shadow-md shadow-brand/20">Invite</button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Invited people get the role automatically the moment they sign up with that email.
          </p>

          {invites.length > 0 && (
            <>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-5 mb-2">Pending invites</p>
              <div className="space-y-2">
                {invites.map((i) => (
                  <div key={i.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm">
                    <span>{i.email} · <span className="text-brand capitalize font-medium">{i.role}</span></span>
                    <button onClick={() => { deleteInvite(i.id).then(load); logAudit(user!.uid, user!.name, "invite.delete", `Cancelled invite for ${i.email}`); }} className="text-red-500"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-5 mb-2">Members ({members.length})</p>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.uid} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold">{m.name?.charAt(0).toUpperCase()}</div>
                  <span>{m.name} <span className="text-slate-400">· {m.email}</span></span>
                </div>
                <span className="text-brand capitalize font-medium">{m.role === "user" ? "student" : m.role}</span>
              </div>
            ))}
            {members.length === 0 && <p className="text-sm text-slate-500">No members yet.</p>}
          </div>
        </motion.div>
      )}

      {tab === "analytics" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Students per Exam Group</p>
              <div className="h-56">
                {groupSizeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={groupSizeData} dataKey="students" nameKey="name" outerRadius={75} label>
                        {groupSizeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-slate-500">No exam groups yet.</p>}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Average Score by Group</p>
              <div className="h-56">
                {avgScoreByGroup.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={avgScoreByGroup}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="avg" fill="#ff6b00" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-slate-500">No attempts yet.</p>}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-1.5"><Trophy size={15} className="text-amber-500" /> Top Performers (institute-wide)</p>
            <div className="space-y-2">
              {topPerformers.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-slate-50 dark:bg-white/5">
                  <span className="text-slate-700 dark:text-slate-200">#{i + 1} {a.studentName}</span>
                  <span className="font-semibold text-brand">{a.score}/{a.totalMarks}</span>
                </div>
              ))}
              {topPerformers.length === 0 && <p className="text-sm text-slate-500">No test attempts yet.</p>}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
