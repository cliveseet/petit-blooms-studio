import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import servicesWedding from "@/assets/services-wedding.jpg";
import weddingPackageOne from "@/assets/services-weddingpackage-1.jpg";
import weddingPackageTwo from "@/assets/services-weddingpackage-2.jpg";
import eventOne from "@/assets/services-events-1.jpg";
import eventTwo from "@/assets/services-events-2.jpg";
import eventThree from "@/assets/services-events-3.jpg";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Weddings & Events — petit blooms" },
      {
        name: "description",
        content: "Wedding bouquets, boutonnières and custom event florals in Singapore.",
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
  const weddingFrames = [
    {
      src: weddingPackageOne,
      alt: "Wedding bouquet with soft seasonal flowers",
    },
    {
      src: weddingPackageTwo,
      alt: "Wedding floral details in a warm palette",
    },
  ];
  const eventFrames = [
    { src: eventOne, alt: "Event floral arrangement on a table" },
    { src: eventTwo, alt: "Custom floral gesture for an event" },
    { src: eventThree, alt: "Event flowers composed for a room" },
  ];

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
              Bridal bouquets, boutonnières and event florals, designed and tied with quiet care for
              intimate days and gathered tables.
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
      <div className="container-page mt-24">
        <div className="divider-rule" />
      </div>

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
              A curated trio of florals for the day itself, customised to your palette and styling.
              Each piece is built to feel personal, quiet and unmistakably yours.
            </p>
            <EditorialImageToggle frames={weddingFrames} />
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
                    <span className="font-display text-clay tabular-nums">0{i + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 text-sm text-ink/70">
                Other additions and urgent requests are also welcome. Reach out to customise your
                big day's florals.
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
              Wedding pieces are built bespoke — please reach out early so we can plan your palette,
              blooms and timing together.
            </p>
          </div>
        </div>
      </section>

      <div className="container-page">
        <div className="divider-rule" />
      </div>

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
              Florals for tables, launches, corporate gestures and private celebrations — shaped to
              the scale, palette and mood of the gathering.
            </p>
            <EditorialImageToggle frames={eventFrames} />
          </div>

          <div className="md:col-span-6 md:col-start-7 md:pt-12">
            <div className="rounded-2xl border hairline bg-shell p-8 md:p-10">
              <p className="font-serif-italic text-xl leading-relaxed text-loam">
                Small arrangements can change the feeling of a room: a welcome table, a dinner
                setting, a quiet gift placed at each seat.
              </p>
              <div className="my-6 divider-rule" />
              <ul className="space-y-4 text-ink/85">
                {[
                  "Bud vases and table arrangements for intimate dinners",
                  "Custom bouquets and baskets for launches or celebrations",
                  "Corporate gestures, gifting corners and seasonal moments",
                ].map((item, i) => (
                  <li key={item} className="flex gap-4">
                    <span className="font-display text-clay tabular-nums">0{i + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 text-sm leading-6 text-ink/70">
                Share the occasion, colour direction and rough quantity; Denise will suggest a
                floral direction that feels personal without overwhelming the setting.
              </p>
              <a
                href="https://www.instagram.com/petit.blooms"
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-md bg-loam px-5 py-3 text-xs uppercase tracking-[0.22em] text-cream hover:bg-ink"
              >
                Enquire about event florals <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function EditorialImageToggle({ frames }: { frames: Array<{ src: string; alt: string }> }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || frames.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % frames.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [frames.length, paused]);

  const previous = () => setActive((current) => (current - 1 + frames.length) % frames.length);
  const next = () => setActive((current) => (current + 1) % frames.length);

  return (
    <div
      className="group mt-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border hairline bg-shell shadow-[var(--shadow-soft)]">
        {frames.map((frame, index) => (
          <img
            key={frame.src}
            src={frame.src}
            alt={frame.alt}
            loading="lazy"
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out",
              "motion-reduce:transition-none",
              active === index ? "opacity-100 scale-100" : "opacity-0 scale-[1.015]",
            )}
          />
        ))}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-loam/18 to-transparent" />
        {frames.length > 1 && (
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
            <button
              type="button"
              onClick={previous}
              aria-label="Previous image"
              className="inline-flex size-9 items-center justify-center rounded-full border border-cream/50 bg-cream/82 text-loam shadow-[var(--shadow-soft)] backdrop-blur transition-colors hover:bg-shell focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {frames.map((frame, index) => (
                <span
                  key={frame.src}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    active === index ? "w-8 bg-cream" : "w-1.5 bg-cream/55",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="inline-flex size-9 items-center justify-center rounded-full border border-cream/50 bg-cream/82 text-loam shadow-[var(--shadow-soft)] backdrop-blur transition-colors hover:bg-shell focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
