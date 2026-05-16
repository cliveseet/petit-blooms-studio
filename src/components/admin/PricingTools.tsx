import { useEffect, useState, type ReactNode } from "react";
import { CalendarRange, Check, Loader2, Percent, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useMenuProducts } from "@/hooks/use-menu-products";
import type { DiscountCodeRow, PricingAdjustmentRow } from "@/lib/promotions";
import { cn } from "@/lib/utils";
import { sanitizeCode, sanitizeText } from "@/lib/sanitize";

type Scope = "all" | "products";
type ConfirmDelete = { type: "discount" | "pricing"; id: string } | null;

type DiscountDraft = {
  id?: string;
  code: string;
  label: string;
  percentOff: number;
  expiresAt: string;
  scope: Scope;
  productSlugs: string[];
  active: boolean;
};

type PricingDraft = {
  id?: string;
  label: string;
  percentChange: number;
  startsOn: string;
  endsOn: string;
  scope: Scope;
  productSlugs: string[];
  active: boolean;
};

const blankDiscount: DiscountDraft = {
  code: "",
  label: "",
  percentOff: 10,
  expiresAt: "",
  scope: "all",
  productSlugs: [],
  active: true,
};

const blankPricing: PricingDraft = {
  label: "",
  percentChange: 15,
  startsOn: "",
  endsOn: "",
  scope: "all",
  productSlugs: [],
  active: true,
};

function productNames(slugs: string[], products: Array<{ slug: string; name: string }>) {
  if (slugs.length === 0) return "All products";
  return slugs
    .map((slug) => products.find((product) => product.slug === slug)?.name ?? slug)
    .join(", ");
}

export function PricingTools() {
  const { products } = useMenuProducts(true, false);
  const [discounts, setDiscounts] = useState<DiscountCodeRow[]>([]);
  const [pricing, setPricing] = useState<PricingAdjustmentRow[]>([]);
  const [discountDraft, setDiscountDraft] = useState<DiscountDraft>(blankDiscount);
  const [pricingDraft, setPricingDraft] = useState<PricingDraft>(blankPricing);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"discount" | "pricing" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete>(null);
  const visibleProducts = products.filter((product) => !product.archived);

  const refresh = async () => {
    setLoading(true);
    const [discountResult, pricingResult] = await Promise.all([
      supabase.from("discount_codes").select("*").order("created_at", { ascending: false }),
      supabase.from("pricing_adjustments").select("*").order("created_at", { ascending: false }),
    ]);

    if (discountResult.error || pricingResult.error) {
      toast.error(
        discountResult.error?.message ??
          pricingResult.error?.message ??
          "Pricing tools could not be loaded.",
      );
    }

    setDiscounts((discountResult.data as DiscountCodeRow[]) ?? []);
    setPricing((pricingResult.data as PricingAdjustmentRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const saveDiscount = async () => {
    const code = sanitizeCode(discountDraft.code);
    const label = sanitizeText(discountDraft.label, 120);
    if (!code || !label) {
      toast.error("Add a code and a label first.");
      return;
    }
    if (discountDraft.percentOff <= 0 || discountDraft.percentOff > 100) {
      toast.error("Discount must be between 1% and 100%.");
      return;
    }
    if (discountDraft.scope === "products" && discountDraft.productSlugs.length === 0) {
      toast.error("Choose at least one product, or apply the code to all products.");
      return;
    }

    setSaving("discount");
    const payload = {
      code,
      label,
      percent_off: discountDraft.percentOff,
      expires_at: discountDraft.expiresAt || null,
      scope: discountDraft.scope,
      product_slugs: discountDraft.scope === "products" ? discountDraft.productSlugs : [],
      active: discountDraft.active,
    };
    const result = discountDraft.id
      ? await supabase.from("discount_codes").update(payload).eq("id", discountDraft.id)
      : await supabase.from("discount_codes").insert(payload);

    setSaving(null);
    if (result.error) {
      toast.error(result.error.message);
      return;
    }

    toast.success(discountDraft.id ? "Discount code updated." : "Discount code created.");
    setDiscountDraft(blankDiscount);
    await refresh();
  };

  const savePricing = async () => {
    const label = sanitizeText(pricingDraft.label, 120);
    if (!label) {
      toast.error("Add a pricing adjustment label first.");
      return;
    }
    if (pricingDraft.percentChange === 0) {
      toast.error("Use a percentage above or below zero.");
      return;
    }
    if (
      pricingDraft.startsOn &&
      pricingDraft.endsOn &&
      pricingDraft.endsOn < pricingDraft.startsOn
    ) {
      toast.error("End date must be after the start date.");
      return;
    }
    if (pricingDraft.scope === "products" && pricingDraft.productSlugs.length === 0) {
      toast.error("Choose at least one product, or apply the adjustment to all products.");
      return;
    }

    setSaving("pricing");
    const payload = {
      label,
      percent_change: pricingDraft.percentChange,
      starts_on: pricingDraft.startsOn || null,
      ends_on: pricingDraft.endsOn || null,
      scope: pricingDraft.scope,
      product_slugs: pricingDraft.scope === "products" ? pricingDraft.productSlugs : [],
      active: pricingDraft.active,
    };
    const result = pricingDraft.id
      ? await supabase.from("pricing_adjustments").update(payload).eq("id", pricingDraft.id)
      : await supabase.from("pricing_adjustments").insert(payload);

    setSaving(null);
    if (result.error) {
      toast.error(result.error.message);
      return;
    }

    toast.success(pricingDraft.id ? "Pricing adjustment updated." : "Pricing adjustment created.");
    setPricingDraft(blankPricing);
    await refresh();
  };

  const remove = async () => {
    if (!confirmDelete) return;
    const { error } =
      confirmDelete.type === "discount"
        ? await supabase.from("discount_codes").delete().eq("id", confirmDelete.id)
        : await supabase.from("pricing_adjustments").delete().eq("id", confirmDelete.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Removed.");
    setConfirmDelete(null);
    await refresh();
  };

  const toggleDiscount = async (row: DiscountCodeRow) => {
    const { error } = await supabase
      .from("discount_codes")
      .update({ active: !row.active })
      .eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
  };

  const togglePricing = async (row: PricingAdjustmentRow) => {
    const { error } = await supabase
      .from("pricing_adjustments")
      .update({ active: !row.active })
      .eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <ToolPanel
        eyebrow="Discount codes"
        title="Customer offers"
        description="Create checkout codes with a percentage discount and an optional expiry date."
        icon={<Percent className="size-4" />}
      >
        <div className="grid gap-4">
          <Field label="Code">
            <Input
              value={discountDraft.code}
              onChange={(event) =>
                setDiscountDraft((current) => ({
                  ...current,
                  code: sanitizeCode(event.target.value),
                }))
              }
              placeholder="Discount code"
            />
          </Field>
          <Field label="Label">
            <Input
              value={discountDraft.label}
              onChange={(event) =>
                setDiscountDraft((current) => ({ ...current, label: event.target.value }))
              }
              placeholder="Short internal label"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Percentage off">
              <Input
                type="number"
                min={1}
                max={100}
                step={1}
                value={discountDraft.percentOff}
                onChange={(event) =>
                  setDiscountDraft((current) => ({
                    ...current,
                    percentOff: Number(event.target.value),
                  }))
                }
              />
            </Field>
            <Field label="Expiry date">
              <Input
                type="date"
                value={discountDraft.expiresAt}
                onChange={(event) =>
                  setDiscountDraft((current) => ({ ...current, expiresAt: event.target.value }))
                }
              />
            </Field>
          </div>
          <ScopeFields
            scope={discountDraft.scope}
            productSlugs={discountDraft.productSlugs}
            products={visibleProducts}
            onScopeChange={(scope) => setDiscountDraft((current) => ({ ...current, scope }))}
            onProductToggle={(slug) =>
              setDiscountDraft((current) => ({
                ...current,
                productSlugs: toggleSlug(current.productSlugs, slug),
              }))
            }
          />
          <ActiveToggle
            checked={discountDraft.active}
            onChange={(active) => setDiscountDraft((current) => ({ ...current, active }))}
          />
          <div className="flex flex-wrap gap-3 border-t hairline pt-4">
            <Button type="button" onClick={saveDiscount} disabled={saving === "discount"}>
              {saving === "discount" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {discountDraft.id ? "Save code" : "Create code"}
            </Button>
            {discountDraft.id && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setDiscountDraft(blankDiscount)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        <RecordList
          loading={loading}
          empty="No discount codes yet."
          rows={discounts.map((row) => ({
            id: row.id,
            title: row.code,
            meta: `${row.label} · ${Number(row.percent_off)}% off`,
            detail:
              row.scope === "all"
                ? "All products"
                : productNames(row.product_slugs ?? [], visibleProducts),
            date: row.expires_at ? `Expires ${row.expires_at}` : "No expiry",
            active: row.active,
            onEdit: () =>
              setDiscountDraft({
                id: row.id,
                code: row.code,
                label: row.label,
                percentOff: Number(row.percent_off),
                expiresAt: row.expires_at ?? "",
                scope: row.scope as Scope,
                productSlugs: row.product_slugs ?? [],
                active: row.active,
              }),
            onToggle: () => void toggleDiscount(row),
            onRemove: () => setConfirmDelete({ type: "discount", id: row.id }),
          }))}
          confirmDelete={confirmDelete}
          confirmType="discount"
          onConfirmRemove={remove}
          onCancelRemove={() => setConfirmDelete(null)}
        />
      </ToolPanel>

      <ToolPanel
        eyebrow="Peak pricing"
        title="Date-based adjustments"
        description="Apply a temporary percentage increase or decrease for busy periods."
        icon={<CalendarRange className="size-4" />}
      >
        <div className="grid gap-4">
          <Field label="Adjustment label">
            <Input
              value={pricingDraft.label}
              onChange={(event) =>
                setPricingDraft((current) => ({ ...current, label: event.target.value }))
              }
              placeholder="Adjustment label"
            />
          </Field>
          <Field label="Price change (%)">
            <Input
              type="number"
              step={1}
              value={pricingDraft.percentChange}
              onChange={(event) =>
                setPricingDraft((current) => ({
                  ...current,
                  percentChange: Number(event.target.value),
                }))
              }
            />
            <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
              Use a positive number to increase prices, or a negative number to reduce them.
            </p>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date">
              <Input
                type="date"
                value={pricingDraft.startsOn}
                onChange={(event) =>
                  setPricingDraft((current) => ({ ...current, startsOn: event.target.value }))
                }
              />
            </Field>
            <Field label="End date">
              <Input
                type="date"
                value={pricingDraft.endsOn}
                onChange={(event) =>
                  setPricingDraft((current) => ({ ...current, endsOn: event.target.value }))
                }
              />
            </Field>
          </div>
          <ScopeFields
            scope={pricingDraft.scope}
            productSlugs={pricingDraft.productSlugs}
            products={visibleProducts}
            onScopeChange={(scope) => setPricingDraft((current) => ({ ...current, scope }))}
            onProductToggle={(slug) =>
              setPricingDraft((current) => ({
                ...current,
                productSlugs: toggleSlug(current.productSlugs, slug),
              }))
            }
          />
          <ActiveToggle
            checked={pricingDraft.active}
            onChange={(active) => setPricingDraft((current) => ({ ...current, active }))}
          />
          <div className="flex flex-wrap gap-3 border-t hairline pt-4">
            <Button type="button" onClick={savePricing} disabled={saving === "pricing"}>
              {saving === "pricing" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {pricingDraft.id ? "Save adjustment" : "Create adjustment"}
            </Button>
            {pricingDraft.id && (
              <Button type="button" variant="outline" onClick={() => setPricingDraft(blankPricing)}>
                Cancel
              </Button>
            )}
          </div>
        </div>

        <RecordList
          loading={loading}
          empty="No pricing adjustments yet."
          rows={pricing.map((row) => ({
            id: row.id,
            title: row.label,
            meta: `${Number(row.percent_change) > 0 ? "+" : ""}${Number(row.percent_change)}%`,
            detail:
              row.scope === "all"
                ? "All products"
                : productNames(row.product_slugs ?? [], visibleProducts),
            date:
              row.starts_on || row.ends_on
                ? `${row.starts_on ?? "No start"} — ${row.ends_on ?? "No end"}`
                : "No date range",
            active: row.active,
            onEdit: () =>
              setPricingDraft({
                id: row.id,
                label: row.label,
                percentChange: Number(row.percent_change),
                startsOn: row.starts_on ?? "",
                endsOn: row.ends_on ?? "",
                scope: row.scope as Scope,
                productSlugs: row.product_slugs ?? [],
                active: row.active,
              }),
            onToggle: () => void togglePricing(row),
            onRemove: () => setConfirmDelete({ type: "pricing", id: row.id }),
          }))}
          confirmDelete={confirmDelete}
          confirmType="pricing"
          onConfirmRemove={remove}
          onCancelRemove={() => setConfirmDelete(null)}
        />
      </ToolPanel>
    </div>
  );
}

function toggleSlug(slugs: string[], slug: string) {
  return slugs.includes(slug) ? slugs.filter((item) => item !== slug) : [...slugs, slug];
}

function ToolPanel({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border hairline bg-shell shadow-[var(--shadow-soft)]">
      <div className="border-b hairline px-5 py-5 md:px-6">
        <p className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-clay">
          {icon}
          {eyebrow}
        </p>
        <h2 className="mt-2 font-display text-2xl text-loam">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-ink/70">{description}</p>
      </div>
      <div className="space-y-8 p-5 md:p-6">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-clay">{label}</Label>
      {children}
    </div>
  );
}

function ScopeFields({
  scope,
  productSlugs,
  products,
  onScopeChange,
  onProductToggle,
}: {
  scope: Scope;
  productSlugs: string[];
  products: Array<{ slug: string; name: string }>;
  onScopeChange: (scope: Scope) => void;
  onProductToggle: (slug: string) => void;
}) {
  return (
    <Field label="Applies to">
      <Select value={scope} onValueChange={(value) => onScopeChange(value as Scope)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All products</SelectItem>
          <SelectItem value="products">Selected products</SelectItem>
        </SelectContent>
      </Select>
      {scope === "products" && (
        <div className="mt-3 flex max-h-56 flex-wrap gap-2 overflow-y-auto rounded-xl border hairline bg-shell p-3">
          {products.map((product) => {
            const active = productSlugs.includes(product.slug);
            return (
              <button
                key={product.slug}
                type="button"
                onClick={() => onProductToggle(product.slug)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30",
                  active
                    ? "border-loam bg-loam text-cream"
                    : "hairline bg-shell text-ink/75 hover:border-clay/50 hover:text-loam",
                )}
              >
                {active && <Check className="size-3.5" />}
                {product.name}
              </button>
            );
          })}
        </div>
      )}
    </Field>
  );
}

function ActiveToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl border hairline bg-shell px-4 py-3 text-left transition-colors hover:border-clay/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30"
    >
      <span>
        <span className="block text-xs uppercase tracking-[0.22em] text-clay">Status</span>
        <span className="mt-1 block text-sm text-ink/75">
          {checked ? "Active and available" : "Paused"}
        </span>
      </span>
      <span
        className={cn(
          "relative h-7 w-12 rounded-full border transition-colors",
          checked ? "border-loam bg-loam" : "hairline bg-shell",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-cream shadow-[var(--shadow-soft)] transition-transform",
            checked ? "translate-x-[1.45rem]" : "translate-x-1",
          )}
        />
      </span>
    </button>
  );
}

function RecordList({
  loading,
  empty,
  rows,
  confirmDelete,
  confirmType,
  onConfirmRemove,
  onCancelRemove,
}: {
  loading: boolean;
  empty: string;
  rows: Array<{
    id: string;
    title: string;
    meta: string;
    detail: string;
    date: string;
    active: boolean;
    onEdit: () => void;
    onToggle: () => void;
    onRemove: () => void;
  }>;
  confirmDelete: ConfirmDelete;
  confirmType: "discount" | "pricing";
  onConfirmRemove: () => void;
  onCancelRemove: () => void;
}) {
  return (
    <div className="border-t hairline pt-6">
      <p className="text-[10px] uppercase tracking-[0.28em] text-clay">Saved</p>
      <div className="mt-3 divide-y hairline overflow-hidden rounded-xl border hairline bg-shell">
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-clay" />
            Loading...
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-8 text-sm text-muted-foreground">{empty}</div>
        ) : (
          rows.map((row) => (
            <article key={row.id} className="px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-lg leading-tight text-loam">{row.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-clay">{row.meta}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/70">{row.detail}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{row.date}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em]",
                    row.active
                      ? "border-sage/50 bg-sage/20 text-loam"
                      : "border-ink/10 bg-muted text-muted-foreground",
                  )}
                >
                  {row.active ? "Active" : "Paused"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={row.onEdit}>
                  Edit
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={row.onToggle}>
                  {row.active ? "Pause" : "Activate"}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={row.onRemove}>
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </div>
              {confirmDelete?.type === confirmType && confirmDelete.id === row.id && (
                <div className="mt-4 rounded-xl border hairline bg-shell p-4">
                  <p className="font-display text-base text-loam">Remove this item?</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    This action cannot be undone.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button type="button" size="sm" onClick={onConfirmRemove}>
                      Confirm
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={onCancelRemove}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
