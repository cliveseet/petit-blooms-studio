import { createFileRoute, Link } from "@tanstack/react-router";
import heroBouquet from "@/assets/hero-bouquet.jpg";
import servicesWedding from "@/assets/services-wedding.jpg";
import { products } from "@/lib/products";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "petit blooms — Build-to-order florals in Singapore" },
      {
        name: "description",
        content:
          "Hand-tied bouquets and wedding florals from a WSQ-trained florist. Made to order, delivered across Singapore.",
      },
      { property: "og:title", content: "petit blooms" },
      {
        property: "og:description",
        content: "Where flowers speak the language of love.",
      },
      { property: "og:image", content: heroBouquet },
    ],
  }),
  component: HomePage,
});

const portfolio = [
  "the-petit-signature",
  "petals-and-promises",
  "timeless-love",
  "helios-bloom",
  "petal-symphony",
  "springs-whisper",
];

function HomePage() {
  const featured = portfolio
    .map((s) => products.find((p) => p.slug === s)!)
    .filter(Boolean);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-forest text-cream">
        <div className="container-page grid min-h-[88vh] grid-cols-1 items-center gap-12 py-16 md:grid-cols-12 md:py-24">
          <div className="md:col-span-5 reveal">
            <p className="text-xs uppercase tracking-[0.3em] text-cream/60">
              Singapore · Build-to-order
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] text-cream md:text-7xl">
              Where flowers speak the language of love.
            </h1>
            <p className="mt-6 max-w-md text-cream/75">
              Every bouquet is co-created — your story, your palette, shaped by
              a WSQ-trained florist's hand. No two are alike.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-cream px-7 py-3.5 text-sm text-forest-deep transition-transform hover:-translate-y-0.5"
              >
                Shop bouquets <ArrowUpRight className="size-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm text-cream/85 underline underline-offset-4 hover:text-cream"
              >
                Our story
              </Link>
            </div>
          </div>
          <div className="relative md:col-span-7">
            <div className="absolute -left-6 -top-6 hidden h-full w-full rounded-[2rem] border border-cream/15 md:block" />
            <img
              src={heroBouquet}
              alt="Hand-tied bouquet of garden roses, ranunculus and eucalyptus"
              className="relative h-[60vh] w-full rounded-[2rem] object-cover shadow-2xl md:h-[78vh]"
              width={1600}
              height={1200}
            />
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="container-page grid gap-10 py-24 md:grid-cols-12 md:py-32">
        <div className="md:col-span-5">
          <p className="text-xs uppercase tracking-[0.3em] text-clay">Our craft</p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-forest-deep md:text-5xl">
            Florals shaped by your story.
          </h2>
        </div>
        <div className="space-y-5 text-base leading-relaxed text-ink/80 md:col-span-6 md:col-start-7">
          <p>
            We do not sell off-the-shelf bouquets. Every order is a
            conversation — your colours, your favourite blooms, the moment
            you are marking — translated by a trained florist into something
            that feels personal.
          </p>
          <p>
            From a single quiet rose to bridal florals for the day itself,
            each piece is built fresh, by hand, and with intention.
          </p>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="bg-cream">
        <div className="container-page grid gap-1 pb-24 md:grid-cols-3 md:gap-8">
          {([
            { to: "/shop", search: { category: "fresh" as const, occasion: "all" as const }, label: "Fresh bouquets", img: featured[0]?.image, sub: "Made to order, by hand." },
            { to: "/shop", search: { category: "preserved" as const, occasion: "all" as const }, label: "Preserved", img: products.find((p) => p.slug === "eternal-love")?.image, sub: "A keepsake that lasts." },
            { to: "/services", search: undefined, label: "Weddings", img: servicesWedding, sub: "Florals for the day itself." },
          ] as const).map((c) => (
            <Link
              key={c.label}
              to={c.to}
              search={c.search as never}
              className="group relative block overflow-hidden rounded-3xl"
            >
              <img
                src={c.img}
                alt={c.label}
                loading="lazy"
                className="h-[60vh] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-forest-deep/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="text-xs uppercase tracking-[0.25em] text-cream/70">Collection</p>
                <h3 className="mt-2 font-display text-3xl text-cream">{c.label}</h3>
                <p className="mt-2 max-w-xs text-sm text-cream/80">{c.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* PORTFOLIO */}
      <section className="bg-forest py-24 text-cream md:py-32">
        <div className="container-page">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cream/60">Portfolio</p>
              <h2 className="mt-3 font-display text-4xl text-cream md:text-5xl">
                A few of our favourites.
              </h2>
            </div>
            <Link
              to="/shop"
              className="hidden items-center gap-2 text-sm text-cream/85 underline underline-offset-4 hover:text-cream md:inline-flex"
            >
              See the shop <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div className="mt-12 -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-6">
            {featured.map((p) => (
              <Link
                key={p.slug}
                to="/shop/$slug"
                params={{ slug: p.slug }}
                className="group block w-64 flex-none snap-start md:w-auto"
              >
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="mt-3 font-display text-sm text-cream/90">{p.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES TEASER */}
      <section className="container-page grid gap-10 py-24 md:grid-cols-12 md:py-32">
        <div className="overflow-hidden rounded-3xl md:col-span-6">
          <img
            src={servicesWedding}
            alt="Bridal bouquet on a chair beside a chapel window"
            loading="lazy"
            className="aspect-[4/5] w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center md:col-span-5 md:col-start-8">
          <p className="text-xs uppercase tracking-[0.3em] text-clay">Weddings</p>
          <h2 className="mt-4 font-display text-4xl text-forest-deep md:text-5xl">
            Intimate Love — wedding package.
          </h2>
          <p className="mt-5 text-ink/80">
            Looking for your big day's florals? Our Intimate Love wedding
            package is available from SGD 300, including the bride's bouquet,
            groom's boutonnière and parents' boutonnières. Other additions
            and urgent requests are also available.
          </p>
          <div className="mt-8">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm text-cream hover:bg-forest-deep"
            >
              Explore wedding florals <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="border-t border-forest/10 bg-cream">
        <div className="container-page grid gap-10 py-20 md:grid-cols-3 md:py-24">
          {[
            { h: "Made to order", p: "Each bouquet is built fresh, the day before or the day of." },
            { h: "WSQ-trained", p: "Continually honing the craft so every arrangement feels considered." },
            { h: "Giving back", p: "Excess stock goes to hospices and donation drives, not the bin." },
          ].map((v) => (
            <div key={v.h}>
              <h3 className="font-display text-2xl text-forest-deep">{v.h}</h3>
              <p className="mt-3 text-sm text-ink/75">{v.p}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
