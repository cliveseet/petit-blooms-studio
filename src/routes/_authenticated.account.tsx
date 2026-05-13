import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatSGD } from "@/lib/cart";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Your account — petit blooms" }] }),
  component: AccountPage,
});

type Order = {
  id: string;
  status: string;
  fulfillment: string;
  scheduled_date: string;
  scheduled_time: string;
  total: number;
  created_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    image: string;
    quantity: number;
    unit_price: number;
    selection_labels: Record<string, string>;
  }>;
};

const statusTone: Record<string, string> = {
  pending: "bg-blush text-loam",
  in_progress: "bg-sage/40 text-loam",
  completed: "bg-loam text-cream",
  cancelled: "bg-muted text-muted-foreground",
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function AccountPage() {
  const { user, signOut, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id,status,fulfillment,scheduled_date,scheduled_time,total,created_at,order_items(id,product_name,image,quantity,unit_price,selection_labels)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as unknown as Order[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="bg-cream">
      <div className="container-page py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-clay">Your account</p>
            <h1 className="mt-3 font-display text-4xl text-loam md:text-5xl">
              Hello, <span className="font-serif-italic text-clay">{user?.user_metadata?.full_name || user?.email?.split("@")[0]}</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <Link to="/admin" className="rounded-md border hairline px-4 py-2 text-xs uppercase tracking-[0.22em] text-loam hover:bg-shell">
                Admin dashboard
              </Link>
            )}
            <Button variant="outline" onClick={signOut} className="text-xs uppercase tracking-[0.22em]">
              Sign out
            </Button>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="font-display text-2xl text-loam">Order history</h2>
          {loading ? (
            <p className="mt-6 text-sm text-muted-foreground">Loading orders…</p>
          ) : orders.length === 0 ? (
            <div className="mt-8 rounded-2xl border hairline bg-shell p-12 text-center">
              <p className="font-serif-italic text-xl text-loam">No orders just yet.</p>
              <Link to="/shop" className="mt-4 inline-block text-xs uppercase tracking-[0.22em] text-clay underline">
                Browse the shop
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {orders.map((o) => (
                <article key={o.id} className="rounded-2xl border hairline bg-shell p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b hairline pb-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                        Order · {o.id.slice(0, 8)}
                      </p>
                      <p className="mt-1 font-display text-lg text-loam">
                        {new Date(o.created_at).toLocaleDateString("en-SG", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <p className="mt-1 text-xs text-ink/70">
                        {o.fulfillment === "delivery" ? "Delivery" : "Self-collection"} · {new Date(o.scheduled_date).toLocaleDateString("en-SG", { day: "numeric", month: "short" })} · {o.scheduled_time}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] ${statusTone[o.status] ?? "bg-muted"}`}>
                        {statusLabel[o.status] ?? o.status}
                      </span>
                      <p className="font-display text-xl text-loam tabular-nums">{formatSGD(Number(o.total))}</p>
                    </div>
                  </div>
                  <ul className="mt-5 space-y-4">
                    {o.order_items.map((it) => (
                      <li key={it.id} className="flex gap-4">
                        <img src={it.image} alt={it.product_name} className="h-16 w-16 flex-none rounded-md object-cover" />
                        <div className="flex-1">
                          <p className="font-display text-base text-loam">{it.product_name}</p>
                          {Object.values(it.selection_labels || {}).length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {Object.values(it.selection_labels).join(" · ")}
                            </p>
                          )}
                          <p className="text-xs text-ink/70">× {it.quantity}</p>
                        </div>
                        <p className="text-sm tabular-nums text-ink/80">{formatSGD(Number(it.unit_price) * it.quantity)}</p>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
