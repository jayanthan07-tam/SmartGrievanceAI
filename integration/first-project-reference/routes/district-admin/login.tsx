import { createFileRoute } from "@tanstack/react-router";
import { LoginCard } from "@/components/portal";
export const Route = createFileRoute("/district-admin/login")({
  head: () => ({ meta: [{ title: "district-admin login — SmartGrievance AI" }, { name: "description", content: "Secure district-admin portal sign-in." }, { property: "og:title", content: "district-admin login — SmartGrievance AI" }, { property: "og:description", content: "Secure district-admin portal sign-in." }] }),
  component: () => <LoginCard role="district" />,
});
