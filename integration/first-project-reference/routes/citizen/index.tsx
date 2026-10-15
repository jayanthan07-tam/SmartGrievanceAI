import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/site";
import { Charts, ComplaintTable, Stats, useGrievances } from "@/components/portal";
export const Route = createFileRoute("/citizen/")({
  head: () => ({ meta: [{ title: "My Complaints — SmartGrievance AI" }, { name: "description", content: "My Complaints for SmartGrievance AI." }, { property: "og:title", content: "My Complaints — SmartGrievance AI" }, { property: "og:description", content: "My Complaints for SmartGrievance AI." }] }),
  component: Page,
});
function Page() {
  const [all, setList] = useGrievances();
  const list = all.filter((g) => g.name === "Demo Citizen");
  return (<><PageHead title="My Complaints" sub="Demo mode" /><div className="mx-auto max-w-7xl space-y-6 px-4 py-8"><Stats list={list} /><ComplaintTable list={list} setList={setList} actor="My Complaints" editable={false} /></div></>);
}
