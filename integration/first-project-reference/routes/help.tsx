import { createFileRoute } from "@tanstack/react-router";
import { PageHead, card } from "@/components/site";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [
    { title: "Help & Support — SmartGrievance AI" },
    { name: "description", content: "Get help registering or tracking a grievance." },
    { property: "og:title", content: "Help & Support — SmartGrievance AI" },
    { property: "og:description", content: "Support for citizens and officers." },
  ] }),
  component: () => (
    <>
      <PageHead title="Help & Support" />
      <div className="mx-auto grid max-w-4xl gap-4 px-4 py-10 md:grid-cols-2">
        <div className={card}><h2 className="font-semibold">Helpline (demo)</h2><p className="mt-2 text-sm text-muted-foreground">1800-000-0000 · Mon–Sat, 9am–6pm</p></div>
        <div className={card}><h2 className="font-semibold">Email (demo)</h2><p className="mt-2 text-sm text-muted-foreground">support@smartgrievance.demo</p></div>
        <div className={`${card} md:col-span-2`}><h2 className="font-semibold">Lost your PIN?</h2><p className="mt-2 text-sm text-muted-foreground">For your privacy, PINs can't be shown again. Log in to the Citizen portal to view your own complaints.</p></div>
      </div>
    </>
  ),
});
