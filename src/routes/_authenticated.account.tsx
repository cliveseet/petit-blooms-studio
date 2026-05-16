import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatSGD } from "@/lib/cart";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/account")({
  validateSearch: (search: Record<string, unknown>) => ({
    payment: typeof search.payment === "string" ? search.payment : undefined,
    order: typeof search.order === "string" ? search.order : undefined,
    status: typeof search.status === "string" ? search.status : undefined,
  }),
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
  payment_status: string;
  hitpay_payment_url: string | null;
  order_items: Array<{
    id: string;
    product_name: string;
    image: string;
    quantity: number;
    unit_price: number;
    personal_message: string;
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
  const search = Route.useSearch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const nav = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    nav({ to: "/" });
  };

  useEffect(() => {
    if (!user) return;
    setLoadError(null);
    supabase
      .from("orders")
      .select(
        "id,status,fulfillment,scheduled_date,scheduled_time,total,created_at,payment_status,hitpay_payment_url,order_items(id,product_name,image,quantity,unit_price,personal_message,selection_labels)",
      )
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setLoadError(error.message);
          setOrders([]);
          setLoading(false);
          return;
        }
        setOrders((data as unknown as Order[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="bg-cream">
      <div className="container-page py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Link
              to="/shop"
              search={{ category: "all", occasion: "all" }}
              className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-clay hover:text-loam"
            >
              <ChevronLeft className="size-3.5" />
              Back to shop
            </Link>
            <p className="text-[11px] uppercase tracking-[0.34em] text-clay">Your account</p>
            <h1 className="mt-3 font-display text-4xl text-loam md:text-5xl">
              Hello,{" "}
              <span className="font-serif-italic text-clay">
                {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
              </span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-md border hairline px-4 py-2 text-xs uppercase tracking-[0.22em] text-loam hover:bg-shell"
              >
                Admin dashboard
              </Link>
            )}
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="text-xs uppercase tracking-[0.22em]"
            >
              Sign out
            </Button>
          </div>
        </div>

        {search.payment === "hitpay" && (
          <PaymentReturnNotice
            order={orders.find((order) => order.id === search.order) ?? null}
            loading={loading}
            status={search.status}
          />
        )}

        <div className="mt-12">
          <h2 className="font-display text-2xl text-loam">Order history</h2>
          {loadError ? (
            <div className="mt-8 rounded-2xl border hairline bg-shell p-8">
              <p className="font-display text-xl text-loam">Orders could not be loaded.</p>
              <p className="mt-2 text-sm leading-6 text-ink/70">{loadError}</p>
            </div>
          ) : loading ? (
            <p className="mt-6 text-sm text-muted-foreground">Loading orders…</p>
          ) : orders.length === 0 ? (
            <div className="mt-8 rounded-2xl border hairline bg-shell p-12 text-center">
              <p className="font-serif-italic text-xl text-loam">No orders just yet.</p>
              <Link
                to="/shop"
                search={{ category: "all", occasion: "all" }}
                className="mt-4 inline-block text-xs uppercase tracking-[0.22em] text-clay underline"
              >
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
                        {new Date(o.created_at).toLocaleDateString("en-SG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="mt-1 text-xs text-ink/70">
                        {o.fulfillment === "delivery" ? "Delivery" : "Self-collection"} ·{" "}
                        {new Date(o.scheduled_date).toLocaleDateString("en-SG", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        · {o.scheduled_time}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] ${statusTone[o.status] ?? "bg-muted"}`}
                      >
                        {statusLabel[o.status] ?? o.status}
                      </span>
                      <span className="rounded-full border hairline bg-shell px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-clay">
                        Payment {o.payment_status}
                      </span>
                      <p className="font-display text-xl text-loam tabular-nums">
                        {formatSGD(Number(o.total))}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-5 space-y-4">
                    {o.order_items.map((it) => (
                      <li key={it.id} className="flex gap-4">
                        <img
                          src={it.image}
                          alt={it.product_name}
                          className="h-16 w-16 flex-none rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-display text-base text-loam">{it.product_name}</p>
                          {Object.values(it.selection_labels || {}).length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {Object.values(it.selection_labels).join(" · ")}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Personal message: {it.personal_message || "NIL"}
                          </p>
                          <p className="text-xs text-ink/70">× {it.quantity}</p>
                        </div>
                        <p className="text-sm tabular-nums text-ink/80">
                          {formatSGD(Number(it.unit_price) * it.quantity)}
                        </p>
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

function PaymentReturnNotice({
  order,
  loading,
  status,
}: {
  order: Order | null;
  loading: boolean;
  status?: string;
}) {
  if (loading) {
    return (
      <div className="mt-8 rounded-2xl border hairline bg-shell p-6 text-sm text-muted-foreground">
        Checking your payment status…
      </div>
    );
  }

  const returnedStatus = status?.toLowerCase();
  const failed = ["failed", "cancelled", "canceled", "expired"].includes(returnedStatus ?? "");
  const paid = order?.payment_status === "paid" || returnedStatus === "completed";

  if (paid) {
    return (
      <div className="mt-8 rounded-2xl border border-sage/45 bg-sage/20 p-6 text-sm leading-6 text-loam">
        Payment received. Your order is now in the studio order book.
      </div>
    );
  }

  if (failed) {
    return (
      <div className="mt-8 rounded-2xl border border-destructive/25 bg-destructive/5 p-6">
        <p className="font-display text-xl text-loam">Payment was not completed.</p>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          Your order has been saved, but it has not been marked as paid. You can try payment again.
        </p>
        {order?.hitpay_payment_url && (
          <Button asChild className="mt-5">
            <a href={order.hitpay_payment_url}>Try payment again</a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border hairline bg-shell p-6 text-sm leading-6 text-ink/70">
      Payment confirmation is still pending. If you have just paid, this page will update after
      HitPay confirms the payment.
    </div>
  );
}
