import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { PageHead, card } from "@/components/site";
import { DEPARTMENTS } from "@/lib/grievance";

export const Route = createFileRoute("/departments")({
  head: () => ({ meta: [
    { title: "Department Directory — SmartGrievance AI" },
    { name: "description", content: "The 20 public-service departments that receive AI-routed grievances." },
    { property: "og:title", content: "Department Directory — SmartGrievance AI" },
    { property: "og:description", content: "20 departments connected to intelligent routing." },
  ] }),
  component: () => (
    <>
      <PageHead title="Department directory" sub="Complaints are routed to one primary department, with others collaborating when needed." />
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {DEPARTMENTS.map((d) => <div key={d} className={`${card} flex items-center gap-3`}><Building2 className="h-6 w-6 shrink-0 text-secondary" /><span className="font-medium">{d}</span></div>)}
      </div>
    </>
  ),
});
