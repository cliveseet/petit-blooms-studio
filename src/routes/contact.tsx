import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Mail, Send, ArrowUpRight } from "lucide-react";

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
    <section className="container-page py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-clay">Contact</p>
        <h1 className="mt-4 font-display text-5xl text-forest-deep md:text-6xl">
          Let&apos;s chat about your bouquet.
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-ink/75">
          For enquiries, special requests or last-minute orders — pick the
          channel that suits you. We reply within 1–2 days.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl gap-4 md:grid-cols-3">
        {channels.map(({ id, label, value, note, href, Icon }) => (
          <a
            key={id}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            className="group relative flex flex-col rounded-3xl border border-forest/15 bg-cream p-7 transition-all hover:-translate-y-0.5 hover:border-forest/40 hover:shadow-[var(--shadow-lift)]"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-forest/10 text-forest">
              <Icon className="size-4" />
            </span>
            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 font-display text-xl text-forest-deep">{value}</p>
            <p className="mt-3 text-sm text-ink/70">{note}</p>
            <ArrowUpRight className="absolute right-6 top-6 size-4 text-forest/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-forest" />
          </a>
        ))}
      </div>

      <p className="mx-auto mt-14 max-w-xl text-center text-sm text-muted-foreground">
        For urgent requests, Instagram Direct Messages are highly encouraged.
      </p>
    </section>
  );
}
