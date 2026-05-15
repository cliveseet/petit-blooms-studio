import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart, formatSGD } from "@/lib/cart";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export function CartDrawer() {
  const { open, setOpen, lines, remove, setQty, subtotal, clear } = useCart();
  const { session } = useAuth();
  const nav = useNavigate();

  const goCheckout = () => {
    setOpen(false);
    nav({ to: session ? "/checkout" : "/login" });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col bg-cream sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl text-forest-deep">Your bag</SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-display text-xl text-forest-deep">Your bag is empty</p>
            <p className="text-sm text-muted-foreground">Browse the shop to add a bouquet.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-2">
              {lines.map((l) => (
                <div key={l.id} className="flex gap-4 border-b border-forest/10 pb-5">
                  <img
                    src={l.image}
                    alt={l.name}
                    className="h-24 w-20 flex-none rounded-md object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display text-base leading-tight text-forest-deep">
                        {l.name}
                      </p>
                      <button
                        onClick={() => remove(l.id)}
                        className="text-muted-foreground hover:text-forest-deep"
                        aria-label="Remove"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    {Object.values(l.selectionLabels).length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {Object.values(l.selectionLabels).join(" · ")}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Personal message: {l.personalMessage || "NIL"}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="inline-flex items-center rounded-full border border-forest/20">
                        <button
                          className="px-2 py-1"
                          onClick={() => setQty(l.id, l.quantity - 1)}
                          aria-label="Decrease"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums">{l.quantity}</span>
                        <button
                          className="px-2 py-1"
                          onClick={() => setQty(l.id, l.quantity + 1)}
                          aria-label="Increase"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <p className="text-sm tabular-nums text-forest-deep">
                        {formatSGD(l.unitPrice * l.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-forest/10 bg-cream px-6 py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums text-forest-deep">
                  {formatSGD(subtotal)}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-baseline justify-between border-t hairline pt-3">
                  <span className="text-xs uppercase tracking-[0.24em] text-clay">Total</span>
                  <span className="font-display text-xl tabular-nums text-forest-deep">
                    {formatSGD(subtotal)}
                  </span>
                </div>
              </div>

              <Button
                className="w-full bg-loam text-cream hover:bg-ink"
                size="lg"
                onClick={goCheckout}
              >
                Proceed to checkout
              </Button>
              <button
                onClick={clear}
                className="w-full text-xs text-muted-foreground hover:text-forest-deep"
              >
                Clear bag
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
