import { createFileRoute, Navigate } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — petit blooms" }] }),
  component: AdminPage,
});

type Status = "pending" | "in_progress" | "completed" | "cancelled";
type CycleStatus = "pending" | "in_progress" | "completed";

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  selection_labels: Record<string, string>;
};

type Order = {
  id: string;
  contact_name: string;
  contact_email: string;
  fulfillment: "delivery" | "pickup";
  scheduled_date: string;
  scheduled_time: string;
  status: Status;
  created_at: string;
  order_items: OrderItem[];
};

const cycleStatuses: CycleStatus[] = ["pending", "in_progress", "completed"];

const statusLabel: Record<Status, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusTone: Record<Status, string> = {
  pending: "border-bronze/30 bg-blush text-loam",
  in_progress: "border-sage/50 bg-sage/30 text-loam",
  completed: "border-loam bg-loam text-cream",
  cancelled: "border-ink/10 bg-muted text-muted-foreground",
};

function nextStatus(status: Status): CycleStatus {
  if (status === "pending") return "in_progress";
  if (status === "in_progress") return "completed";
  return "pending";
}

function cleanSelectionLabel(label: string | undefined) {
  if (!label) return "—";
  return label.includes(":") ? label.split(":").slice(1).join(":").trim() : label;
}

function selectionValue(item: OrderItem, keys: string[]) {
  const entries = Object.entries(item.selection_labels ?? {});
  for (const [key, label] of entries) {
    const haystack = `${key} ${label}`.toLowerCase();
    if (keys.some((candidate) => haystack.includes(candidate))) {
      return cleanSelectionLabel(label);
    }
  }
  return "—";
}

function productText(order: Order) {
  if (order.order_items.length === 0) return "—";
  return order.order_items
    .map((item) => `${item.product_name}${item.quantity > 1 ? ` × ${item.quantity}` : ""}`)
    .join(", ");
}

function detailText(order: Order, keys: string[]) {
  if (order.order_items.length === 0) return "—";
  return order.order_items.map((item) => selectionValue(item, keys)).join(", ");
}

function formatDate(date: string, time: string) {
  return `${new Date(date).toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} · ${time}`;
}

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      pending: orders.filter((order) => order.status === "pending").length,
      in_progress: orders.filter((order) => order.status === "in_progress").length,
      completed: orders.filter((order) => order.status === "completed").length,
    }),
    [orders],
  );

  const refresh = async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id,contact_name,contact_email,fulfillment,scheduled_date,scheduled_time,status,created_at,order_items(id,product_name,quantity,selection_labels)",
      )
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setOrdersLoading(false);
      return;
    }

    setOrders((data as unknown as Order[]) ?? []);
    setOrdersLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    void refresh();
  }, [isAdmin]);

  const cycleStatus = async (order: Order) => {
    const status = nextStatus(order.status);
    setUpdatingId(order.id);
    const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
    setUpdatingId(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    setOrders((current) =>
      current.map((candidate) =>
        candidate.id === order.id ? { ...candidate, status } : candidate,
      ),
    );
    toast.success(`Marked ${statusLabel[status].toLowerCase()}`);
  };

  if (loading) {
    return (
      <div className="container-page py-24 text-center text-sm text-muted-foreground">Loading…</div>
    );
  }

  if (!isAdmin) return <Navigate to="/account" />;

  return (
    <div className="min-h-[80vh] bg-cream">
      <div className="container-page py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-clay">Florist</p>
            <h1 className="mt-3 font-display text-4xl text-loam md:text-5xl">
              Order book<span className="font-serif-italic text-clay">.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/70">
              A single working view for every customer order, scheduled collection or delivery, and
              fulfilment status.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void refresh()}
            disabled={ordersLoading}
            className="border-ink/15 bg-shell text-xs uppercase tracking-[0.22em] text-loam hover:bg-cream"
          >
            {ordersLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Refresh
          </Button>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {cycleStatuses.map((status) => (
            <div key={status} className="rounded-xl border hairline bg-shell p-5">
              <p className="text-[10px] uppercase tracking-[0.28em] text-clay">
                {statusLabel[status]}
              </p>
              <p className="mt-2 font-display text-3xl text-loam tabular-nums">{counts[status]}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border hairline bg-shell shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between gap-4 border-b hairline px-5 py-4 md:px-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-clay">All orders</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {orders.length} {orders.length === 1 ? "order" : "orders"} in Supabase
              </p>
            </div>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <CalendarDays className="size-4 text-clay" />
              Singapore schedule
            </div>
          </div>

          {ordersLoading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-clay" />
              Loading orders…
            </div>
          ) : orders.length === 0 ? (
            <div className="min-h-64 px-6 py-16 text-center">
              <p className="font-serif-italic text-xl text-loam">No orders yet.</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                New checkout submissions will appear here after Supabase accepts the order.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-cream/60 hover:bg-cream/60">
                  <TableHead className="px-5 py-4 text-[10px] uppercase tracking-[0.24em] text-clay">
                    Customer
                  </TableHead>
                  <TableHead className="px-5 py-4 text-[10px] uppercase tracking-[0.24em] text-clay">
                    Product ordered
                  </TableHead>
                  <TableHead className="px-5 py-4 text-[10px] uppercase tracking-[0.24em] text-clay">
                    Size
                  </TableHead>
                  <TableHead className="px-5 py-4 text-[10px] uppercase tracking-[0.24em] text-clay">
                    Colour
                  </TableHead>
                  <TableHead className="px-5 py-4 text-[10px] uppercase tracking-[0.24em] text-clay">
                    Delivery / pick-up
                  </TableHead>
                  <TableHead className="px-5 py-4 text-[10px] uppercase tracking-[0.24em] text-clay">
                    Scheduled date
                  </TableHead>
                  <TableHead className="px-5 py-4 text-[10px] uppercase tracking-[0.24em] text-clay">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-cream/45">
                    <TableCell className="min-w-44 px-5 py-5 align-top">
                      <p className="font-display text-base text-loam">{order.contact_name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{order.contact_email}</p>
                    </TableCell>
                    <TableCell className="min-w-56 px-5 py-5 align-top text-sm leading-6 text-ink/85">
                      {productText(order)}
                    </TableCell>
                    <TableCell className="min-w-32 px-5 py-5 align-top text-sm text-ink/80">
                      {detailText(order, ["size", "stalk"])}
                    </TableCell>
                    <TableCell className="min-w-48 px-5 py-5 align-top text-sm leading-6 text-ink/80">
                      {detailText(order, ["colour", "color", "scheme"])}
                    </TableCell>
                    <TableCell className="min-w-40 px-5 py-5 align-top">
                      <span className="inline-flex rounded-full border border-sage/40 bg-sage/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-loam">
                        {order.fulfillment === "delivery" ? "Delivery" : "Pick-up"}
                      </span>
                    </TableCell>
                    <TableCell className="min-w-44 px-5 py-5 align-top text-sm text-ink/80">
                      {formatDate(order.scheduled_date, order.scheduled_time)}
                    </TableCell>
                    <TableCell className="min-w-44 px-5 py-5 align-top">
                      <button
                        type="button"
                        onClick={() => void cycleStatus(order)}
                        disabled={updatingId === order.id}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-all disabled:cursor-not-allowed disabled:opacity-60",
                          statusTone[order.status],
                        )}
                      >
                        {updatingId === order.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <ChevronRight className="size-3" />
                        )}
                        {statusLabel[order.status]}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </div>
    </div>
  );
}
