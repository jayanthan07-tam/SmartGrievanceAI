import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, Sparkles, CheckCircle2 } from "lucide-react";
import { PageHead, PriorityBadge, card, btn, input } from "@/components/site";
import { AP_DISTRICTS, analyze, submit, type Grievance } from "@/lib/grievance";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [
    { title: "Register a Grievance — SmartGrievance AI" },
    { name: "description", content: "File a complaint in English, Telugu, Tamil or Hindi with instant AI analysis." },
    { property: "og:title", content: "Register a Grievance — SmartGrievance AI" },
    { property: "og:description", content: "File a complaint with instant AI urgency and department suggestions." },
  ] }),
  component: Register,
});

const LANG_CODES: Record<string, string> = { English: "en-IN", Telugu: "te-IN", Tamil: "ta-IN", Hindi: "hi-IN" };

function Register() {
  const [f, setF] = useState({ name: "", mobile: "", email: "", district: "Konaseema", mandal: "", village: "", title: "", description: "", language: "English" });
  const [done, setDone] = useState<Grievance | null>(null);
  const [err, setErr] = useState("");
  const [listening, setListening] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const preview = f.description.length > 10 ? analyze(f.title, f.description) : null;

  function voice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setErr("Voice input isn't supported in this browser. Please type your complaint."); return; }
    const r = new SR(); r.lang = LANG_CODES[f.language]; r.interimResults = false;
    r.onresult = (e: any) => setF((p) => ({ ...p, description: (p.description + " " + e.results[0][0].transcript).trim() }));
    r.onend = () => setListening(false); r.onerror = () => setListening(false);
    setListening(true); r.start();
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name || !/^\d{10}$/.test(f.mobile) || !f.mandal || !f.village || !f.title || f.description.length < 15) {
      setErr("Please fill all required fields. Mobile must be 10 digits; description at least 15 characters."); return;
    }
    setErr(""); setDone(submit(f));
  }

  if (done) return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <div className={`${card} text-center`}>
        <CheckCircle2 className="mx-auto h-14 w-14 text-secondary" />
        <h1 className="mt-4 font-display text-2xl font-bold">Grievance registered</h1>
        <p className="mt-6 text-sm text-muted-foreground">Grievance ID</p><p className="font-display text-2xl font-bold text-primary">{done.id}</p>
        <p className="mt-4 text-sm text-muted-foreground">Secret tracking PIN (keep private)</p><p className="font-display text-2xl font-bold">{done.pin}</p>
        <div className="mt-6 rounded-xl bg-muted p-4 text-left text-sm">
          <p><b>Suggested department:</b> {done.department}</p>
          <p className="mt-1"><b>Suggested priority:</b> <PriorityBadge p={done.priority} /></p>
          {done.duplicates.length > 0 && <p className="mt-1 text-high"><b>Similar complaints exist:</b> {done.duplicates.join(", ")}</p>}
          <p className="mt-2 text-muted-foreground">An officer will review these suggestions.</p>
        </div>
        <Link to="/track" className={`${btn} mt-6`}>Track this grievance</Link>
      </div>
    </div>
  );

  const label = "text-sm font-medium";
  return (
    <>
      <PageHead title="Register a Grievance" sub="Write in English, Telugu, Tamil, Hindi — or a mix. Our AI suggests urgency and department; an officer confirms." />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-3">
        <form onSubmit={onSubmit} className={`${card} grid gap-4 lg:col-span-2 md:grid-cols-2`}>
          <label className="grid gap-1"><span className={label}>Full name *</span><input className={input} value={f.name} onChange={set("name")} /></label>
          <label className="grid gap-1"><span className={label}>Mobile number *</span><input className={input} inputMode="numeric" maxLength={10} value={f.mobile} onChange={set("mobile")} /></label>
          <label className="grid gap-1"><span className={label}>Email</span><input type="email" className={input} value={f.email} onChange={set("email")} /></label>
          <label className="grid gap-1"><span className={label}>State</span><select className={input} disabled><option>Andhra Pradesh</option></select></label>
          <label className="grid gap-1"><span className={label}>District *</span><select className={input} value={f.district} onChange={(e) => setF({ ...f, district: e.target.value, mandal: "" })}>{Object.keys(AP_DISTRICTS).map((d) => <option key={d}>{d}</option>)}</select></label>
          <label className="grid gap-1"><span className={label}>Mandal *</span><select className={input} value={f.mandal} onChange={set("mandal")}><option value="">Select…</option>{(AP_DISTRICTS[f.district] ?? []).map((m) => <option key={m}>{m}</option>)}</select></label>
          <label className="grid gap-1"><span className={label}>Village / City *</span><input className={input} value={f.village} onChange={set("village")} /></label>
          <label className="grid gap-1"><span className={label}>Preferred language</span><select className={input} value={f.language} onChange={set("language")}>{Object.keys(LANG_CODES).map((l) => <option key={l}>{l}</option>)}</select></label>
          <label className="grid gap-1 md:col-span-2"><span className={label}>Complaint title *</span><input className={input} value={f.title} onChange={set("title")} /></label>
          <label className="grid gap-1 md:col-span-2">
            <span className={`${label} flex items-center justify-between`}>Complaint description *
              <button type="button" onClick={voice} className="flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground"><Mic className="h-3.5 w-3.5" />{listening ? "Listening…" : "Speak"}</button>
            </span>
            <textarea rows={6} className={input} value={f.description} onChange={set("description")} />
          </label>
          <label className="grid gap-1"><span className={label}>Supporting photo</span><input type="file" accept="image/*" className="text-sm" /></label>
          <label className="grid gap-1"><span className={label}>Supporting document</span><input type="file" accept=".pdf,.doc,.docx" className="text-sm" /></label>
          {err && <p className="text-sm text-destructive md:col-span-2">{err}</p>}
          <button className={`${btn} md:col-span-2`}>Submit grievance</button>
        </form>
        <aside className={`${card} h-fit`}>
          <h2 className="flex items-center gap-2 font-semibold"><Sparkles className="h-5 w-5 text-secondary" />Live AI analysis</h2>
          {!preview ? <p className="mt-3 text-sm text-muted-foreground">Start describing your problem to see suggestions.</p> : (
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="text-muted-foreground">Language</dt><dd className="font-medium">{preview.language}</dd></div>
              <div><dt className="text-muted-foreground">Priority</dt><dd><PriorityBadge p={preview.priority} /> <span className="block text-xs text-muted-foreground">{preview.priorityReason}</span></dd></div>
              <div><dt className="text-muted-foreground">Primary department</dt><dd className="font-medium">{preview.primary}</dd></div>
              {preview.secondary.length > 0 && <div><dt className="text-muted-foreground">Also involved</dt><dd>{preview.secondary.join(", ")}</dd></div>}
              <div><dt className="text-muted-foreground">Why</dt><dd>{preview.reason}</dd></div>
              <div><dt className="text-muted-foreground">Confidence</dt><dd>{Math.round(preview.confidence * 100)}% {preview.needsReview && <span className="text-high">· needs human review</span>}</dd></div>
            </dl>
          )}
          <p className="mt-6 text-xs text-muted-foreground">Demo mode: rule-based classifier. Suggestions only.</p>
        </aside>
      </div>
    </>
  );
}
