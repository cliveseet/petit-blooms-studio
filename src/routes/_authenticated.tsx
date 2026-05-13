import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  component: Authed,
});

function Authed() {
  const { session, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && !session) nav({ to: "/login" });
  }, [loading, session, nav]);
  if (loading) {
    return <div className="container-page py-32 text-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!session) return null;
  return <Outlet />;
}
