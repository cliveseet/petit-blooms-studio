import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  component: Authed,
});

function Authed() {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="container-page py-32 text-center text-sm text-muted-foreground">Loading…</div>
    );
  }
  if (!session) return <Navigate to="/login" />;
  return <Outlet />;
}
