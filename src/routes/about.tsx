import { createFileRoute } from "@tanstack/react-router";
import aboutHands from "@/assets/about-hands.jpg";
import aboutGiving from "@/assets/about-giving.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — petit blooms" },
      {
        name: "description",
        content:
          "Hi, I'm Denise. petit blooms is a build-to-order florist in Singapore, shaped by a love of flowers and a belief in giving back.",
      },
      { property: "og:title", content: "About — petit blooms" },
      {
        property: "og:description",
        content: "petit bloom's origin and our giving-back philosophy.",
      },
      { property: "og:image", content: aboutHands },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="bg-cream">
      {/* Origin — editorial split */}
      <section className="container-page py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <p className="text-[11px] uppercase tracking-[0.34em] text-clay">About</p>
            <h1 className="mt-4 font-display text-5xl leading-[1.02] text-loam md:text-7xl">
              petit bloom&apos;s
              <span className="block font-serif-italic text-clay">origin.</span>
            </h1>
            <div className="mt-10 overflow-hidden rounded-[1.75rem]">
              <img
                src={aboutHands}
                alt="Florist's hands tying a small posy of garden roses with satin ribbon"
                loading="lazy"
                width={1280}
                height={1600}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>
          <div className="space-y-5 text-ink/85 md:col-span-6 md:col-start-7 md:pt-6">
            <p className="font-serif-italic text-2xl leading-snug text-loam">
              Hello! I&apos;m Denise, a struggling uni student who loves flowers :&quot;)
            </p>
            <p>
              <em>petit.eblooms</em> began with a single, unforgettable moment —
              receiving my first bouquet on Valentine&apos;s Day. I never
              imagined a few stems wrapped in paper could leave such a quiet,
              lasting impression. That bouquet became the seed of something
              softer, slower, more intentional.
            </p>
            <p>
              I believe flowers should never feel like a transaction. Every
              arrangement I tie is built around the person it&apos;s meant for —
              their colours, their season, the way they hold a moment. Each
              bouquet is made fresh, by hand, and only ever to order.
            </p>
            <p>
              I&apos;m WSQ-trained and constantly learning — refining my craft
              between deadlines and lectures so each piece feels a little more
              considered than the last. Thank you for letting petit.eblooms be
              part of your moments, big or small.
            </p>

            <dl className="mt-10 grid grid-cols-3 gap-6 border-t hairline pt-8">
              {[
                { k: "WSQ", v: "Trained florist" },
                { k: "Made", v: "Fresh, to order" },
                { k: "SG", v: "Hand-delivered" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="font-display text-2xl text-clay md:text-3xl">{s.k}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-[0.22em] text-ink/65">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="container-page"><div className="divider-rule" /></div>

      {/* Giving back — editorial spread, no full green band */}
      <section className="container-page py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-6">
            <div className="overflow-hidden rounded-[1.75rem]">
              <img
                src={aboutGiving}
                alt="Bouquets wrapped in kraft paper, prepared for donation"
                loading="lazy"
                width={1600}
                height={1200}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-6 md:pt-4">
            <p className="text-[11px] uppercase tracking-[0.34em] text-clay">
              Our promise
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-loam md:text-5xl">
              Giving what we can,
              <span className="block font-serif-italic text-clay">when we can.</span>
            </h2>
            <div className="mt-6 space-y-5 text-ink/80">
              <p>
                We believe in spreading joy where we can. While our bouquets
                are made to order, we sometimes have excess stock — and they
                shouldn&apos;t go to waste. Following our Mother&apos;s Day Sale,
                we donated flowers to Oasis@Outram Day Hospice (by HCA Hospice).
              </p>
              <p>
                Thanks to our customers&apos; support during our Grad Sale, we
                have made a donation to Medical Aid for Palestinians. We
                deeply appreciate your contribution and are grateful that
                you have joined us in making a difference.
              </p>
              <p className="border-l-2 border-clay/60 pl-5 font-serif-italic text-lg text-loam">
                Thank you, our customers — past and potential — for standing
                by us as a small business. Your support means the world.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
