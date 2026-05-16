import { createFileRoute, Link } from "@tanstack/react-router";
import heroBouquet from "@/assets/hero-bouquet.jpg";
import servicesWedding from "@/assets/services-wedding.jpg";
import { useMenuProducts } from "@/hooks/use-menu-products";
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
  const { products } = useMenuProducts();
  const featured = portfolio.map((s) => products.find((p) => p.slug === s)!).filter(Boolean);

  return (
    <div className="bg-cream">
      {/* HERO — editorial cream with dramatic image */}
      <section className="relative overflow-hidden">
        <div className="container-page grid min-h-[88vh] grid-cols-1 items-center gap-12 py-16 md:grid-cols-12 md:py-24">
          <div className="md:col-span-5 reveal">
            <p className="text-[11px] uppercase tracking-[0.34em] text-clay">
              Singapore · Build-to-order
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] text-loam md:text-7xl">
              Where flowers
              <span className="block font-serif-italic text-clay">speak the language</span>
              of love.
            </h1>
            <p className="mt-7 max-w-md text-ink/75">
              Every bouquet is co-created — your story, your palette, shaped by a WSQ-trained
              florist's hand. No two are alike.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link
                to="/shop"
                search={{ category: "all", occasion: "all" }}
                className="inline-flex items-center gap-2 rounded-md bg-loam px-6 py-3.5 text-xs uppercase tracking-[0.22em] text-cream transition-all hover:-translate-y-0.5 hover:bg-ink"
              >
                Shop the collection <ArrowUpRight className="size-4" />
              </Link>
              <Link
                to="/bespoke"
                className="inline-flex items-center gap-2 rounded-md border hairline bg-shell px-6 py-3.5 text-xs uppercase tracking-[0.22em] text-loam transition-all hover:-translate-y-0.5 hover:border-clay/50 hover:bg-cream"
              >
                Build your bouquet
              </Link>
            </div>
          </div>
          <div className="relative md:col-span-7">
            <div className="absolute -left-5 -top-5 hidden h-full w-full rounded-[2rem] border hairline md:block" />
            <img
              src={heroBouquet}
              alt="Hand-tied bouquet of garden roses, ranunculus and eucalyptus"
              className="relative h-[60vh] w-full rounded-[2rem] object-cover shadow-[var(--shadow-lift)] md:h-[78vh]"
              width={1600}
              height={1200}
            />
          </div>
        </div>
      </section>

      <div className="container-page">
        <div className="divider-rule" />
      </div>

      {/* INTRO */}
      <section className="container-page grid gap-10 py-24 md:grid-cols-12 md:py-28">
        <div className="md:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.34em] text-clay">Our craft</p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-loam md:text-5xl">
            Florals shaped
            <span className="block font-serif-italic text-clay">by your story.</span>
          </h2>
        </div>
        <div className="space-y-5 text-base leading-relaxed text-ink/80 md:col-span-6 md:col-start-7">
          <p>
            We do not sell off-the-shelf bouquets. Every order is a conversation — your colours,
            your favourite blooms, the moment you are marking — translated by a trained florist into
            something that feels personal.
          </p>
          <p>
            From a single quiet rose to bridal florals for the day itself, each piece is built
            fresh, by hand, and with intention.
          </p>
        </div>
      </section>

      {/* COLLECTIONS — editorial trio */}
      <section className="container-page">
        <div className="grid gap-4 pb-24 md:grid-cols-3 md:gap-6">
          {(
            [
              {
                to: "/shop",
                search: { category: "fresh" as const, occasion: "all" as const },
                label: "Fresh",
                num: "01",
                img: featured[0]?.image,
                sub: "Made to order, by hand.",
              },
              {
                to: "/shop",
                search: { category: "preserved" as const, occasion: "all" as const },
                label: "Preserved",
                num: "02",
                img: products.find((p) => p.slug === "eternal-love")?.image,
                sub: "A keepsake that lasts.",
              },
              {
                to: "/services",
                search: undefined,
                label: "Weddings & Events",
                num: "03",
                img: servicesWedding,
                sub: "Florals for the day itself.",
              },
            ] as const
          ).map((c) => (
            <Link
              key={c.label}
              to={c.to}
              search={c.search as never}
              className="group relative block overflow-hidden rounded-[1.75rem]"
            >
              <img
                src={c.img}
                alt={c.label}
                loading="lazy"
                className="h-[68vh] w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-loam/85 via-loam/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="font-display text-xs tracking-[0.34em] text-cream/70">N° {c.num}</p>
                <h3 className="mt-1 font-display text-3xl text-cream">
                  {c.label}
                  {c.to === "/services" ? (
                    <span className="font-serif-italic text-blush"> florals</span>
                  ) : (
                    <span className="font-serif-italic text-blush"> bouquets</span>
                  )}
                </h3>
                <p className="mt-2 max-w-xs text-sm text-cream/85">{c.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* PORTFOLIO — single dramatic dark moment (warm loam, not green) */}
      <section className="bg-loam py-24 text-cream md:py-32">
        <div className="container-page">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.34em] text-clay">Portfolio</p>
              <h2 className="mt-3 font-display text-4xl text-cream md:text-5xl">
                A few of our
                <span className="font-serif-italic text-blush"> favourites</span>.
              </h2>
            </div>
            <Link
              to="/shop"
              search={{ category: "all", occasion: "all" }}
              className="hidden items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cream/75 underline underline-offset-[6px] decoration-clay/70 hover:text-cream md:inline-flex"
            >
              See the shop <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-12 -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-6">
            {featured.map((p, i) => (
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
                    className="aspect-[3/4] w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.05]"
                  />
                </div>
                <p className="mt-3 font-display text-xs tracking-[0.28em] text-cream/55">
                  N° 0{i + 1}
                </p>
                <p className="mt-1 font-display text-sm text-cream/95">{p.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES TEASER */}
      <section className="container-page grid gap-10 py-24 md:grid-cols-12 md:py-32">
        <div className="overflow-hidden rounded-[1.75rem] md:col-span-6">
          <img
            src={servicesWedding}
            alt="Bridal bouquet on a chair beside a chapel window"
            loading="lazy"
            className="aspect-[4/5] w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center md:col-span-5 md:col-start-8">
          <p className="text-[11px] uppercase tracking-[0.34em] text-clay">Weddings &amp; Events</p>
          <h2 className="mt-4 font-display text-4xl text-loam md:text-5xl">
            Intimate Love
            <span className="block font-serif-italic text-clay">— wedding package.</span>
          </h2>
          <p className="mt-6 text-ink/80">
            Looking for your big day's florals? Our Intimate Love wedding package is available from
            SGD 300, including the bride's bouquet, groom's boutonnière and parents' boutonnières.
            Other additions and urgent requests are also available.
          </p>
          <div className="mt-9">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-md bg-loam px-6 py-3.5 text-xs uppercase tracking-[0.22em] text-cream hover:bg-ink"
            >
              Explore weddings &amp; events <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* VALUES — quiet editorial */}
      <section className="border-t hairline">
        <div className="container-page grid gap-12 py-20 md:grid-cols-3 md:py-24">
          {[
            {
              n: "I",
              h: "Made to order",
              p: "Each bouquet is built fresh, the day before or the day of.",
            },
            {
              n: "II",
              h: "WSQ-trained",
              p: "Continually honing the craft so every arrangement feels considered.",
            },
            {
              n: "III",
              h: "Giving back",
              p: "Excess stock goes to hospices and donation drives, not the bin.",
            },
          ].map((v) => (
            <div key={v.h}>
              <p className="font-display text-3xl text-clay">{v.n}.</p>
              <h3 className="mt-3 font-display text-2xl text-loam">{v.h}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/75">{v.p}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
