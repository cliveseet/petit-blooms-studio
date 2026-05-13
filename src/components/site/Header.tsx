import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
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
  const { session, isAdmin } = useAuth();
  const [menu, setMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b hairline bg-cream/85 text-ink backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between md:h-20">
        <button className="md:hidden" aria-label="Open menu" onClick={() => setMenu((m) => !m)}>
          {menu ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <nav className="hidden items-center gap-9 md:flex">
          {links.slice(0, 3).map((l) => (
            <Link key={l.to} to={l.to}
              className="text-[11px] uppercase tracking-[0.28em] text-ink/65 transition-colors hover:text-loam"
              activeProps={{ className: "text-loam" }} activeOptions={{ exact: l.to === "/" }}>
              {l.label}
            </Link>
          ))}
        </nav>

        <Link to="/" className="font-display text-xl tracking-tight text-loam md:text-[22px]">
          petit<span className="font-serif-italic text-clay">.eblooms</span>
        </Link>

        <div className="flex items-center gap-7">
          <nav className="hidden items-center gap-9 md:flex">
            {links.slice(3).map((l) => (
              <Link key={l.to} to={l.to}
                className="text-[11px] uppercase tracking-[0.28em] text-ink/65 transition-colors hover:text-loam"
                activeProps={{ className: "text-loam" }}>
                {l.label}
              </Link>
            ))}
            <Link to={session ? (isAdmin ? "/admin" : "/account") : "/login"}
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.28em] text-ink/65 transition-colors hover:text-loam"
              activeProps={{ className: "text-loam" }}>
              <User className="size-3.5" />
              {session ? (isAdmin ? "Admin" : "Account") : "Sign in"}
            </Link>
          </nav>
          <button onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-ink/75 transition-colors hover:text-loam"
            aria-label="Open cart">
            <ShoppingBag className="size-4" />
            <span className="tabular-nums">Bag · {count}</span>
          </button>
        </div>
      </div>

      <div className={cn("grid overflow-hidden transition-all md:hidden", menu ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <nav className="container-page flex flex-col gap-1 pb-6 pt-2">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMenu(false)}
                className="border-b hairline py-3 text-base text-ink/85"
                activeProps={{ className: "text-loam" }}>
                {l.label}
              </Link>
            ))}
            <Link to={session ? "/account" : "/login"} onClick={() => setMenu(false)}
              className="border-b hairline py-3 text-base text-ink/85">
              {session ? "Account" : "Sign in"}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
