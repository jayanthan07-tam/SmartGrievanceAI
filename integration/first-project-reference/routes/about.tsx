import { createFileRoute } from "@tanstack/react-router";
import { PageHead, card } from "@/components/site";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — SmartGrievance AI" },
    { name: "description", content: "Why SmartGrievance AI exists and how it keeps humans in control." },
    { property: "og:title", content: "About — SmartGrievance AI" },
    { property: "og:description", content: "AI-assisted, human-verified grievance redressal." },
  ] }),
  component: () => (
    <>
      <PageHead title="About SmartGrievance AI" sub="Built for SYNAPSE ’26 (PS-020): AI Grievance Redressal Prioritization." />
      <div className="mx-auto grid max-w-5xl gap-4 px-4 py-10 md:grid-cols-3">
        {[["Human in control", "AI only suggests. Officers approve, correct, and record the reason."],
          ["Fair to every language", "Urgency is never lowered because a complaint is informal or in a regional language."],
          ["Private by design", "Tracking needs a secret PIN; maps show aggregated areas, never home addresses."]].map(([t, d]) => (
          <div key={t} className={card}><h2 className="font-semibold">{t}</h2><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>
        ))}
      </div>
    </>
  ),
});
