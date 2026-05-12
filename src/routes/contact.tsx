import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Mail, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — petit blooms" },
      {
        name: "description",
        content:
          "Reach petit blooms by email, Instagram or Telegram. We reply within 1–2 days.",
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

function ContactPage() {
  return (
    <section className="container-page grid gap-12 py-20 md:grid-cols-12 md:py-28">
      <div className="md:col-span-6">
        <p className="text-xs uppercase tracking-[0.3em] text-clay">Contact</p>
        <h1 className="mt-4 font-display text-5xl text-forest-deep md:text-6xl">
          Let's chat about your bouquet.
        </h1>
        <div className="mt-8 space-y-5 text-ink/85">
          <p>
            For enquiries or special requests, email{" "}
            <a className="underline underline-offset-4" href="mailto:denise@petitblooms.com">
              denise@petitblooms.com
            </a>{" "}
            or message{" "}
            <a
              className="underline underline-offset-4"
              href="https://www.instagram.com/petit.blooms"
              target="_blank"
              rel="noreferrer"
            >
              @petit.blooms
            </a>{" "}
            on Instagram.
          </p>
          <p>
            We reply within 1–2 days. For urgent requests, Instagram Direct
            Messages are highly encouraged.
          </p>
          <p>
            Join our Telegram channel for bouquet updates and offers:{" "}
            <a
              className="underline underline-offset-4"
              href="https://t.me/+ltJGQrNGxMFkZDY1"
              target="_blank"
              rel="noreferrer"
            >
              t.me/+ltJGQrNGxMFkZDY1
            </a>
            .
          </p>
        </div>
      </div>

      <div className="md:col-span-5 md:col-start-8">
        <div className="rounded-3xl border border-forest/15 bg-cream p-8">
          <ul className="space-y-5">
            <li>
              <a
                href="mailto:denise@petitblooms.com"
                className="group flex items-start gap-4"
              >
                <span className="mt-1 rounded-full bg-forest/10 p-2 text-forest">
                  <Mail className="size-4" />
                </span>
                <span>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Email
                  </p>
                  <p className="font-display text-lg text-forest-deep group-hover:underline">
                    denise@petitblooms.com
                  </p>
                </span>
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/petit.blooms"
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-4"
              >
                <span className="mt-1 rounded-full bg-forest/10 p-2 text-forest">
                  <Instagram className="size-4" />
                </span>
                <span>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Instagram
                  </p>
                  <p className="font-display text-lg text-forest-deep group-hover:underline">
                    @petit.blooms
                  </p>
                </span>
              </a>
            </li>
            <li>
              <a
                href="https://t.me/+ltJGQrNGxMFkZDY1"
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-4"
              >
                <span className="mt-1 rounded-full bg-forest/10 p-2 text-forest">
                  <Send className="size-4" />
                </span>
                <span>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Telegram
                  </p>
                  <p className="font-display text-lg text-forest-deep group-hover:underline">
                    @petit.blooms channel
                  </p>
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
