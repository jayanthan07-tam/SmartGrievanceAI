import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/site";
import { Charts, ComplaintTable, Stats, useGrievances } from "@/components/portal";
export const Route = createFileRoute("/officer/")({
  head: () => ({ meta: [{ title: "Officer Dashboard — SmartGrievance AI" }, { name: "description", content: "Officer Dashboard for SmartGrievance AI." }, { property: "og:title", content: "Officer Dashboard — SmartGrievance AI" }, { property: "og:description", content: "Officer Dashboard for SmartGrievance AI." }] }),
  component: Page,
});
function Page() {
  const [all, setList] = useGrievances();
  const list = all.filter((g) => true);
  return (<><PageHead title="Officer Dashboard" sub="Demo mode" /><div className="mx-auto max-w-7xl space-y-6 px-4 py-8"><Stats list={list} /><ComplaintTable list={list} setList={setList} actor="Officer Dashboard" editable={true} /></div></>);
}
