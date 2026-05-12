import { createFileRoute } from "@tanstack/react-router";
import aboutFlorist from "@/assets/about-florist.jpg";
import heroBouquet from "@/assets/hero-bouquet.jpg";

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
      { property: "og:image", content: aboutFlorist },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <section className="container-page grid gap-12 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-5">
          <p className="text-xs uppercase tracking-[0.3em] text-clay">About</p>
          <h1 className="mt-4 font-display text-5xl text-forest-deep md:text-6xl">
            petit bloom's origin.
          </h1>
        </div>
        <div className="space-y-5 text-ink/85 md:col-span-6 md:col-start-7">
          <p className="font-display text-2xl text-forest-deep">
            Hello — I'm Denise, a uni student who loves flowers.
          </p>
          <p>
            <em>petit blooms</em> began with a simple, unforgettable moment:
            receiving my first bouquet on Valentine's Day. I never expected
            flowers to leave such a lasting impression — but that one bouquet
            sparked a passion that grew into something more.
          </p>
          <p>
            I believe flowers should be more than just gifts. They should be
            thoughtful, personal and full of meaning. That's why every
            arrangement I create is tailored to the recipient — their
            favourite blooms, colours and unique style. My goal is to bring
            joy through flowers, and I am constantly honing my craft through
            courses to make each bouquet even more special.
          </p>
          <p>
            It's an honour to be part of your moments, big or small. I hope
            my bouquets bring love and happiness to you and your loved ones.
          </p>
        </div>
      </section>

      <section className="bg-cream">
        <div className="container-page grid gap-10 py-16 md:grid-cols-2 md:py-20">
          <div className="overflow-hidden rounded-3xl">
            <img
              src={aboutFlorist}
              alt="Florist in a deep green apron arranging stems at a wooden table"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="overflow-hidden rounded-3xl">
            <img
              src={heroBouquet}
              alt="Hand-tied bouquet against a deep green backdrop"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-forest text-cream">
        <div className="container-page grid gap-10 py-20 md:grid-cols-12 md:py-24">
          <div className="md:col-span-4">
            <p className="text-xs uppercase tracking-[0.3em] text-cream/60">
              Our promise
            </p>
            <h2 className="mt-4 font-display text-4xl text-cream md:text-5xl">
              Giving what we can, when we can.
            </h2>
          </div>
          <div className="space-y-5 text-cream/85 md:col-span-7 md:col-start-6">
            <p>
              We believe in spreading joy when we can. While our bouquets are
              made to order, we sometimes have excess stock — and they
              shouldn't go to waste. Following our Mother's Day Sale, we
              donated flowers to Oasis@Outram Day Hospice (by HCA Hospice).
            </p>
            <p>
              Thanks to our customers' support during our Grad Sale, we have
              been able to make a donation to Medical Aid for Palestinians.
              We deeply appreciate your contribution and are grateful that
              you have joined us in making a difference.
            </p>
            <p>
              We remain committed to striving for positive change, and hope
              you will continue to support us on this journey. Thank you, our
              customers — past and potential — for not only contributing,
              but for standing by us as a small business. Your support means
              the world to us.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
