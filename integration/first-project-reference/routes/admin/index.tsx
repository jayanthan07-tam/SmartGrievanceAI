import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/site";
import { Charts, ComplaintTable, Stats, useGrievances } from "@/components/portal";
export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "System-Wide Dashboard — SmartGrievance AI" }, { name: "description", content: "System-Wide Dashboard for SmartGrievance AI." }, { property: "og:title", content: "System-Wide Dashboard — SmartGrievance AI" }, { property: "og:description", content: "System-Wide Dashboard for SmartGrievance AI." }] }),
  component: Page,
});
function Page() {
  const [all, setList] = useGrievances();
  const list = all.filter((g) => true);
  return (<><PageHead title="System-Wide Dashboard" sub="Demo mode" /><div className="mx-auto max-w-7xl space-y-6 px-4 py-8"><Stats list={list} /><Charts list={list} by="department" /><ComplaintTable list={list} setList={setList} actor="System-Wide Dashboard" editable={true} /></div></>);
}
