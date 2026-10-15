import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";
import { LockKeyhole } from "lucide-react";
import { PriorityBadge, card, btn, input } from "@/components/site";
import { DEPARTMENTS, STATUSES, load, update, type Grievance, type Priority } from "@/lib/grievance";

export type Role = "citizen" | "officer" | "district" | "admin";
const ROLE_INFO: Record<Role, { title: string; path: string; demo: string }> = {
  citizen: { title: "Citizen Login", path: "/citizen", demo: "citizen@demo.in" },
  officer: { title: "Department Officer Login", path: "/officer", demo: "officer.water@demo.in" },
  district: { title: "District Administrator Login", path: "/district-admin", demo: "collector.konaseema@demo.in" },
  admin: { title: "Super Administrator Login", path: "/admin", demo: "superadmin@demo.in" },
};

export function LoginCard({ role }: { role: Role }) {
  const info = ROLE_INFO[role]; const nav = useNavigate();
  const [email, setEmail] = useState(info.demo); const [pw, setPw] = useState("demo1234");
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <form className={card} onSubmit={(e) => { e.preventDefault(); localStorage.setItem("sgai.role", role); nav({ to: info.path as "/" }); }}>
        <LockKeyhole className="h-10 w-10 text-primary" />
        <h1 className="mt-4 font-display text-2xl font-bold">{info.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{role === "citizen" ? "New citizens can register with any email." : "Accounts are created only by the Super Administrator."}</p>
        <div className="mt-6 grid gap-3">
          <input className={input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input className={input} type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" />
          <button className={btn}>Sign in</button>
        </div>
        <p className="mt-4 rounded-lg bg-accent p-3 text-xs text-accent-foreground">Demo mode: credentials are prefilled. Real secure accounts come in the next step.</p>
      </form>
    </div>
  );
}

export function useGrievances() {
  const [list, setList] = useState<Grievance[]>([]);
  useEffect(() => setList(load()), []);
  return [list, setList] as const;
}

const PCOL: Record<Priority, string> = { Critical: "var(--critical)", High: "var(--high)", Medium: "var(--medium)", Low: "var(--low)" };

export function Stats({ list }: { list: Grievance[] }) {
  const s = [
    ["Total", list.length], ["Pending review", list.filter((g) => g.status === "Pending Officer Review").length],
    ["Critical", list.filter((g) => g.priority === "Critical").length], ["In progress", list.filter((g) => g.status === "In Progress").length],
    ["Escalated", list.filter((g) => g.status === "Escalated").length], ["Resolved", list.filter((g) => g.status === "Resolved").length],
  ];
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-6">{s.map(([l, v]) => <div key={l} className={card}><p className="text-xs text-muted-foreground">{l}</p><p className="font-display text-3xl font-bold text-primary">{v}</p></div>)}</div>;
}

export function Charts({ list, by }: { list: Grievance[]; by: "department" | "mandal" | "district" }) {
  const groups = useMemo(() => Object.entries(list.reduce<Record<string, number>>((a, g) => ({ ...a, [g[by]]: (a[g[by]] ?? 0) + 1 }), {})).map(([name, value]) => ({ name, value })), [list, by]);
  const pr = (["Critical", "High", "Medium", "Low"] as Priority[]).map((p) => ({ name: p, value: list.filter((g) => g.priority === p).length }));
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className={`${card} lg:col-span-2`}><h3 className="mb-4 font-semibold">Complaints by {by}</h3>
        <ResponsiveContainer width="100%" height={260}><BarChart data={groups}><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
      <div className={card}><h3 className="mb-4 font-semibold">By priority</h3>
        <ResponsiveContainer width="100%" height={260}><PieChart><Pie data={pr} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>{pr.map((p) => <Cell key={p.name} fill={PCOL[p.name as Priority]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
    </div>
  );
}

export function ComplaintTable({ list, setList, actor, editable }: { list: Grievance[]; setList: (l: Grievance[]) => void; actor: string; editable?: boolean }) {
  const [q, setQ] = useState(""); const [pf, setPf] = useState(""); const [open, setOpen] = useState<string | null>(null);
  const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const rows = list.filter((g) => (!pf || g.priority === pf) && (g.title + g.id + g.village).toLowerCase().includes(q.toLowerCase())).sort((a, b) => order[a.priority] - order[b.priority]);
  return (
    <div className={card}>
      <div className="mb-4 flex flex-wrap gap-3">
        <input className={`${input} max-w-xs`} placeholder="Search ID, title, village" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={`${input} w-40`} value={pf} onChange={(e) => setPf(e.target.value)}><option value="">All priorities</option>{Object.keys(order).map((p) => <option key={p}>{p}</option>)}</select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground"><tr>{["ID", "Title", "Village", "Priority", "Department", "Status", "Date", ""].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((g) => (<>
              <tr key={g.id} className="border-t">
                <td className="p-2 font-mono text-xs">{g.id}</td><td className="p-2 font-medium">{g.title}{g.duplicates.length > 0 && <span className="ml-2 rounded bg-accent px-1.5 text-xs text-accent-foreground">possible duplicate</span>}</td>
                <td className="p-2">{g.village}</td><td className="p-2"><PriorityBadge p={g.priority} /></td><td className="p-2">{g.department}</td><td className="p-2">{g.status}</td>
                <td className="p-2 text-xs">{new Date(g.createdAt).toLocaleDateString()}</td>
                <td className="p-2"><button className="text-primary underline" onClick={() => setOpen(open === g.id ? null : g.id)}>{open === g.id ? "Close" : "View"}</button></td>
              </tr>
              {open === g.id && <tr key={g.id + "d"}><td colSpan={8} className="bg-muted/50 p-4"><Detail g={g} actor={actor} editable={editable} onChange={setList} /></td></tr>}
            </>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Detail({ g, actor, editable, onChange }: { g: Grievance; actor: string; editable?: boolean | undefined; onChange: (l: Grievance[]) => void }) {
  const [dept, setDept] = useState(g.department); const [prio, setPrio] = useState(g.priority); const [status, setStatus] = useState(g.status); const [note, setNote] = useState("");
  const a = g.analysis;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-1 text-sm">
        <p><b>Description:</b> {g.description}</p>
        <p><b>Location:</b> {g.village}, {g.mandal}, {g.district}</p>
        <p className="pt-2 font-semibold text-secondary">AI recommendation</p>
        <p>{a.primary} · {a.priority} · {Math.round(a.confidence * 100)}% confidence · {a.language}</p>
        <p className="text-muted-foreground">{a.reason} {a.priorityReason}</p>
        {a.secondary.length > 0 && <p>Collaborating: {a.secondary.join(", ")}</p>}
        {g.duplicates.length > 0 && <p className="text-high">Similar to: {g.duplicates.join(", ")}</p>}
      </div>
      {editable && (
        <div className="grid gap-2">
          <select className={input} value={dept} onChange={(e) => setDept(e.target.value)}>{["Manual Triage", ...DEPARTMENTS].map((d) => <option key={d}>{d}</option>)}</select>
          <select className={input} value={prio} onChange={(e) => setPrio(e.target.value as Priority)}>{["Critical", "High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}</select>
          <select className={input} value={status} onChange={(e) => setStatus(e.target.value as Grievance["status"])}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          <input className={input} placeholder="Remarks / reason for any correction" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className={btn} onClick={() => {
            const changed = dept !== g.department || prio !== g.priority;
            if (changed && !note) { alert("Please record a reason for correcting the AI suggestion."); return; }
            onChange(update(g.id, { department: dept, priority: prio, status }, note || "AI recommendation approved.", actor));
          }}>Save & log action</button>
        </div>
      )}
    </div>
  );
}
