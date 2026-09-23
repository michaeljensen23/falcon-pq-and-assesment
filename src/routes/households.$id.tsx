import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth-gate";

export const Route = createFileRoute("/households/$id")({ component: HouseholdLayout });

function HouseholdLayout() {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
}
