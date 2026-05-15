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

        <div className="relative min-h-[520px] md:col-span-6 md:min-h-[600px]">
          <div className="absolute right-[-1.25rem] top-0 w-[70%] overflow-hidden rounded-l-[2rem] rounded-r-none shadow-[var(--shadow-lift)] md:right-[-2.5rem] md:w-[62%]">
            <img
              src={contactOne}
              alt="Wrapped floral arrangement prepared for a customer"
              className="h-[430px] w-full object-cover object-center md:h-[600px]"
            />
          </div>
          <div
            className="absolute left-[4%] top-20 h-[1px] w-[28%] bg-clay/35"
            aria-hidden="true"
          />
          <div className="absolute bottom-16 left-0 w-[46%] overflow-hidden rounded-2xl border hairline bg-shell p-2 shadow-[var(--shadow-soft)] md:w-[34%]">
            <img
              src={contactTwo}
              alt="Small floral detail with soft petals"
              className="aspect-[3/4] w-full rounded-[0.85rem] object-cover object-center"
            />
          </div>
          <div
            className="absolute bottom-0 left-[42%] h-32 w-[1px] bg-clay/35"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
