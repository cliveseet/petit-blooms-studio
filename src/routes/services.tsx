import { createFileRoute, Link } from "@tanstack/react-router";
import servicesWedding from "@/assets/services-wedding.jpg";
import petalsPromises from "@/assets/product-petals-promises.jpg";
import { MapPin, Truck, Clock, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Weddings & Services — petit blooms" },
      {
        name: "description",
        content:
          "Wedding bouquets and boutonnières, delivery and self-collection in Singapore.",
      },
      { property: "og:title", content: "Weddings & Services — petit blooms" },
      {
        property: "og:description",
        content:
          "Intimate Love wedding package, delivery and self-collection in Singapore.",
      },
      { property: "og:image", content: servicesWedding },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <div className="bg-cream">
      {/* Editorial hero — image-led, no full green band */}
      <section className="container-page pt-16 md:pt-24">
        <div className="grid items-end gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-5">
            <p className="text-[11px] uppercase tracking-[0.34em] text-clay">
              Services · Weddings
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[1.02] text-loam md:text-7xl">
              Florals for the
              <span className="font-serif-italic text-clay"> moments </span>
              that matter.
            </h1>
            <p className="mt-6 max-w-md text-ink/75">
              From bridal bouquets to last-minute pick-ups — designed, tied
              and delivered with quiet care.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#wedding"
                className="inline-flex items-center gap-2 rounded-md bg-loam px-5 py-3 text-xs uppercase tracking-[0.22em] text-cream hover:bg-ink"
              >
                Wedding package
              </a>
              <a
                href="#delivery"
                className="inline-flex items-center gap-2 rounded-md border hairline px-5 py-3 text-xs uppercase tracking-[0.22em] text-loam hover:bg-shell"
              >
                Delivery & pick-up
              </a>
            </div>
          </div>
          <div className="md:col-span-7">
            <div className="relative">
              <div className="absolute -left-4 -top-4 hidden h-full w-full rounded-[2rem] border hairline md:block" />
              <img
                src={servicesWedding}
                alt="Bridal bouquet on a chair beside a chapel window at golden hour"
                loading="lazy"
                className="relative aspect-[5/4] w-full rounded-[2rem] object-cover shadow-[var(--shadow-lift)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Editorial rule */}
      <div className="container-page mt-24"><div className="divider-rule" /></div>

      {/* Wedding package — magazine spread */}
      <section id="wedding" className="container-page py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-[11px] uppercase tracking-[0.34em] text-clay">No. 01</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-loam md:text-5xl">
              Intimate Love
              <span className="block font-serif-italic text-clay">— wedding package</span>
            </h2>
            <p className="mt-6 max-w-md text-ink/75">
              A curated trio of florals for the day itself, customised to
              your palette and styling. Each piece is built to feel personal,
              quiet and unmistakably yours.
            </p>
            <div className="mt-8 overflow-hidden rounded-2xl">
              <img
                src={petalsPromises}
                alt="Soft bridal bouquet with garden roses and ranunculus"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>

          <div className="md:col-span-6 md:col-start-7 md:pt-12">
            <div className="rounded-2xl border hairline bg-shell p-8 md:p-10">
              <div className="flex items-baseline justify-between">
                <p className="text-[11px] uppercase tracking-[0.28em] text-clay">From</p>
                <p className="font-display text-3xl text-loam tabular-nums">SGD 300</p>
              </div>
              <div className="my-6 divider-rule" />
              <ul className="space-y-4 text-ink/85">
                {[
                  "Bride's bouquet — hand-tied, satin ribbon",
                  "Groom's boutonnière — colour-matched",
                  "Parents' boutonnières — a quiet pair",
                ].map((item, i) => (
                  <li key={item} className="flex gap-4">
                    <span className="font-display text-clay tabular-nums">
                      0{i + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 text-sm text-ink/70">
                Other additions and urgent requests are also welcome. Reach
                out to customise your big day's florals.
              </p>
              <a
                href="https://www.instagram.com/petit.blooms"
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-md bg-loam px-5 py-3 text-xs uppercase tracking-[0.22em] text-cream hover:bg-ink"
              >
                Message us to customise <ArrowUpRight className="size-4" />
              </a>
            </div>

            {/* Wedding-specific note about advance booking */}
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Wedding pieces are built bespoke — please reach out early so we
              can plan your palette, blooms and timing together.
            </p>
          </div>
        </div>
      </section>

      <div className="container-page"><div className="divider-rule" /></div>

      {/* Delivery + collection — two refined cards on the same canvas */}
      <section id="delivery" className="container-page py-20 md:py-28">
        <div className="mb-14 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.34em] text-clay">No. 02</p>
          <h2 className="mt-4 font-display text-4xl text-loam md:text-5xl">
            Delivery &amp;
            <span className="font-serif-italic text-clay"> self-collection</span>
          </h2>
          <p className="mt-4 text-sm text-ink/70">
            Applies to every bouquet in the shop — fresh, preserved, or accessory.
          </p>
        </div>

        {/* Lead-time notice — clearly framed as a delivery/pickup note */}
        <div className="mb-10 flex gap-5 rounded-2xl border-l-2 border-clay/60 bg-shell px-6 py-5">
          <Clock className="mt-1 size-5 flex-none text-clay" />
          <div className="text-sm text-ink/80">
            <p className="font-display text-base text-loam">Lead time for delivery &amp; collection</p>
            <p className="mt-2">
              Please order at least <strong className="text-loam">2 days before</strong> the
              intended delivery or collection date. For urgent requests, message{" "}
              <strong className="text-loam">@petit.blooms</strong> on Instagram.
              As bouquets are made fresh,{" "}
              <strong className="text-loam">no cancellations</strong> within 24 hours
              of delivery or collection.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border hairline bg-shell p-8 md:p-10">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-clay/10 text-clay">
                <Truck className="size-4" />
              </span>
              <h3 className="font-display text-2xl text-loam">Delivery</h3>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-ink/80">
              <li className="flex gap-3"><span className="text-clay">·</span> From SGD 20 (excluding Tuas and Sentosa — please contact us).</li>
              <li className="flex gap-3"><span className="text-clay">·</span> All delivery bouquets are protected with honeycomb paper.</li>
              <li className="flex gap-3"><span className="text-clay">·</span> Same-day delivery available from SGD 25.</li>
              <li className="flex gap-3"><span className="text-clay">·</span> Complimentary for orders above SGD 180.</li>
            </ul>
          </article>
          <article className="rounded-2xl border hairline bg-shell p-8 md:p-10">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-clay/10 text-clay">
                <MapPin className="size-4" />
              </span>
              <h3 className="font-display text-2xl text-loam">Self-collection</h3>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-ink/80">
              Bishan Street 12, Block 111, Singapore 570111 — a 7-minute walk
              from Bishan MRT (CC15). Take Exit C, next to 7-Eleven, then the
              straight path down to Raffles Institution. Crossing the road
              and zebra crossing brings you to 570111.
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Block+111+Bishan+Street+12+Singapore+570111"
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-loam underline underline-offset-4 hover:text-clay"
            >
              Open in Google Maps <ArrowUpRight className="size-3.5" />
            </a>
          </article>
        </div>

        {/* Soft CTA */}
        <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-2xl bg-loam p-8 text-cream md:flex-row md:items-center md:p-10">
          <div>
            <p className="font-display text-2xl md:text-3xl">Ready to begin?</p>
            <p className="mt-2 text-sm text-cream/75">
              Browse the shop or reach out — we'll shape something quietly
              extraordinary.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-md bg-cream px-5 py-3 text-xs uppercase tracking-[0.22em] text-loam hover:bg-cream/90"
            >
              Shop bouquets <ArrowUpRight className="size-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-md border border-cream/30 px-5 py-3 text-xs uppercase tracking-[0.22em] text-cream hover:bg-cream/10"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
