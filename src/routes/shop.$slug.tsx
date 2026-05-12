import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  computePrice,
  productBySlug,
  products,
  type Product,
  categoryLabels,
} from "@/lib/products";
import { useCart, formatSGD } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus, ChevronRight } from "lucide-react";
import { toast } from "sonner";

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
      <h1 className="font-display text-3xl text-forest-deep">Bouquet not found</h1>
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

function Pdp({ product }: { product: Product }) {
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const g of product.options) {
      if (g.required && g.choices[0]) initial[g.id] = g.choices[0].value;
    }
    return initial;
  });
  const [qty, setQty] = useState(1);
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
    });
    toast.success(`${product.name} added to your bag.`);
  };

  return (
    <div className="bg-cream">
      <div className="container-page py-10 md:py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/shop" className="hover:text-forest-deep">Shop</Link>
          <ChevronRight className="size-3" />
          <span className="text-forest-deep">{product.name}</span>
        </nav>

        <div className="mt-8 grid gap-12 md:grid-cols-2 md:gap-16">
          {/* Gallery */}
          <div className="overflow-hidden rounded-3xl bg-secondary">
            <img
              src={product.image}
              alt={product.name}
              className="w-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="md:sticky md:top-28 md:self-start">
            <p className="text-xs uppercase tracking-[0.25em] text-clay">
              {categoryLabels[product.category]}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-forest-deep md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-2xl text-forest-deep tabular-nums">
              {product.fromPrice && product.options.length === 0 ? "from " : ""}
              {formatSGD(price)}
            </p>
            <p className="mt-6 text-sm leading-relaxed text-ink/80">
              {product.description}
            </p>

            {/* Options */}
            {product.options.length > 0 && (
              <div className="mt-8 space-y-5">
                {product.options.map((g) => (
                  <div key={g.id}>
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {g.label}{g.required && " *"}
                    </label>
                    <Select
                      value={selections[g.id]}
                      onValueChange={(v) =>
                        setSelections((prev) => ({ ...prev, [g.id]: v }))
                      }
                    >
                      <SelectTrigger className="mt-2 h-12 rounded-full border-forest/25 bg-cream">
                        <SelectValue placeholder={`Select ${g.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {g.choices.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                            {typeof c.priceDelta === "number" && c.priceDelta !== 0
                              ? ` (+SGD ${c.priceDelta.toFixed(2)})`
                              : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            {/* Qty + add */}
            <div className="mt-8 flex items-center gap-3">
              <div className="inline-flex h-12 items-center rounded-full border border-forest/25">
                <button
                  className="px-4"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center tabular-nums">{qty}</span>
                <button
                  className="px-4"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <Button
                size="lg"
                className="h-12 flex-1 rounded-full bg-forest text-cream hover:bg-forest-deep"
                onClick={handleAdd}
              >
                Add to bag — {formatSGD(price * qty)}
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Made fresh, to order. Please order at least 2 days before
              delivery or collection. For urgent requests, message
              @petit.blooms on Instagram.
            </p>

            {/* Add-ons */}
            {addOnProducts.length > 0 && (
              <div className="mt-10 border-t border-forest/10 pt-8">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Pair it with
                </p>
                <div className="mt-4 grid gap-3">
                  {addOnProducts.map((a) => (
                    <Link
                      key={a.slug}
                      to="/shop/$slug"
                      params={{ slug: a.slug }}
                      className="group flex items-center gap-4 rounded-2xl border border-forest/15 p-3 transition-colors hover:border-forest/40"
                    >
                      <img
                        src={a.image}
                        alt={a.name}
                        className="h-16 w-16 flex-none rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-display text-base text-forest-deep">{a.name}</p>
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
