import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/site";
import { Charts, ComplaintTable, Stats, useGrievances } from "@/components/portal";
export const Route = createFileRoute("/district-admin/")({
  head: () => ({ meta: [{ title: "Konaseema District Dashboard — SmartGrievance AI" }, { name: "description", content: "Konaseema District Dashboard for SmartGrievance AI." }, { property: "og:title", content: "Konaseema District Dashboard — SmartGrievance AI" }, { property: "og:description", content: "Konaseema District Dashboard for SmartGrievance AI." }] }),
  component: Page,
});
function Page() {
  const [all, setList] = useGrievances();
  const list = all.filter((g) => g.district === "Konaseema");
  return (<><PageHead title="Konaseema District Dashboard" sub="Demo mode" /><div className="mx-auto max-w-7xl space-y-6 px-4 py-8"><Stats list={list} /><Charts list={list} by="mandal" /><ComplaintTable list={list} setList={setList} actor="Konaseema District Dashboard" editable={true} /></div></>);
}
