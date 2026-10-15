import { createFileRoute } from "@tanstack/react-router";
import { LoginCard } from "@/components/portal";
export const Route = createFileRoute("/officer/login")({
  head: () => ({ meta: [{ title: "officer login — SmartGrievance AI" }, { name: "description", content: "Secure officer portal sign-in." }, { property: "og:title", content: "officer login — SmartGrievance AI" }, { property: "og:description", content: "Secure officer portal sign-in." }] }),
  component: () => <LoginCard role="officer" />,
});
