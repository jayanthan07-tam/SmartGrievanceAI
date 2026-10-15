import { createFileRoute } from "@tanstack/react-router";
import { LoginCard } from "@/components/portal";
export const Route = createFileRoute("/citizen/login")({
  head: () => ({ meta: [{ title: "citizen login — SmartGrievance AI" }, { name: "description", content: "Secure citizen portal sign-in." }, { property: "og:title", content: "citizen login — SmartGrievance AI" }, { property: "og:description", content: "Secure citizen portal sign-in." }] }),
  component: () => <LoginCard role="citizen" />,
});
