import { Link } from "@tanstack/react-router";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { Priority } from "@/lib/grievance";
import { PRIORITY_STYLE } from "@/lib/grievance";

const nav = [
  { to: "/", label: "Home" }, { to: "/register", label: "Register Grievance" }, { to: "/track", label: "Track Grievance" },
  { to: "/departments", label: "Departments" }, { to: "/about", label: "About" }, { to: "/help", label: "Help & Support" },
] as const;
const logins = [
  { to: "/citizen/login", label: "Citizen Login" }, { to: "/officer/login", label: "Department Officer Login" },
  { to: "/district-admin/login", label: "District Admin Login" }, { to: "/admin/login", label: "Super Admin Login" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-primary">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-hero text-primary-foreground"><ShieldCheck className="h-5 w-5" /></span>
          SmartGrievance<span className="text-secondary">AI</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>{n.label}</Link>
          ))}
        </nav>
        <select aria-label="Language" className="ml-auto rounded-lg border bg-card px-2 py-1.5 text-sm lg:ml-0">
          <option>English</option><option>తెలుగు</option><option>தமிழ்</option><option>हिन्दी</option>
        </select>
        <div className="relative">
          <button onClick={() => setOpen(!open)} className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Login <ChevronDown className="h-4 w-4" /></button>
          {open && (
            <div className="absolute right-0 mt-2 w-60 rounded-xl border bg-popover p-1 shadow-card" onClick={() => setOpen(false)}>
              {logins.map((l) => <Link key={l.to} to={l.to} className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">{l.label}</Link>)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm text-muted-foreground md:grid-cols-3">
        <div><p className="font-display text-base font-bold text-foreground">SmartGrievance AI</p><p className="mt-2">Your Voice, Our Priority — Intelligent Grievance Redressal for Everyone.</p></div>
        <div className="flex flex-col gap-1">{nav.slice(1).map((n) => <Link key={n.to} to={n.to} className="hover:text-primary">{n.label}</Link>)}</div>
        <p>Helpline (demo): 1800-000-0000 · support@smartgrievance.demo</p>
      </div>
      <p className="border-t px-4 py-4 text-center text-xs text-muted-foreground">SmartGrievance AI is a hackathon demonstration project and is not affiliated with any government department.</p>
    </footer>
  );
}

export function PriorityBadge({ p }: { p: Priority }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_STYLE[p]}`}>{p}</span>;
}

export function PageHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <section className="bg-hero text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12"><h1 className="font-display text-3xl font-bold md:text-4xl">{title}</h1>{sub && <p className="mt-2 max-w-2xl opacity-90">{sub}</p>}</div>
    </section>
  );
}

export const input = "w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
export const btn = "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50";
export const card = "rounded-2xl border bg-card p-6 shadow-card";
