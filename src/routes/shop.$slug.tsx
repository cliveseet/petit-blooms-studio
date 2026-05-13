import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  computePrice,
  productBySlug,
  products,
  type Product,
  type OptionGroup,
  type OptionChoice,
  categoryLabels,
} from "@/lib/products";
import { useCart, formatSGD } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop/$slug")({
  loader: ({ params }) => {
    const product = productBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
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
  const { product } = Route.useLoaderData();
  return <Pdp product={product} />;
}

// Map common colour values to actual swatch representations.
// Multi-tone schemes use multi-stop gradients for accuracy.
const colourSwatch: Record<string, string> = {
  pink: "#f5c6cf",
  red: "#a8323a",
  white: "#f4ede1",
  cappuccino: "#bfa085",
  "dark-blue": "#28406b",
  "mixed-blues": "linear-gradient(135deg,#28406b 0%,#4866a0 50%,#9fb6dc 100%)",
  "mixed-pinks": "linear-gradient(135deg,#a8323a 0%,#e6a4b1 50%,#f5d3da 100%)",
  pastels: "linear-gradient(135deg,#f5d3da 0%,#f5e6c8 33%,#cdd9ec 66%,#e7dcd0 100%)",
  // "Rich tones" — deep reds, plums, burgundies, violets
  dark: "linear-gradient(135deg,#5a1a26 0%,#7a2a3e 33%,#5a2b6e 66%,#2a1a4f 100%)",
  rich: "linear-gradient(135deg,#5a1a26 0%,#a8323a 33%,#6a2a5e 66%,#3a1a4f 100%)",
  emerald: "#2f5a45",
  purple: "#6a4f88",
  green: "#6e8266",
  khaki: "#a89a72",
  blue: "#4f6f96",
  // "Silver white" — pale silvers and ivories
  "silver-white": "linear-gradient(135deg,#e0e0d8 0%,#f5ede0 50%,#cfcfc8 100%)",
  black: "#1c1a17",
  // Newspaper — kraft / sepia / cream tones
  newspaper: "linear-gradient(135deg,#bfb8a6 0%,#e8e2d3 50%,#9a8c70 100%)",
  brown: "#7a5640",
  "white-grad": "#f4ede1",
  "brown-grad": "linear-gradient(135deg,#f4ede1 0%,#bfa085 50%,#7a5640 100%)",
  // Soft whispers — pastel pinks + blush + cream
  soft: "linear-gradient(135deg,#f5d3da 0%,#f8e0d4 50%,#f4ede1 100%)",
  whispers: "linear-gradient(135deg,#f5d3da 0%,#f8e0d4 50%,#f4ede1 100%)",
  // Timeless classics — red + white + ivory
  classics: "linear-gradient(135deg,#a8323a 0%,#d49b9f 50%,#f4ede1 100%)",
  helios: "linear-gradient(135deg,#e6b94f 0%,#d49b9f 100%)",
};

function isColourGroup(g: OptionGroup) {
  return /colour|color|scheme/i.test(g.label) || g.id === "colour" || g.id === "scheme";
}

function isSizeOrCountGroup(g: OptionGroup) {
  return /size|stalk/i.test(g.label) || g.id === "size" || g.id === "stalks";
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

  const addOnProducts = (product.addOns ?? [])
    .map((s) => products.find((p) => p.slug === s))
    .filter(Boolean) as Product[];

  const allRequiredFilled = product.options.every(
    (g) => !g.required || !!selections[g.id]
  );

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

  const setOpt = (id: string, value: string) =>
    setSelections((p) => ({ ...p, [id]: value }));

  return (
    <div className="bg-cream">
      <div className="container-page py-10 md:py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/shop" className="hover:text-loam">Shop</Link>
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
              <p className="font-display text-3xl text-loam tabular-nums">
                {formatSGD(price)}
              </p>
              <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {qty > 1 ? `× ${qty} = ${formatSGD(price * qty)}` : "incl. wrap"}
              </span>
            </div>

            <div className="my-7 divider-rule" />

            <p className="font-serif-italic text-lg leading-relaxed text-ink/80">
              {product.shortDescription}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink/75">
              {product.description}
            </p>

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
                Personal message for handwritten note
              </Label>
              <Textarea
                id="personal-message"
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                className="mt-3 bg-shell"
                rows={3}
                maxLength={240}
                placeholder="Write your note here, or leave blank for NIL."
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Leave blank if no handwritten note is needed.
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
              Made fresh, to order. Please order at least 2 days before
              delivery or collection. For urgent requests, message
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
                <p className="text-[11px] uppercase tracking-[0.28em] text-clay">
                  Pair it with
                </p>
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
                "inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-sm transition-all",
                active
                  ? "border-loam bg-loam text-cream"
                  : "border-ink/15 bg-shell text-ink/80 hover:border-clay/50 hover:text-loam"
              )}
            >
              {c.label}
              {typeof c.priceDelta === "number" && c.priceDelta !== 0 && (
                <span className="text-xs text-muted-foreground">
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
        "group relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
        active
          ? "border-loam bg-loam text-cream shadow-[var(--shadow-soft)]"
          : "border-ink/15 bg-shell text-ink/80 hover:-translate-y-0.5 hover:border-clay/60 hover:text-loam"
      )}
    >
      <span
        className={cn(
          "absolute right-3 top-3 inline-flex size-5 items-center justify-center rounded-full border",
          active ? "border-cream/70 bg-cream/10" : "border-ink/20"
        )}
      >
        {active && <Check className="size-3" />}
      </span>
      <span
        className={cn(
          "text-[10px] uppercase tracking-[0.28em]",
          active ? "text-cream/70" : "text-clay"
        )}
      >
        {choice.value === "deposit" ? "Reserve" : "Pay in full"}
      </span>
      <span
        className={cn(
          "font-display text-lg leading-tight",
          active ? "text-cream" : "text-loam"
        )}
      >
        {choice.label.split(" (")[0]}
      </span>
      {typeof choice.setsPriceTo === "number" && (
        <span
          className={cn(
            "font-display text-xl tabular-nums",
            active ? "text-cream" : "text-loam"
          )}
        >
          {formatSGD(choice.setsPriceTo)}
        </span>
      )}
      <span
        className={cn(
          "text-xs leading-snug",
          active ? "text-cream/75" : "text-muted-foreground"
        )}
      >
        {choice.label.includes("(")
          ? choice.label.slice(choice.label.indexOf("(") + 1, -1)
          : ""}
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
        "flex flex-col items-center gap-0.5 rounded-md border px-3 py-2.5 transition-all",
        active
          ? "border-loam bg-loam text-cream"
          : "border-ink/15 bg-shell text-ink/80 hover:border-clay/50 hover:text-loam"
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      {hint && (
        <span
          className={cn(
            "text-[11px] tabular-nums",
            active ? "text-cream/75" : "text-muted-foreground"
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
  const swatch = colourSwatch[choice.value];
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
        "inline-flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-sm transition-all",
        active
          ? "border-loam bg-loam text-cream"
          : "border-ink/15 bg-shell text-ink/80 hover:border-clay/50 hover:text-loam"
      )}
    >
      <span
        className={cn(
          "inline-block size-6 rounded-full border",
          active ? "border-cream/40" : "border-ink/15"
        )}
        style={style}
      />
      <span>{choice.label}</span>
    </button>
  );
}
