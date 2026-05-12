import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import {
  products,
  categoryLabels,
  occasionLabels,
  type Category,
  type Occasion,
} from "@/lib/products";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  category: z.enum(["all", "fresh", "preserved", "accessories"]).catch("all"),
  occasion: z
    .enum(["all", "celebration", "anniversary", "birthday", "get-well", "wedding"])
    .catch("all"),
});

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Shop — petit blooms" },
      {
        name: "description",
        content:
          "Browse our hand-tied fresh bouquets, preserved arrangements and accessories. Build-to-order in Singapore.",
      },
      { property: "og:title", content: "Shop — petit blooms" },
      {
        property: "og:description",
        content: "With love, petit blooms — fresh and preserved bouquets.",
      },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: ShopPage,
});

function ShopPage() {
  const { category, occasion } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop/" });

  const filtered = products.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    if (occasion !== "all" && !p.occasions.includes(occasion as Occasion))
      return false;
    return true;
  });

  const categories: Array<{ id: "all" | Category; label: string }> = [
    { id: "all", label: "All" },
    { id: "fresh", label: categoryLabels.fresh },
    { id: "preserved", label: categoryLabels.preserved },
    { id: "accessories", label: categoryLabels.accessories },
  ];

  const occasions: Array<{ id: "all" | Occasion; label: string }> = [
    { id: "all", label: "Any occasion" },
    { id: "celebration", label: occasionLabels.celebration },
    { id: "anniversary", label: occasionLabels.anniversary },
    { id: "birthday", label: occasionLabels.birthday },
    { id: "get-well", label: occasionLabels["get-well"] },
    { id: "wedding", label: occasionLabels.wedding },
  ];

  return (
    <div className="bg-cream">
      {/* Banner */}
      <section className="container-page py-20 text-center md:py-28">
        <p className="text-[11px] uppercase tracking-[0.34em] text-clay">The shop</p>
        <h1 className="mt-5 font-display text-5xl leading-[1.02] text-loam md:text-7xl">
          With love,
          <span className="font-serif-italic text-clay"> petit blooms.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-ink/75">
          Choose a piece — then make it yours. Sizes, colours and
          requests are set on the next page.
        </p>
      </section>

      <div className="container-page"><div className="divider-rule" /></div>

      {/* Filters + grid */}
      <section className="container-page grid gap-12 py-16 md:grid-cols-12 md:gap-12 md:pb-28">
        <aside className="md:col-span-3">
          <div className="md:sticky md:top-28 space-y-10">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-clay">
                Category
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((c) => {
                  const active = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() =>
                        navigate({ search: (prev: z.infer<typeof searchSchema>) => ({ ...prev, category: c.id }) })
                      }
                      className={cn(
                        "rounded-md border px-3.5 py-2 text-xs uppercase tracking-[0.18em] transition-all",
                        active
                          ? "border-loam bg-loam text-cream"
                          : "border-ink/15 bg-shell text-ink/70 hover:border-clay/50 hover:text-loam"
                      )}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-clay">
                Occasion
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {occasions.map((o) => {
                  const active = occasion === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() =>
                        navigate({ search: (prev: z.infer<typeof searchSchema>) => ({ ...prev, occasion: o.id }) })
                      }
                      className={cn(
                        "rounded-md border px-3.5 py-2 text-xs uppercase tracking-[0.18em] transition-all",
                        active
                          ? "border-loam bg-loam text-cream"
                          : "border-ink/15 bg-shell text-ink/70 hover:border-clay/50 hover:text-loam"
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "piece" : "pieces"} ·
              <span className="ml-1 text-clay">curated weekly</span>
            </p>
          </div>
        </aside>

        <div className="md:col-span-9">
          {filtered.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">
              No pieces match these filters.
            </p>
          ) : (
            <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p, i) => (
                <Link
                  key={p.slug}
                  to="/shop/$slug"
                  params={{ slug: p.slug }}
                  className="group block focus:outline-none"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-shell">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-cream/85 px-2.5 py-1 font-display text-[10px] tracking-[0.28em] text-loam backdrop-blur">
                      N° {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="absolute inset-x-3 bottom-3 rounded-md bg-loam/90 py-2.5 text-center text-[10px] font-medium uppercase tracking-[0.28em] text-cream opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                      View &amp; order
                    </span>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg leading-snug text-loam transition-colors group-hover:text-clay">
                        {p.name}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        {categoryLabels[p.category]}
                      </p>
                    </div>
                    <p className="font-display text-sm tabular-nums text-ink/80">
                      {p.fromPrice ? "from " : ""}SGD {p.basePrice.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
