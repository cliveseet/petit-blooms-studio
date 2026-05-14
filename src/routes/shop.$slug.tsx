import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  computePrice,
  productBySlug,
  type Product,
  type OptionGroup,
  type OptionChoice,
  categoryLabels,
} from "@/lib/products";
import { useMenuProducts } from "@/hooks/use-menu-products";
import { choiceSwatch, isColourGroup, isSizeOrCountGroup } from "@/lib/menu";
import { useCart, formatSGD } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop/$slug")({
  loader: ({ params }) => {
    return { slug: params.slug, product: productBySlug(params.slug) };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "petit blooms" }] };
    return {
      meta: [
        { title: `${p.name} — petit blooms` },
        { name: "description", content: p.shortDescription },
        { property: "og:title", content: `${p.name} — petit blooms` },
        { property: "og:description", content: p.shortDescription },
        { property: "og:image", content: p.image },
        { property: "og:type", content: "product" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl text-loam">Bouquet not found</h1>
      <Link to="/shop" className="mt-4 inline-block text-sm underline">
        Back to shop
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container-page py-24 text-center text-sm text-muted-foreground">
      {error.message}
    </div>
  ),
  component: PdpPage,
});

function PdpPage() {
  const { slug, product: staticProduct } = Route.useLoaderData();
  const { products, loading } = useMenuProducts();
  const product = products.find((candidate) => candidate.slug === slug) ?? staticProduct;

  if (!product && loading) {
    return (
      <div className="container-page py-24 text-center text-sm text-muted-foreground">
        Loading bouquet…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-3xl text-loam">Bouquet not found</h1>
        <Link to="/shop" className="mt-4 inline-block text-sm underline">
          Back to shop
        </Link>
      </div>
    );
  }

  return <Pdp product={product} />;
}

function Pdp({ product }: { product: Product }) {
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const g of product.options) {
      if (g.required && g.choices[0]) initial[g.id] = g.choices[0].value;
    }
    return initial;
  });
  const [qty, setQty] = useState(1);
  const [personalMessage, setPersonalMessage] = useState("");
  const { add } = useCart();

  const price = useMemo(() => computePrice(product, selections), [product, selections]);

  const { products: menuProducts } = useMenuProducts();
  const addOnProducts = (product.addOns ?? [])
    .map((s) => menuProducts.find((p) => p.slug === s))
    .filter(Boolean) as Product[];

  const allRequiredFilled = product.options.every((g) => !g.required || !!selections[g.id]);

  const handleAdd = () => {
    if (!allRequiredFilled) {
      toast.error("Please complete the required options.");
      return;
    }
    const labels: Record<string, string> = {};
    for (const g of product.options) {
      const val = selections[g.id];
      if (!val) continue;
      const choice = g.choices.find((c) => c.value === val);
      if (choice) labels[g.id] = `${g.label}: ${choice.label}`;
    }
    add({
      slug: product.slug,
      name: product.name,
      image: product.image,
      unitPrice: price,
      quantity: qty,
      selections,
      selectionLabels: labels,
      personalMessage: personalMessage.trim() || "NIL",
    });
    toast.success(`${product.name} added to your bag.`);
  };

  const setOpt = (id: string, value: string) => setSelections((p) => ({ ...p, [id]: value }));

  return (
    <div className="bg-cream">
      <div className="container-page py-10 md:py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/shop" className="hover:text-loam">
            Shop
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-loam">{product.name}</span>
        </nav>

        <div className="mt-8 grid gap-12 md:grid-cols-12 md:gap-16">
          {/* Gallery */}
          <div className="md:col-span-7">
            <div className="overflow-hidden rounded-[2rem] bg-shell">
              <img
                src={product.image}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-5 md:sticky md:top-28 md:self-start">
            <p className="text-[11px] uppercase tracking-[0.32em] text-clay">
              {categoryLabels[product.category]}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-[1.05] text-loam md:text-5xl">
              {product.name}
            </h1>
            <div className="mt-5 flex items-baseline gap-3">
              <p className="font-display text-3xl text-loam tabular-nums">{formatSGD(price)}</p>
              <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {qty > 1 ? `× ${qty} = ${formatSGD(price * qty)}` : "incl. wrap"}
              </span>
            </div>

            <div className="my-7 divider-rule" />

            <p className="font-serif-italic text-lg leading-relaxed text-ink/80">
              {product.shortDescription}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink/75">{product.description}</p>

            {/* Options */}
            {product.options.length > 0 && (
              <div className="mt-8 space-y-7">
                {product.options.map((g) => (
                  <OptionGroupControl
                    key={g.id}
                    group={g}
                    value={selections[g.id]}
                    onChange={(v) => setOpt(g.id, v)}
                  />
                ))}
              </div>
            )}

            <div className="mt-8">
              <Label
                htmlFor="personal-message"
                className="text-[11px] font-medium uppercase tracking-[0.28em] text-loam"
              >
                Personal message
              </Label>
              <Textarea
                id="personal-message"
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                className="mt-3 bg-shell"
                rows={3}
                maxLength={240}
                placeholder="A note for your recipient — leave blank if not required."
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {product.defaultPersonalisationPrompt ||
                  "Denise will handwrite this on a small note card."}
              </p>
            </div>

            {/* Qty + add */}
            <div className="mt-7 flex items-stretch gap-3">
              <div className="inline-flex items-center rounded-md border hairline bg-shell">
                <button
                  className="px-4 py-3 text-ink/70 hover:text-loam"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
                <button
                  className="px-4 py-3 text-ink/70 hover:text-loam"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <Button
                size="lg"
                className="h-auto flex-1 rounded-md bg-loam px-6 py-3 text-sm uppercase tracking-[0.2em] text-cream hover:bg-ink"
                onClick={handleAdd}
              >
                Add to bag · {formatSGD(price * qty)}
              </Button>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Made fresh, to order. Please order at least 2 days before delivery or collection. For
              urgent requests, message
              <a
                href="https://www.instagram.com/petit.blooms"
                className="ml-1 underline underline-offset-2 hover:text-loam"
                target="_blank"
                rel="noreferrer"
              >
                @petit.blooms
              </a>{" "}
              on Instagram.
            </p>

            {/* Add-ons */}
            {addOnProducts.length > 0 && (
              <div className="mt-10 border-t hairline pt-8">
                <p className="text-[11px] uppercase tracking-[0.28em] text-clay">Pair it with</p>
                <div className="mt-4 grid gap-3">
                  {addOnProducts.map((a) => (
                    <Link
                      key={a.slug}
                      to="/shop/$slug"
                      params={{ slug: a.slug }}
                      className="group flex items-center gap-4 rounded-xl border hairline bg-shell p-3 transition-all hover:-translate-y-0.5 hover:border-clay/50"
                    >
                      <img
                        src={a.image}
                        alt={a.name}
                        className="h-16 w-16 flex-none rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-display text-base text-loam">{a.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {a.shortDescription}
                        </p>
                      </div>
                      <span className="text-sm text-ink/80 tabular-nums">
                        {a.fromPrice ? "from " : ""}SGD {a.basePrice.toFixed(2)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Option controls -------------------- */

function OptionGroupControl({
  group,
  value,
  onChange,
}: {
  group: OptionGroup;
  value?: string;
  onChange: (v: string) => void;
}) {
  const header = (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-loam">
        {group.label}
        {group.required && <span className="ml-1 text-clay">*</span>}
      </p>
    </div>
  );

  // Booking type / payment-style → card grid
  if (group.id === "booking") {
    return (
      <div>
        {header}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {group.choices.map((c) => (
            <BookingCard
              key={c.value}
              choice={c}
              active={value === c.value}
              onClick={() => onChange(c.value)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Sizes / stalk counts → segmented bar
  if (isSizeOrCountGroup(group)) {
    return (
      <div>
        {header}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {group.choices.map((c) => (
            <SegmentChip
              key={c.value}
              active={value === c.value}
              onClick={() => onChange(c.value)}
              label={c.label}
              hint={
                typeof c.setsPriceTo === "number"
                  ? formatSGD(c.setsPriceTo)
                  : typeof c.priceDelta === "number" && c.priceDelta !== 0
                    ? `+${formatSGD(c.priceDelta)}`
                    : undefined
              }
            />
          ))}
        </div>
      </div>
    );
  }

  // Colour / scheme → swatch pills
  if (isColourGroup(group)) {
    return (
      <div>
        {header}
        <div className="mt-3 flex flex-wrap gap-2">
          {group.choices.map((c) => (
            <SwatchPill
              key={c.value}
              choice={c}
              active={value === c.value}
              onClick={() => onChange(c.value)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Default → tidy text pills
  return (
    <div>
      {header}
      <div className="mt-3 flex flex-wrap gap-2">
        {group.choices.map((c) => {
          const active = value === c.value;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => onChange(c.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30",
                active
                  ? "border-loam bg-loam text-cream"
                  : "border-ink/15 bg-shell text-ink/80 hover:border-clay/50 hover:text-loam",
              )}
            >
              {c.label}
              {typeof c.priceDelta === "number" && c.priceDelta !== 0 && (
                <span className={cn("text-xs", active ? "text-cream/75" : "text-muted-foreground")}>
                  +{formatSGD(c.priceDelta)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BookingCard({
  choice,
  active,
  onClick,
}: {
  choice: OptionChoice;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30",
        active
          ? "border-loam bg-loam text-cream shadow-[var(--shadow-soft)]"
          : "border-ink/15 bg-shell text-ink/80 hover:-translate-y-0.5 hover:border-clay/60 hover:text-loam",
      )}
    >
      <span
        className={cn(
          "absolute right-3 top-3 inline-flex size-5 items-center justify-center rounded-full border",
          active ? "border-cream/70 bg-cream/10" : "border-ink/20",
        )}
      >
        {active && <Check className="size-3" />}
      </span>
      <span
        className={cn(
          "text-[10px] uppercase tracking-[0.28em]",
          active ? "text-cream/70" : "text-clay",
        )}
      >
        {choice.value === "deposit" ? "Reserve" : "Pay in full"}
      </span>
      <span
        className={cn("font-display text-lg leading-tight", active ? "text-cream" : "text-loam")}
      >
        {choice.label.split(" (")[0]}
      </span>
      {typeof choice.setsPriceTo === "number" && (
        <span
          className={cn("font-display text-xl tabular-nums", active ? "text-cream" : "text-loam")}
        >
          {formatSGD(choice.setsPriceTo)}
        </span>
      )}
      <span
        className={cn("text-xs leading-snug", active ? "text-cream/75" : "text-muted-foreground")}
      >
        {choice.label.includes("(") ? choice.label.slice(choice.label.indexOf("(") + 1, -1) : ""}
      </span>
    </button>
  );
}

function SegmentChip({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-md border px-3 py-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30",
        active
          ? "border-loam bg-loam text-cream"
          : "border-ink/15 bg-shell text-ink/80 hover:border-clay/50 hover:text-loam",
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      {hint && (
        <span
          className={cn(
            "text-[11px] tabular-nums",
            active ? "text-cream/75" : "text-muted-foreground",
          )}
        >
          {hint}
        </span>
      )}
    </button>
  );
}

function SwatchPill({
  choice,
  active,
  onClick,
}: {
  choice: OptionChoice;
  active: boolean;
  onClick: () => void;
}) {
  const swatch = choiceSwatch(choice);
  const style = swatch
    ? swatch.startsWith("linear-gradient")
      ? { backgroundImage: swatch }
      : { backgroundColor: swatch }
    : { backgroundColor: "var(--shell)" };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30",
        active
          ? "border-loam bg-loam text-cream"
          : "border-ink/15 bg-shell text-ink/80 hover:border-clay/50 hover:text-loam",
      )}
    >
      <span
        className={cn(
          "inline-block size-6 rounded-full border",
          active ? "border-cream/40" : "border-ink/15",
        )}
        style={style}
      />
      <span>{choice.label}</span>
    </button>
  );
}
