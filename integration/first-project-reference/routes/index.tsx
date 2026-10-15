import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, Languages, MapPin, Siren, Copy, Route as RouteIcon, FileText, Search, CheckCircle2, Mic } from "lucide-react";
import { card, btn } from "@/components/site";
import { DEPARTMENTS } from "@/lib/grievance";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartGrievance AI — Your Voice, Our Priority" },
      { name: "description", content: "AI-powered multilingual grievance redressal: report problems, auto-prioritize urgency, route to the right department, track transparently." },
      { property: "og:title", content: "SmartGrievance AI — Your Voice, Our Priority" },
      { property: "og:description", content: "Intelligent, multilingual grievance redressal for everyone." },
    ],
  }),
  component: Index,
});

const features = [
  { i: Brain, t: "Smart classification", d: "Understands complaints and suggests a category with a clear reason." },
  { i: Siren, t: "Urgency prioritization", d: "Critical, High, Medium, Low — with an explanation every time." },
  { i: RouteIcon, t: "Department routing", d: "Recommends a primary department plus collaborating ones." },
  { i: Copy, t: "Duplicate detection", d: "Flags similar complaints from the same place, never deletes them." },
  { i: MapPin, t: "Hotspot mapping", d: "Shows where problems cluster, without exposing private addresses." },
  { i: Mic, t: "Voice complaints", d: "Speak in Telugu, Tamil, Hindi or English where your browser supports it." },
];
const steps = [
  { i: FileText, t: "Describe", d: "Type or speak your problem in your language." },
  { i: Brain, t: "AI analyzes", d: "Urgency and department are suggested instantly." },
  { i: CheckCircle2, t: "Officer reviews", d: "A human verifies and acts on it." },
  { i: Search, t: "Track", d: "Follow every update with your grievance ID." },
];
const faqs = [
  ["Is the AI decision final?", "No. Every suggestion is reviewed by an officer, who can change it."],
  ["Can others see my complaint?", "Tracking needs your grievance ID and your secret PIN."],
  ["Which languages work?", "English, Telugu, Tamil and Hindi, including mixed and Romanized text."],
];

function Index() {
  return (
    <>
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-24 md:py-32">
          <p className="inline-flex rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">SYNAPSE ’26 · PS-020</p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-extrabold leading-tight md:text-6xl">SmartGrievance AI — Your Voice, Our Priority</h1>
          <p className="mt-6 max-w-2xl text-lg opacity-90">An AI-powered multilingual grievance redressal platform that helps citizens report problems, identifies urgent issues, recommends the appropriate departments, and enables transparent complaint tracking.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="rounded-lg bg-card px-6 py-3 font-semibold text-primary">Register a Grievance</Link>
            <Link to="/track" className="rounded-lg border border-primary-foreground/50 px-6 py-3 font-semibold">Track Your Complaint</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold">How it works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {steps.map((s, n) => (
            <div key={s.t} className={card}><span className="text-xs font-bold text-secondary">STEP {n + 1}</span><s.i className="mt-3 h-7 w-7 text-primary" /><h3 className="mt-3 font-semibold">{s.t}</h3><p className="mt-1 text-sm text-muted-foreground">{s.d}</p></div>
          ))}
        </div>
      </section>

      <section className="bg-muted/60 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-display text-3xl font-bold">AI-powered features</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.t} className={card}><span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground"><f.i className="h-5 w-5" /></span><h3 className="mt-4 font-semibold">{f.t}</h3><p className="mt-1 text-sm text-muted-foreground">{f.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-2 font-display text-3xl font-bold"><Languages className="h-7 w-7 text-secondary" />Supported languages</h2>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[["English", "Hello"], ["తెలుగు", "Telugu"], ["தமிழ்", "Tamil"], ["हिन्दी", "Hindi"]].map(([a, b]) => (
              <div key={a} className={card}><p className="font-display text-2xl font-bold text-primary">{a}</p><p className="text-sm text-muted-foreground">{b}</p></div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold">Frequently asked</h2>
          <div className="mt-6 space-y-3">
            {faqs.map(([q, a]) => <details key={q} className="rounded-xl border bg-card p-4"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-2 text-sm text-muted-foreground">{a}</p></details>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className={`${card} flex flex-wrap items-center justify-between gap-4`}>
          <div><h2 className="font-display text-2xl font-bold">{DEPARTMENTS.length} departments connected</h2><p className="text-sm text-muted-foreground">From Agriculture to Disaster Management.</p></div>
          <Link to="/departments" className={btn}>View directory</Link>
        </div>
      </section>
    </>
  );
}
