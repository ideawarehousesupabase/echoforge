import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthGuard } from "../components/AuthGuard";
import { AppShell } from "../components/AppShell";

export const Route = createFileRoute("/app")({
  component: () => (
    <AuthGuard>
      <AppShell>
        <Outlet />
      </AppShell>
    </AuthGuard>
  ),
});
