import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/services", label: "Weddings" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-forest/10 bg-forest text-cream/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between md:h-20">
        <button
          className="md:hidden"
          aria-label="Open menu"
          onClick={() => setMenu((m) => !m)}
        >
          {menu ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {links.slice(0, 3).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm tracking-wide text-cream/80 transition-colors hover:text-cream"
              activeProps={{ className: "text-cream underline underline-offset-8 decoration-blush/70" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link to="/" className="font-display text-xl tracking-tight md:text-2xl">
          petit blooms
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-8 md:flex">
            {links.slice(3).map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm tracking-wide text-cream/80 transition-colors hover:text-cream"
                activeProps={{ className: "text-cream underline underline-offset-8 decoration-blush/70" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-sm text-cream/90 transition-colors hover:text-cream"
            aria-label="Open cart"
          >
            <ShoppingBag className="size-4" />
            <span className="tabular-nums">Bag ({count})</span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "grid overflow-hidden transition-all md:hidden",
          menu ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <nav className="container-page flex flex-col gap-1 pb-6 pt-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenu(false)}
                className="border-b border-cream/10 py-3 text-base text-cream/90"
                activeProps={{ className: "text-cream" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
