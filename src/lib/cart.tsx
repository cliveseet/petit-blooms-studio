import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartLine = {
  id: string; // unique line id
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  selections: Record<string, string>;
  selectionLabels: Record<string, string>;
  personalMessage: string;
};

export type DeliveryQuote = {
  postal: string;
  fee: number;
  distanceKm: number | null;
  source: "onemap" | "maximum_fallback";
  checkedAt: string;
  message?: string;
};

type CartCtx = {
  lines: CartLine[];
  deliveryQuote: DeliveryQuote | null;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (line: Omit<CartLine, "id">) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  setDeliveryQuote: (quote: DeliveryQuote | null) => void;
  clearDeliveryQuote: () => void;
  clear: () => void;
  count: number;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "petit-blooms-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLines(parsed);
        } else {
          setLines(parsed.lines ?? []);
          setDeliveryQuote(parsed.deliveryQuote ?? null);
        }
      }
    } catch {
      localStorage.removeItem(KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ lines, deliveryQuote }));
    } catch {
      // Storage can fail in private browsing; the live cart still works in memory.
    }
  }, [deliveryQuote, lines, hydrated]);

  const add: CartCtx["add"] = (line) => {
    const id = `${line.slug}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setLines((prev) => [...prev, { ...line, id }]);
    setOpen(true);
  };
  const remove = (id: string) => setLines((p) => p.filter((l) => l.id !== id));
  const setQty = (id: string, quantity: number) =>
    setLines((p) => p.map((l) => (l.id === id ? { ...l, quantity: Math.max(1, quantity) } : l)));
  const clearDeliveryQuote = () => setDeliveryQuote(null);
  const clear = () => {
    setLines([]);
    clearDeliveryQuote();
  };

  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const deliveryFee = subtotal >= 180 ? 0 : (deliveryQuote?.fee ?? 0);
  const grandTotal = subtotal + deliveryFee;

  return (
    <Ctx.Provider
      value={{
        lines,
        deliveryQuote,
        open,
        setOpen,
        add,
        remove,
        setQty,
        setDeliveryQuote,
        clearDeliveryQuote,
        clear,
        count,
        subtotal,
        deliveryFee,
        grandTotal,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used within CartProvider");
  return v;
}

export const formatSGD = (n: number) => `SGD ${n.toFixed(2)}`;
