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
    <div>
      {/* Origin — editorial split */}
      <section className="bg-cream">
        <div className="container-page grid gap-12 py-20 md:grid-cols-12 md:gap-16 md:py-28">
          <div className="md:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-clay">About</p>
            <h1 className="mt-4 font-display text-5xl text-forest-deep md:text-6xl">
              petit bloom&apos;s origin.
            </h1>
            <div className="mt-8 overflow-hidden rounded-3xl">
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
          <div className="space-y-5 text-ink/85 md:col-span-6 md:col-start-7 md:pt-4">
            <p className="font-display text-2xl text-forest-deep">
              Hello — I&apos;m Denise, a uni student who loves flowers.
            </p>
            <p>
              <em>petit blooms</em> began with a simple, unforgettable moment:
              receiving my first bouquet on Valentine&apos;s Day. I never expected
              flowers to leave such a lasting impression — but that one bouquet
              sparked a passion that grew into something more.
            </p>
            <p>
              I believe flowers should be more than just gifts. They should be
              thoughtful, personal and full of meaning. That&apos;s why every
              arrangement I create is tailored to the recipient — their
              favourite blooms, colours and unique style.
            </p>
            <p>
              I am constantly honing my craft through WSQ courses to make each
              bouquet even more considered. It&apos;s an honour to be part of
              your moments, big or small.
            </p>
          </div>
        </div>
      </section>

      {/* Giving back — forest band with single image */}
      <section className="bg-forest text-cream">
        <div className="container-page grid gap-12 py-20 md:grid-cols-12 md:gap-16 md:py-24">
          <div className="md:col-span-6">
            <div className="overflow-hidden rounded-3xl">
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
          <div className="md:col-span-6 md:pt-2">
            <p className="text-xs uppercase tracking-[0.3em] text-cream/60">
              Our promise
            </p>
            <h2 className="mt-3 font-display text-4xl text-cream md:text-5xl">
              Giving what we can, when we can.
            </h2>
            <div className="mt-6 space-y-5 text-cream/85">
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
              <p className="text-cream/75">
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
