import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Mail, Send, ArrowUpRight } from "lucide-react";
import contactOne from "@/assets/contact-1.jpg";
import contactTwo from "@/assets/contact-2.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — petit blooms" },
      {
        name: "description",
        content:
          "Reach petit blooms by email, Instagram or Telegram. We reply within 1–2 days; Instagram DM is fastest for urgent requests.",
      },
      { property: "og:title", content: "Contact — petit blooms" },
      {
        property: "og:description",
        content: "Email, Instagram and Telegram — we reply within 1–2 days.",
      },
    ],
  }),
  component: ContactPage,
});

const channels = [
  {
    id: "email",
    label: "Email",
    value: "denise@petitblooms.com",
    note: "Best for detailed enquiries and quotes.",
    href: "mailto:denise@petitblooms.com",
    Icon: Mail,
  },
  {
    id: "instagram",
    label: "Instagram",
    value: "@petit.blooms",
    note: "Fastest reply — best for urgent requests.",
    href: "https://www.instagram.com/petit.blooms",
    Icon: Instagram,
  },
  {
    id: "telegram",
    label: "Telegram channel",
    value: "Bouquet updates & offers",
    note: "Join for new drops and seasonal sales.",
    href: "https://t.me/+ltJGQrNGxMFkZDY1",
    Icon: Send,
  },
];

function ContactPage() {
  return (
    <section className="container-page overflow-hidden py-20 md:py-28">
      <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-6">
          <p className="text-xs uppercase tracking-[0.3em] text-clay">Contact</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.04] text-loam md:text-6xl">
            Let&apos;s chat about
            <span className="block font-serif-italic text-clay">your bouquet.</span>
          </h1>
          <p className="mt-6 max-w-lg text-ink/75">
            For enquiries, special requests or last-minute orders, pick the channel that suits you.
            We reply within 1–2 days.
          </p>

          <div className="mt-10 overflow-hidden rounded-2xl border hairline bg-shell shadow-[var(--shadow-soft)]">
            {channels.map(({ id, label, value, note, href, Icon }) => (
              <a
                key={id}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="group flex min-w-0 items-center gap-4 border-b hairline px-5 py-5 transition-colors last:border-b-0 hover:bg-cream/70 md:gap-5 md:px-6"
              >
                <span className="inline-flex size-11 flex-none items-center justify-center rounded-full bg-clay/10 text-clay transition-colors group-hover:bg-loam group-hover:text-cream">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                    {label}
                  </span>
                  <span className="mt-1 block break-words font-display text-xl leading-tight text-loam">
                    {value}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-ink/70">{note}</span>
                </span>
                <ArrowUpRight className="size-4 flex-none text-clay transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-loam" />
              </a>
            ))}
          </div>
        </div>

        <div className="relative min-h-[560px] md:col-span-6">
          <div className="absolute right-0 top-0 w-[78%] overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-lift)]">
            <img
              src={contactOne}
              alt="Wrapped floral arrangement prepared for a customer"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="absolute bottom-10 left-0 w-[54%] overflow-hidden rounded-2xl border-[8px] border-cream shadow-[var(--shadow-soft)] md:bottom-14">
            <img
              src={contactTwo}
              alt="Small floral detail with soft petals"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div
            className="absolute bottom-0 right-[8%] h-28 w-[1px] bg-clay/35"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
