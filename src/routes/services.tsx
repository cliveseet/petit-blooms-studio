import { createFileRoute } from "@tanstack/react-router";
import servicesWedding from "@/assets/services-wedding.jpg";
import { MapPin, Truck } from "lucide-react";

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
    <div>
      <section className="bg-cream">
        <div className="container-page grid gap-10 py-20 md:grid-cols-12 md:gap-16 md:py-28">
          <div className="md:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-clay">Services</p>
            <h1 className="mt-4 font-display text-5xl text-forest-deep md:text-6xl">
              Florals for the moments that matter.
            </h1>
            <p className="mt-6 max-w-md text-ink/80">
              From bridal bouquets to last-minute pick-ups — designed,
              tied and delivered with care.
            </p>
          </div>
          <div className="md:col-span-7">
            <img
              src={servicesWedding}
              alt="Bridal bouquet on a chair beside a chapel window at golden hour"
              loading="lazy"
              className="aspect-[4/3] w-full rounded-3xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* Wedding package */}
      <section className="container-page grid gap-12 py-20 md:grid-cols-12 md:py-24">
        <div className="md:col-span-5">
          <p className="text-xs uppercase tracking-[0.3em] text-clay">Weddings</p>
          <h2 className="mt-4 font-display text-4xl text-forest-deep md:text-5xl">
            Intimate Love — wedding package
          </h2>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <div className="rounded-3xl border border-forest/15 bg-cream p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-clay">From SGD 300</p>
            <ul className="mt-5 space-y-3 text-ink/85">
              <li className="flex gap-3"><span className="text-forest">—</span> Bride's bouquet</li>
              <li className="flex gap-3"><span className="text-forest">—</span> Groom's boutonnière</li>
              <li className="flex gap-3"><span className="text-forest">—</span> Parents' boutonnières</li>
            </ul>
            <p className="mt-6 text-sm text-ink/75">
              Other additions and urgent requests are also available. Reach
              out to customise your big day's florals.
            </p>
            <a
              href="https://www.instagram.com/petit.blooms"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-full bg-forest px-6 py-3 text-sm text-cream hover:bg-forest-deep"
            >
              Message us to customise
            </a>
          </div>
        </div>
      </section>

      {/* Lead time */}
      <section className="bg-forest text-cream">
        <div className="container-page grid gap-10 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-4">
            <p className="text-xs uppercase tracking-[0.3em] text-cream/60">
              Lead time
            </p>
            <h2 className="mt-4 font-display text-3xl text-cream md:text-4xl">
              Order to collection or delivery
            </h2>
          </div>
          <div className="space-y-5 text-cream/80 md:col-span-7 md:col-start-6">
            <p>
              Please make orders preferably <strong className="text-cream">at least 2 days
              before</strong> the intended delivery or collection. For urgent
              requests, message <strong className="text-cream">@petit.blooms</strong> on
              Instagram — you will also find other modes of contact there.
            </p>
            <p>
              As our bouquets are made to order and freshly prepared, please
              note <strong className="text-cream">no cancellations</strong> are accepted within
              24 hours of delivery or collection. Thank you for your
              understanding.
            </p>
          </div>
        </div>
      </section>

      {/* Delivery + Self-collection */}
      <section className="container-page grid gap-8 py-20 md:grid-cols-2 md:py-24">
        <div className="rounded-3xl border border-forest/15 bg-cream p-8">
          <Truck className="size-6 text-forest" />
          <h3 className="mt-5 font-display text-2xl text-forest-deep">Delivery</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink/80">
            <li>From SGD 20 (excluding Tuas and Sentosa — please contact us for these areas).</li>
            <li>All delivery bouquets are protected with honeycomb paper.</li>
            <li>Same-day delivery available from SGD 25.</li>
            <li>Delivery is complimentary for orders above SGD 180.</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-forest/15 bg-cream p-8">
          <MapPin className="size-6 text-forest" />
          <h3 className="mt-5 font-display text-2xl text-forest-deep">Self-collection</h3>
          <p className="mt-4 text-sm text-ink/80">
            Bishan Street 12, Block 111, Singapore 570111 — a 7-minute walk
            from Bishan MRT (CC15). Take Exit C, next to 7-Eleven, then the
            straight path down to Raffles Institution. Crossing the road and
            zebra crossing brings you to 570111.
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Block+111+Bishan+Street+12+Singapore+570111"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-full border border-forest/30 px-5 py-2.5 text-sm text-forest-deep hover:bg-forest/5"
          >
            Open in Google Maps
          </a>
        </div>
      </section>
    </div>
  );
}
