import { Link } from "@tanstack/react-router";
import { Instagram, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 bg-forest-deep text-cream/85">
      <div className="container-page grid gap-12 py-16 md:grid-cols-4 md:py-20">
        <div className="md:col-span-2">
          <p className="font-display text-3xl text-cream">petit blooms</p>
          <p className="mt-3 max-w-sm text-sm text-cream/70">
            Build-to-order florals from a WSQ-trained florist in Singapore. Where flowers speak the
            language of love.
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg text-cream">Opening hours</h4>
          <dl className="mt-3 space-y-2 text-sm text-cream/75">
            <div>
              <dt className="font-medium text-cream/95">Online</dt>
              <dd>We are open online, 24/7.</dd>
            </div>
            <div>
              <dt className="font-medium text-cream/95">Pick-ups</dt>
              <dd>Self pick-ups cut-off at 10 pm.</dd>
            </div>
          </dl>
        </div>

        <div>
          <h4 className="font-display text-lg text-cream">Follow us</h4>
          <ul className="mt-3 space-y-2 text-sm text-cream/75">
            <li className="flex items-center gap-2">
              <Instagram className="size-4" />
              <a
                href="https://www.instagram.com/petit.blooms"
                target="_blank"
                rel="noreferrer"
                className="hover:text-cream"
              >
                @petit.blooms
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Send className="size-4" />
              <a
                href="https://t.me/+ltJGQrNGxMFkZDY1"
                target="_blank"
                rel="noreferrer"
                className="hover:text-cream"
              >
                @petit.blooms on Telegram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-cream/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} petit blooms. Made with love in Singapore.</p>
          <nav className="flex gap-5">
            <Link to="/shop" className="hover:text-cream">
              Our Collection
            </Link>
            <Link to="/bespoke" className="hover:text-cream">
              Build Your Bouquet
            </Link>
            <Link to="/services" className="hover:text-cream">
              Weddings &amp; Events
            </Link>
            <Link to="/about" className="hover:text-cream">
              Our Story
            </Link>
            <Link to="/contact" className="hover:text-cream">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
