import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth-gate";

export const Route = createFileRoute("/demo")({ component: DemoLayout });

function DemoLayout() {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
}
