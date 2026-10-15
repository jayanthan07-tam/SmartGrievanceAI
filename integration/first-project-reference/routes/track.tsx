import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead, PriorityBadge, card, btn, input } from "@/components/site";
import { load, update, type Grievance } from "@/lib/grievance";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [
    { title: "Track Grievance — SmartGrievance AI" },
    { name: "description", content: "Check your complaint status securely with your grievance ID and PIN." },
    { property: "og:title", content: "Track Grievance — SmartGrievance AI" },
    { property: "og:description", content: "Secure, transparent complaint tracking." },
  ] }),
  component: Track,
});

function Track() {
  const [id, setId] = useState(""); const [pin, setPin] = useState("");
  const [g, setG] = useState<Grievance | null>(null); const [err, setErr] = useState("");
  function find(e: React.FormEvent) {
    e.preventDefault();
    const m = load().find((x) => x.id.toLowerCase() === id.trim().toLowerCase() && x.pin === pin.trim());
    setG(m ?? null); setErr(m ? "" : "No grievance matches that ID and PIN.");
  }
  function act(status: Grievance["status"], note: string) { if (!g) return; setG(update(g.id, { status }, note, "Citizen").find((x) => x.id === g.id)!); }
  return (
    <>
      <PageHead title="Track your grievance" sub="Enter your grievance ID and the private PIN shown at submission." />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <form onSubmit={find} className={`${card} flex flex-wrap gap-3`}>
          <input className={`${input} flex-1`} placeholder="SGAI-2026-000001" value={id} onChange={(e) => setId(e.target.value)} />
          <input className={`${input} w-32`} placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
          <button className={btn}>Track</button>
        </form>
        {err && <p className="mt-4 text-sm text-destructive">{err}</p>}
        {g && (
          <div className={`${card} mt-6`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div><p className="text-xs text-muted-foreground">{g.id}</p><h2 className="font-display text-xl font-bold">{g.title}</h2></div>
              <PriorityBadge p={g.priority} />
            </div>
            <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
              <p><span className="text-muted-foreground">Status</span><br /><b>{g.status}</b></p>
              <p><span className="text-muted-foreground">Department</span><br /><b>{g.department}</b></p>
              <p><span className="text-muted-foreground">Category</span><br /><b>{g.analysis.category}</b></p>
            </div>
            <ol className="mt-6 space-y-4 border-l-2 border-primary/30 pl-5">
              {g.timeline.map((t, i) => (
                <li key={i} className="relative"><span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-primary" />
                  <p className="text-sm font-semibold">{t.status}</p><p className="text-sm">{t.note}</p><p className="text-xs text-muted-foreground">{new Date(t.at).toLocaleString()} · {t.by}</p></li>
              ))}
            </ol>
            {g.status === "Resolved" && (
              <div className="mt-6 flex gap-3">
                <button className={btn} onClick={() => act("Resolved", "Citizen confirmed satisfaction.")}>I'm satisfied</button>
                <button className="rounded-lg border px-5 py-2.5 text-sm font-semibold" onClick={() => act("Reopened", "Citizen requested reopening.")}>Reopen</button>
              </div>
            )}
          </div>
        )}
        <p className="mt-6 text-xs text-muted-foreground">Demo tip: sample complaints are visible in the Officer portal (IDs SGAI-2026-000001…8).</p>
      </div>
    </>
  );
}
