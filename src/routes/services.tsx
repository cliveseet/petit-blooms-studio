import { createFileRoute, Link } from "@tanstack/react-router";
import servicesWedding from "@/assets/services-wedding.jpg";
import petalsPromises from "@/assets/product-petals-promises.jpg";
import eventFlorals from "@/assets/product-bloom-basket.jpg";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Weddings & Events — petit blooms" },
      {
        name: "description",
        content:
          "Wedding bouquets, boutonnières and custom event florals in Singapore.",
      },
      { property: "og:title", content: "Weddings & Events — petit blooms" },
      {
        property: "og:description",
        content:
          "Intimate Love wedding package and custom florals for events, corporate gifting and celebrations.",
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
              Weddings &amp; Events
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[1.02] text-loam md:text-7xl">
              Florals for the
              <span className="font-serif-italic text-clay"> moments </span>
              that matter.
            </h1>
            <p className="mt-6 max-w-md text-ink/75">
              Bridal bouquets, boutonnières and event florals, designed and
              tied with quiet care for intimate days and gathered tables.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#wedding"
                className="inline-flex items-center gap-2 rounded-md bg-loam px-5 py-3 text-xs uppercase tracking-[0.22em] text-cream hover:bg-ink"
              >
                Wedding package
              </a>
              <a
                href="#events"
                className="inline-flex items-center gap-2 rounded-md border hairline px-5 py-3 text-xs uppercase tracking-[0.22em] text-loam hover:bg-shell"
              >
                Event florals
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

      {/* Event florals */}
      <section id="events" className="container-page py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-[11px] uppercase tracking-[0.34em] text-clay">No. 02</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-loam md:text-5xl">
              Event florals
              <span className="block font-serif-italic text-clay">— composed for the room</span>
            </h2>
            <p className="mt-6 max-w-md text-ink/75">
              Florals for tables, launches, corporate gestures and private
              celebrations — shaped to the scale, palette and mood of the gathering.
            </p>
            <div className="mt-8 overflow-hidden rounded-2xl">
              <img
                src={eventFlorals}
                alt="Basket arrangement of fresh blooms for an occasion table"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>

          <div className="md:col-span-6 md:col-start-7 md:pt-12">
            <div className="rounded-2xl border hairline bg-shell p-8 md:p-10">
              <p className="font-serif-italic text-xl leading-relaxed text-loam">
                Small arrangements can change the feeling of a room: a welcome
                table, a dinner setting, a quiet gift placed at each seat.
              </p>
              <div className="my-6 divider-rule" />
              <ul className="space-y-4 text-ink/85">
                {[
                  "Bud vases and table arrangements for intimate dinners",
                  "Custom bouquets and baskets for launches or celebrations",
                  "Corporate gestures, gifting corners and seasonal moments",
                ].map((item, i) => (
                  <li key={item} className="flex gap-4">
                    <span className="font-display text-clay tabular-nums">
                      0{i + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 text-sm leading-6 text-ink/70">
                Share the occasion, colour direction and rough quantity; Denise
                will suggest a floral direction that feels personal without
                overwhelming the setting.
              </p>
              <Link
                to="/contact"
                className="mt-7 inline-flex items-center gap-2 rounded-md bg-loam px-5 py-3 text-xs uppercase tracking-[0.22em] text-cream hover:bg-ink"
              >
                Enquire about event florals <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
