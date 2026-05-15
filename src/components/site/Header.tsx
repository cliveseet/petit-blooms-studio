import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import logo from "@/assets/petit-blooms-logo.png";

const leftLinks = [
  { to: "/", label: "Studio" },
  { to: "/shop", label: "Ready Bouquets" },
  { to: "/bespoke", label: "Bespoke" },
  { to: "/services", label: "Weddings & Events" },
] as const;

const rightLinks = [
  { to: "/about", label: "Story" },
  { to: "/contact", label: "Contact" },
] as const;

const mobileLinks = [...leftLinks, ...rightLinks] as const;

export function Header() {
  const { count, setOpen } = useCart();
  const { session, isAdmin } = useAuth();
  const [menu, setMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b hairline bg-cream/85 text-ink backdrop-blur-md">
      <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-20">
        <button
          className="justify-self-start md:hidden"
          aria-label="Open menu"
          onClick={() => setMenu((m) => !m)}
        >
          {menu ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <nav className="hidden min-w-0 items-center justify-start gap-4 lg:gap-6 md:flex">
          {leftLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-ink/65 transition-colors hover:text-loam lg:text-[11px] lg:tracking-[0.24em]"
              activeProps={{ className: "text-loam" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/"
          aria-label="Petit Blooms home"
          className="flex items-center justify-center justify-self-center"
        >
          <img src={logo} alt="Petit Blooms" className="h-12 w-12 object-contain md:h-16 md:w-16" />
        </Link>

        <div className="flex min-w-0 items-center justify-end gap-4 md:gap-5 lg:gap-6">
          <nav className="hidden min-w-0 items-center justify-end gap-4 lg:gap-6 md:flex">
            {rightLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-ink/65 transition-colors hover:text-loam lg:text-[11px] lg:tracking-[0.24em]"
                activeProps={{ className: "text-loam" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to={session ? (isAdmin ? "/admin" : "/account") : "/login"}
              className="inline-flex items-center gap-1.5 whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-ink/65 transition-colors hover:text-loam lg:text-[11px] lg:tracking-[0.24em]"
              activeProps={{ className: "text-loam" }}
            >
              <User className="size-3.5" />
              {session ? (isAdmin ? "Admin" : "Account") : "Sign In"}
            </Link>
          </nav>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-ink/75 transition-colors hover:text-loam lg:text-[11px] lg:tracking-[0.28em]"
            aria-label="Open cart"
          >
            <ShoppingBag className="size-4" />
            <span className="tabular-nums">Bag · {count}</span>
          </button>
        </div>
      </div>

      <div
        className={cn(
          "grid overflow-hidden transition-all md:hidden",
          menu ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <nav className="container-page flex flex-col gap-1 pb-6 pt-2">
            {mobileLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenu(false)}
                className="border-b hairline py-3 text-base text-ink/85"
                activeProps={{ className: "text-loam" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to={session ? (isAdmin ? "/admin" : "/account") : "/login"}
              onClick={() => setMenu(false)}
              className="border-b hairline py-3 text-base text-ink/85"
            >
              {session ? (isAdmin ? "Admin" : "Account") : "Sign In"}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
