import { createFileRoute } from "@tanstack/react-router";
import { LoginCard } from "@/components/portal";
export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "admin login — SmartGrievance AI" }, { name: "description", content: "Secure admin portal sign-in." }, { property: "og:title", content: "admin login — SmartGrievance AI" }, { property: "og:description", content: "Secure admin portal sign-in." }] }),
  component: () => <LoginCard role="admin" />,
});
