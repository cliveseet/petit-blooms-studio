import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCart, formatSGD } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Truck, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Checkout — petit blooms" }] }),
  component: CheckoutPage,
});

const TIME_SLOTS = ["10:00 – 12:00", "12:00 – 14:00", "14:00 – 16:00", "16:00 – 18:00", "18:00 – 20:00"];
const STORE_POSTAL = 570111;

// Rough delivery fee — first 2 digits of SG postal code roughly map to district.
function estimateDeliveryFee(postal: string): number {
  const n = parseInt(postal.slice(0, 6), 10);
  if (Number.isNaN(n) || postal.length !== 6) return 20;
  const d1 = Math.floor(n / 10000);
  const d2 = Math.floor(STORE_POSTAL / 10000);
  const delta = Math.abs(d1 - d2);
  const fee = 15 + delta * 1.2;
  return Math.min(40, Math.max(15, Math.round(fee)));
}

function CheckoutPage() {
  const { user } = useAuth();
  const { lines, subtotal, clear } = useCart();
  const nav = useNavigate();

  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState<string>("");
  const [address, setAddress] = useState("");
  const [postal, setPostal] = useState("");
  const [voucher, setVoucher] = useState("");
  const [voucherApplied, setVoucherApplied] = useState<{ code: string; discount: number } | null>(null);
  const [name, setName] = useState(user?.user_metadata?.full_name ?? "");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const deliveryFee = useMemo(() => {
    if (fulfillment === "pickup") return 0;
    if (subtotal >= 180) return 0;
    if (postal.length === 6) return estimateDeliveryFee(postal);
    return 20;
  }, [fulfillment, postal, subtotal]);

  const discount = voucherApplied?.discount ?? 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const applyVoucher = () => {
    const code = voucher.trim().toUpperCase();
    if (!code) return;
    if (code === "BLOOM10") {
      const d = subtotal * 0.1;
      setVoucherApplied({ code, discount: d });
      toast.success(`Voucher applied: 10% off (−${formatSGD(d)})`);
    } else if (code === "PETIT5") {
      setVoucherApplied({ code, discount: 5 });
      toast.success(`Voucher applied: ${formatSGD(5)} off`);
    } else {
      toast.error("Voucher not recognised.");
    }
  };

  const valid =
    lines.length > 0 &&
    !!date &&
    !!slot &&
    !!name &&
    !!phone &&
    (fulfillment === "pickup" || (address.length > 5 && postal.length === 6));

  const placeOrder = async () => {
    if (!valid || !user) return;
    setBusy(true);
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id,
      fulfillment,
      scheduled_date: format(date!, "yyyy-MM-dd"),
      scheduled_time: slot,
      delivery_address: fulfillment === "delivery" ? address : null,
      delivery_postal: fulfillment === "delivery" ? postal : null,
      delivery_fee: deliveryFee,
      voucher_code: voucherApplied?.code ?? null,
      discount,
      subtotal,
      total,
      contact_name: name,
      contact_phone: phone,
      contact_email: user.email!,
      notes: notes || null,
    }).select("id").single();

    if (error || !order) { toast.error(error?.message ?? "Could not create order"); setBusy(false); return; }

    const { error: itemErr } = await supabase.from("order_items").insert(
      lines.map((l) => ({
        order_id: order.id,
        product_slug: l.slug,
        product_name: l.name,
        image: l.image,
        unit_price: l.unitPrice,
        quantity: l.quantity,
        selections: l.selections,
        selection_labels: l.selectionLabels,
      })),
    );
    if (itemErr) { toast.error(itemErr.message); setBusy(false); return; }

    clear();
    toast.success("Order placed. Payment integration coming soon.");
    nav({ to: "/account" });
  };

  if (lines.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <p className="font-serif-italic text-xl text-loam">Your bag is empty.</p>
        <Link to="/shop" className="mt-4 inline-block text-xs uppercase tracking-[0.22em] text-clay underline">Browse the shop</Link>
      </div>
    );
  }

  return (
    <div className="bg-cream">
      <div className="container-page py-12 md:py-16">
        <p className="text-[11px] uppercase tracking-[0.34em] text-clay">Checkout</p>
        <h1 className="mt-3 font-display text-4xl text-loam md:text-5xl">
          Almost there<span className="font-serif-italic text-clay">.</span>
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-12 md:gap-12">
          {/* Form */}
          <div className="space-y-10 md:col-span-7">
            {/* Fulfillment */}
            <Section title="01" heading="How would you like it?">
              <div className="grid gap-3 sm:grid-cols-2">
                <FulfillCard
                  active={fulfillment === "delivery"}
                  onClick={() => setFulfillment("delivery")}
                  icon={<Truck className="size-4" />}
                  label="Delivery"
                  hint="Hand-delivered, islandwide."
                />
                <FulfillCard
                  active={fulfillment === "pickup"}
                  onClick={() => setFulfillment("pickup")}
                  icon={<MapPin className="size-4" />}
                  label="Self-collection"
                  hint="Bishan St 12, S570111."
                />
              </div>
            </Section>

            {/* Address */}
            {fulfillment === "delivery" && (
              <Section title="02" heading="Where should we deliver?">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs uppercase tracking-[0.22em] text-clay">Address</Label>
                    <Textarea value={address} onChange={(e) => setAddress(e.target.value)} className="mt-2" placeholder="Block, street, unit…" rows={2} />
                  </div>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Label className="text-xs uppercase tracking-[0.22em] text-clay">Postal code</Label>
                      <Input value={postal} onChange={(e) => setPostal(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6 digits" className="mt-2" />
                    </div>
                    {address && postal.length === 6 && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=Singapore+${postal}`}
                        target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border hairline px-3 py-2 text-xs uppercase tracking-[0.22em] text-loam hover:bg-shell"
                      >
                        Verify on Maps <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Delivery from S570111 — fee estimated by distance.
                    {subtotal >= 180 && <span className="ml-1 text-clay">Complimentary on this order (over $180).</span>}
                  </p>
                </div>
              </Section>
            )}

            {/* Date + slot */}
            <Section title={fulfillment === "delivery" ? "03" : "02"} heading={fulfillment === "delivery" ? "When should we deliver?" : "When will you collect?"}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs uppercase tracking-[0.22em] text-clay">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={cn("mt-2 flex w-full items-center justify-between rounded-md border hairline bg-shell px-3 py-2.5 text-sm", !date && "text-muted-foreground")}>
                        {date ? format(date, "EEEE, d MMMM") : "Pick a date"}
                        <CalendarIcon className="size-4 text-clay" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(d) => {
                          const min = new Date();
                          min.setDate(min.getDate() + 2);
                          min.setHours(0, 0, 0, 0);
                          return d < min;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">2-day lead time.</p>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-[0.22em] text-clay">Time slot</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {TIME_SLOTS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSlot(s)}
                        className={cn("rounded-md border px-2 py-2 text-xs transition-all",
                          slot === s ? "border-loam bg-loam text-cream" : "border-ink/15 bg-shell text-ink/80 hover:border-clay/50")}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* Contact */}
            <Section title={fulfillment === "delivery" ? "04" : "03"} heading="Your details">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs uppercase tracking-[0.22em] text-clay">Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-[0.22em] text-clay">Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+65 …" className="mt-2" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs uppercase tracking-[0.22em] text-clay">Notes (optional)</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2" rows={2} placeholder="Card message, allergies, special requests…" />
                </div>
              </div>
            </Section>

            {/* Voucher */}
            <Section title={fulfillment === "delivery" ? "05" : "04"} heading="Voucher">
              <div className="flex items-center gap-2">
                <Input value={voucher} onChange={(e) => setVoucher(e.target.value)} placeholder="Discount code" className="flex-1" />
                <Button type="button" variant="outline" onClick={applyVoucher}>Apply</Button>
              </div>
              {voucherApplied && (
                <p className="mt-2 inline-flex items-center gap-2 text-xs text-clay">
                  <Check className="size-3" /> {voucherApplied.code} · −{formatSGD(voucherApplied.discount)}
                </p>
              )}
              <p className="mt-1.5 text-[11px] text-muted-foreground">Try BLOOM10 or PETIT5.</p>
            </Section>
          </div>

          {/* Summary */}
          <aside className="md:col-span-5">
            <div className="md:sticky md:top-28 rounded-2xl border hairline bg-shell p-6 md:p-8">
              <p className="text-[11px] uppercase tracking-[0.28em] text-clay">Order summary</p>
              <ul className="mt-5 space-y-4 border-b hairline pb-5">
                {lines.map((l) => (
                  <li key={l.id} className="flex gap-3">
                    <img src={l.image} alt={l.name} className="h-16 w-14 flex-none rounded-md object-cover" />
                    <div className="flex-1">
                      <p className="font-display text-sm text-loam">{l.name}</p>
                      {Object.values(l.selectionLabels).length > 0 && (
                        <p className="text-[11px] text-muted-foreground">{Object.values(l.selectionLabels).join(" · ")}</p>
                      )}
                      <p className="text-[11px] text-ink/70">× {l.quantity}</p>
                    </div>
                    <p className="text-xs tabular-nums text-ink/80">{formatSGD(l.unitPrice * l.quantity)}</p>
                  </li>
                ))}
              </ul>
              <dl className="mt-5 space-y-2 text-sm">
                <Row k="Subtotal" v={formatSGD(subtotal)} />
                <Row k={fulfillment === "delivery" ? "Delivery" : "Self-collection"} v={deliveryFee === 0 ? "Free" : formatSGD(deliveryFee)} />
                {discount > 0 && <Row k={`Voucher · ${voucherApplied!.code}`} v={`−${formatSGD(discount)}`} accent />}
              </dl>
              <div className="my-5 divider-rule" />
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-[0.28em] text-clay">Total</span>
                <span className="font-display text-2xl text-loam tabular-nums">{formatSGD(total)}</span>
              </div>
              <Button
                className="mt-6 w-full bg-loam text-cream hover:bg-ink"
                size="lg"
                disabled={!valid || busy}
                onClick={placeOrder}
              >
                {busy ? "Placing order…" : "Proceed to payment"}
              </Button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Payment integration coming soon — your order will be saved.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Section({ title, heading, children }: { title: string; heading: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-clay tabular-nums">{title}</span>
        <h2 className="font-display text-xl text-loam md:text-2xl">{heading}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FulfillCard({ active, onClick, icon, label, hint }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; hint: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
        active ? "border-loam bg-loam text-cream shadow-[var(--shadow-soft)]" : "border-ink/15 bg-shell text-ink/80 hover:border-clay/60")}
    >
      <span className={cn("inline-flex size-8 items-center justify-center rounded-full", active ? "bg-cream/15 text-cream" : "bg-clay/10 text-clay")}>{icon}</span>
      <span className={cn("font-display text-base", active ? "text-cream" : "text-loam")}>{label}</span>
      <span className={cn("text-[11px]", active ? "text-cream/75" : "text-muted-foreground")}>{hint}</span>
      {active && <Check className="absolute right-3 top-3 size-4 text-cream" />}
    </button>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={cn("tabular-nums", accent ? "text-clay" : "text-ink/85")}>{v}</dd>
    </div>
  );
}
