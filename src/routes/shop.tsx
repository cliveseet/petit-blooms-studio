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

export const Route = createFileRoute("/shop")({
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
  const navigate = useNavigate({ from: "/shop" });

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
    <div>
      {/* Banner */}
      <section className="bg-cream">
        <div className="container-page grid gap-6 py-20 text-center md:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-clay">The shop</p>
          <h1 className="font-display text-5xl text-forest-deep md:text-6xl">
            With love, petit blooms.
          </h1>
          <p className="mx-auto max-w-xl text-ink/75">
            Choose a piece — then make it yours. Sizes, colours and
            requests are set on the next page.
          </p>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="container-page grid gap-12 pb-24 md:grid-cols-12 md:gap-10">
        <aside className="md:col-span-3">
          <div className="md:sticky md:top-28">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Category
            </p>
            <ul className="mt-3 space-y-1.5">
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() =>
                      navigate({ search: (prev: z.infer<typeof searchSchema>) => ({ ...prev, category: c.id }) })
                    }
                    className={cn(
                      "text-sm text-ink/70 hover:text-forest-deep",
                      category === c.id && "text-forest-deep underline underline-offset-4"
                    )}
                  >
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Occasion
            </p>
            <ul className="mt-3 space-y-1.5">
              {occasions.map((o) => (
                <li key={o.id}>
                  <button
                    onClick={() =>
                      navigate({ search: (prev: z.infer<typeof searchSchema>) => ({ ...prev, occasion: o.id }) })
                    }
                    className={cn(
                      "text-sm text-ink/70 hover:text-forest-deep",
                      occasion === o.id && "text-forest-deep underline underline-offset-4"
                    )}
                  >
                    {o.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="md:col-span-9">
          {filtered.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">
              No pieces match these filters.
            </p>
          ) : (
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <Link
                  key={p.slug}
                  to="/shop/$slug"
                  params={{ slug: p.slug }}
                  className="group block"
                >
                  <div className="overflow-hidden rounded-2xl bg-secondary">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg leading-snug text-forest-deep">
                        {p.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {categoryLabels[p.category]}
                      </p>
                    </div>
                    <p className="text-sm tabular-nums text-ink/80">
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
