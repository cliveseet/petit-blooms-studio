import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { formatSGD } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — petit blooms" }] }),
  component: AdminPage,
});

type Status = "pending" | "in_progress" | "completed" | "cancelled";

type Order = {
  id: string;
  status: Status;
  fulfillment: "delivery" | "pickup";
  scheduled_date: string;
  scheduled_time: string;
  delivery_address: string | null;
  delivery_postal: string | null;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  notes: string | null;
  total: number;
  created_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    image: string;
    quantity: number;
    selection_labels: Record<string, string>;
  }>;
};

const STATUS_FLOW: Status[] = ["pending", "in_progress", "completed", "cancelled"];
const statusLabel: Record<Status, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};
const statusTone: Record<Status, string> = {
  pending: "bg-blush text-loam",
  in_progress: "bg-sage/40 text-loam",
  completed: "bg-loam text-cream",
  cancelled: "bg-muted text-muted-foreground",
};

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Status | "all">("all");

  useEffect(() => {
    if (!isAdmin) return;
    refresh();
  }, [isAdmin]);

  const refresh = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("id,status,fulfillment,scheduled_date,scheduled_time,delivery_address,delivery_postal,contact_name,contact_phone,contact_email,notes,total,created_at,order_items(id,product_name,image,quantity,selection_labels)")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setOrders((data as unknown as Order[]) ?? []);
  };

  const setStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, status } : o)));
    toast.success(`Marked ${statusLabel[status].toLowerCase()}`);
  };

  if (loading) return <div className="container-page py-24 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!isAdmin) return <Navigate to="/account" />;

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="bg-cream">
      <div className="container-page py-12 md:py-16">
        <p className="text-[11px] uppercase tracking-[0.34em] text-clay">Florist</p>
        <h1 className="mt-3 font-display text-4xl text-loam md:text-5xl">
          Order book<span className="font-serif-italic text-clay">.</span>
        </h1>

        <div className="mt-8 flex flex-wrap gap-2">
          {(["all", ...STATUS_FLOW] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as Status | "all")}
              className={cn("rounded-md border px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] transition-all",
                filter === f ? "border-loam bg-loam text-cream" : "border-ink/15 bg-shell text-ink/70 hover:border-clay/50 hover:text-loam")}
            >
              {f === "all" ? `All · ${orders.length}` : `${statusLabel[f as Status]} · ${orders.filter(o => o.status === f).length}`}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {filtered.length === 0 ? (
            <p className="rounded-2xl border hairline bg-shell p-12 text-center text-sm text-muted-foreground">No orders here.</p>
          ) : filtered.map((o) => (
            <article key={o.id} className="rounded-2xl border hairline bg-shell p-6 md:p-7">
              <div className="grid gap-5 md:grid-cols-12">
                <div className="md:col-span-3">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">#{o.id.slice(0, 8)}</p>
                  <p className="mt-1 font-display text-lg text-loam">{o.contact_name}</p>
                  <p className="text-xs text-ink/70">{o.contact_phone}</p>
                  <p className="text-[11px] text-muted-foreground">{o.contact_email}</p>
                </div>
                <div className="md:col-span-3">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-clay">
                    {o.fulfillment === "delivery" ? "Delivery" : "Self-collection"}
                  </p>
                  <p className="mt-1 text-sm text-ink/85">
                    {new Date(o.scheduled_date).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p className="text-xs text-ink/70">{o.scheduled_time}</p>
                  {o.fulfillment === "delivery" && (
                    <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2">{o.delivery_address} · {o.delivery_postal}</p>
                  )}
                </div>
                <div className="md:col-span-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-clay">Items</p>
                  <ul className="mt-1 space-y-2">
                    {o.order_items.map((it) => (
                      <li key={it.id} className="flex gap-3">
                        <img src={it.image} alt="" className="h-10 w-10 flex-none rounded object-cover" />
                        <div className="flex-1 text-xs">
                          <p className="font-display text-sm text-loam">{it.product_name} <span className="text-muted-foreground">× {it.quantity}</span></p>
                          {Object.values(it.selection_labels || {}).length > 0 && (
                            <p className="text-[11px] text-muted-foreground">{Object.values(it.selection_labels).join(" · ")}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {o.notes && <p className="mt-3 rounded border-l-2 border-clay/60 bg-cream px-3 py-2 text-[11px] italic text-ink/75">{o.notes}</p>}
                </div>
                <div className="md:col-span-2 md:text-right">
                  <p className="font-display text-xl text-loam tabular-nums">{formatSGD(Number(o.total))}</p>
                  <span className={`mt-2 inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] ${statusTone[o.status]}`}>
                    {statusLabel[o.status]}
                  </span>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 border-t hairline pt-4">
                {STATUS_FLOW.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(o.id, s)}
                    disabled={o.status === s}
                    className={cn("rounded-md border px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] transition-all",
                      o.status === s
                        ? "border-loam bg-loam text-cream"
                        : "border-ink/15 bg-cream text-ink/70 hover:border-clay/50 hover:text-loam")}
                  >
                    Mark {statusLabel[s].toLowerCase()}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
