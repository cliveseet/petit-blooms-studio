import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Leaf } from "lucide-react";
import heroBouquet from "@/assets/hero-bouquet.jpg";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCart, formatSGD } from "@/lib/cart";
import { useMenuProducts } from "@/hooks/use-menu-products";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/bespoke")({
  head: () => ({
    meta: [
      { title: "Custom Bouquet — petit blooms" },
      {
        name: "description",
        content:
          "Build a custom Petit Blooms bouquet by choosing main flowers, fillers, size and palette.",
      },
      { property: "og:title", content: "Custom Bouquet — petit blooms" },
      {
        property: "og:description",
        content: "A high-touch bouquet flow for choosing your own flowers.",
      },
      { property: "og:image", content: heroBouquet },
    ],
  }),
  component: BespokePage,
});

type FloralChoice = {
  id: string;
  label: string;
  price: number;
  tone: string;
  accent?: string;
  kind?: "bloom" | "filler";
};

type PaletteChoice = {
  id: string;
  label: string;
  gradient: string;
};

type SizeChoice = {
  id: "small" | "medium" | "large" | "extra-large";
  label: string;
  short: string;
  price: number;
  hint: string;
};

const bouquetBase = 55;

const mainFlowers: FloralChoice[] = [
  { id: "rose", label: "Roses", price: 25, tone: "#c96f7d", accent: "#f4d4da" },
  { id: "tulip", label: "Tulips", price: 24, tone: "#d997a2", accent: "#f8dfd7" },
  { id: "sunflower", label: "Sunflowers", price: 22, tone: "#d9a93d", accent: "#5f3f24" },
  { id: "hydrangea", label: "Hydrangea", price: 36, tone: "#8aa6cf", accent: "#d6e2ef" },
  { id: "peony", label: "Peonies", price: 42, tone: "#e6a4b1", accent: "#f7d8df" },
  { id: "ranunculus", label: "Ranunculus", price: 32, tone: "#f0b7a4", accent: "#f8e0d4" },
  { id: "anemone", label: "Anemones", price: 34, tone: "#3d3158", accent: "#f4ede1" },
  { id: "lisianthus", label: "Lisianthus", price: 28, tone: "#d8c3e8", accent: "#f1e8f6" },
  { id: "snapdragon", label: "Snapdragons", price: 28, tone: "#f3c7d1", accent: "#f8e6ea" },
  { id: "calla", label: "Calla lilies", price: 34, tone: "#f4ede1", accent: "#c7a76c" },
  { id: "carnation", label: "Carnations", price: 20, tone: "#e0a6b0", accent: "#f1d0d6" },
  { id: "matthiola", label: "Matthiola", price: 22, tone: "#c6b7d6", accent: "#eee7f2" },
];

const fillerFlowers: FloralChoice[] = [
  {
    id: "mixed-fillers",
    label: "Mixed Fillers",
    price: 6,
    tone: "#d9e4d0",
    accent: "#f4ede1",
    kind: "filler",
  },
  {
    id: "eucalyptus",
    label: "Eucalyptus",
    price: 10,
    tone: "#8fa085",
    accent: "#dfe7da",
    kind: "filler",
  },
  {
    id: "babys-breath",
    label: "Baby's breath",
    price: 8,
    tone: "#f4ede1",
    accent: "#d5cbb8",
    kind: "filler",
  },
  {
    id: "dusty-miller",
    label: "Dusty miller",
    price: 10,
    tone: "#b9c4b3",
    accent: "#edf0ea",
    kind: "filler",
  },
  { id: "fern", label: "Fern", price: 8, tone: "#6e8266", accent: "#b7c3ad", kind: "filler" },
  {
    id: "wax-flower",
    label: "Wax flower",
    price: 9,
    tone: "#ead0d8",
    accent: "#f7eef1",
    kind: "filler",
  },
  {
    id: "limonium",
    label: "Limonium",
    price: 8,
    tone: "#b5a1cf",
    accent: "#eee7f4",
    kind: "filler",
  },
  { id: "ruscus", label: "Ruscus", price: 9, tone: "#5f754f", accent: "#b8c6ae", kind: "filler" },
];

const sizeOptions: SizeChoice[] = [
  { id: "small", label: "Petite", short: "S", price: 0, hint: "A compact hand-tied gesture." },
  { id: "medium", label: "Gathered", short: "M", price: 10, hint: "Balanced volume for gifting." },
  { id: "large", label: "Grand", short: "L", price: 25, hint: "Fuller form and wider face." },
  {
    id: "extra-large",
    label: "Statement",
    short: "XL",
    price: 50,
    hint: "Generous scale and presence.",
  },
];

const palettes: PaletteChoice[] = [
  {
    id: "soft-garden",
    label: "Soft Garden",
    gradient: "linear-gradient(135deg,#f5d3da 0%,#f8e0d4 45%,#d9e4d0 100%)",
  },
  {
    id: "rosewater",
    label: "Rosewater",
    gradient: "linear-gradient(135deg,#b96a72 0%,#e5aab5 45%,#f6e2dc 100%)",
  },
  {
    id: "buttercream",
    label: "Buttercream",
    gradient: "linear-gradient(135deg,#f4ede1 0%,#e9d5a8 45%,#b9c4a4 100%)",
  },
  {
    id: "blue-mist",
    label: "Blue Mist",
    gradient: "linear-gradient(135deg,#6f87aa 0%,#c8d8e9 52%,#f4ede1 100%)",
  },
  {
    id: "wine-garden",
    label: "Wine Garden",
    gradient: "linear-gradient(135deg,#5a1a26 0%,#a8323a 38%,#d8b8c0 100%)",
  },
  {
    id: "denise-choice",
    label: "Denise's Choice",
    gradient: "linear-gradient(135deg,#2f5a45 0%,#d9e4d0 48%,#f4ede1 100%)",
  },
];

const mixedPreview: FloralChoice[] = [fillerFlowers[1], fillerFlowers[2], fillerFlowers[5]].filter(
  Boolean,
);

function BespokePage() {
  const [main, setMain] = useState<string[]>(["rose"]);
  const [fillers, setFillers] = useState<string[]>(["mixed-fillers"]);
  const [size, setSize] = useState<SizeChoice>(sizeOptions[0]);
  const [palette, setPalette] = useState<PaletteChoice>(palettes[0]);
  const [personalMessage, setPersonalMessage] = useState("");
  const [flight, setFlight] = useState<{ key: number; choice: FloralChoice; lane: number } | null>(
    null,
  );
  const { add } = useCart();
  const { products } = useMenuProducts();

  const mainSelections = useMemo(
    () =>
      main
        .map((id) => mainFlowers.find((flower) => flower.id === id))
        .filter(Boolean) as FloralChoice[],
    [main],
  );
  const fillerSelections = useMemo(
    () =>
      fillers
        .map((id) => fillerFlowers.find((flower) => flower.id === id))
        .filter(Boolean) as FloralChoice[],
    [fillers],
  );
  const previewFlowers = useMemo(() => {
    const expandedFillers = fillers.includes("mixed-fillers") ? mixedPreview : fillerSelections;
    return [...mainSelections, ...expandedFillers].slice(0, 6);
  }, [fillerSelections, fillers, mainSelections]);
  const menuFlowers = useMemo(
    () =>
      products
        .filter((product) => product.category === "fresh")
        .map((product) => product.name.replace(/\s*\(.+\)\s*$/, "").trim()),
    [products],
  );

  const selectedFlowerTotal =
    mainSelections.reduce((sum, choice) => sum + choice.price, 0) +
    fillerSelections.reduce((sum, choice) => sum + choice.price, 0);
  const total = bouquetBase + selectedFlowerTotal + size.price;
  const priceRows = [
    { label: "Bouquet Base", value: bouquetBase },
    ...mainSelections.map((choice) => ({ label: choice.label, value: choice.price })),
    ...fillerSelections.map((choice) => ({ label: choice.label, value: choice.price })),
    { label: `${size.label} (${size.short})`, value: size.price },
  ];

  const triggerFlight = (choice: FloralChoice, lane: number) => {
    const key = Date.now();
    setFlight({ key, choice, lane });
    window.setTimeout(() => {
      setFlight((current) => (current?.key === key ? null : current));
    }, 980);
  };

  const toggleMain = (choice: FloralChoice) => {
    const active = main.includes(choice.id);
    if (active) {
      if (main.length === 1) {
        toast.error("Choose at least one main flower.");
        return;
      }
      setMain((current) => current.filter((id) => id !== choice.id));
      return;
    }
    if (main.length >= 3) {
      toast.error("Choose up to three main flowers.");
      return;
    }
    setMain((current) => [...current, choice.id]);
    triggerFlight(choice, main.length);
  };

  const toggleFiller = (choice: FloralChoice) => {
    const active = fillers.includes(choice.id);
    if (active) {
      if (fillers.length === 1) {
        toast.error("Choose at least one filler direction.");
        return;
      }
      setFillers((current) => current.filter((id) => id !== choice.id));
      return;
    }
    if (choice.id === "mixed-fillers") {
      setFillers(["mixed-fillers"]);
      triggerFlight(choice, 3);
      return;
    }
    const withoutMixed = fillers.filter((id) => id !== "mixed-fillers");
    if (withoutMixed.length >= 3) {
      toast.error("Choose up to three filler flowers.");
      return;
    }
    setFillers([...withoutMixed, choice.id]);
    triggerFlight(choice, 3 + withoutMixed.length);
  };

  const addBespoke = () => {
    add({
      slug: "custom-bouquet",
      name: "Custom Bouquet",
      image: heroBouquet,
      unitPrice: total,
      quantity: 1,
      selections: {
        main: main.join(","),
        fillers: fillers.join(","),
        size: size.id,
        palette: palette.id,
      },
      selectionLabels: {
        main: `Main flowers: ${mainSelections.map((choice) => choice.label).join(", ")}`,
        fillers: `Fillers: ${fillerSelections.map((choice) => choice.label).join(", ")}`,
        size: `Size: ${size.label}`,
        palette: `Palette: ${palette.label}`,
      },
      personalMessage: personalMessage.trim() || "NIL",
    });
    toast.success("Custom Bouquet added to your bag.");
  };

  return (
    <div className="bg-cream">
      <section className="container-page grid gap-12 py-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(380px,0.75fr)] lg:gap-14 lg:py-24">
        <div>
          <p className="text-[11px] uppercase tracking-[0.34em] text-clay">Custom Bouquet</p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.02] text-loam md:text-7xl">
            Compose a bouquet
            <span className="block font-serif-italic text-clay">around your flowers.</span>
          </h1>
          <p className="mt-6 max-w-xl text-ink/75">
            Select one to three main flowers, a filler direction, size and palette. Denise will
            balance the final bouquet with seasonal texture, wrap and finishing details.
          </p>
          {menuFlowers.length > 0 && (
            <p className="mt-5 max-w-xl text-xs leading-5 text-muted-foreground">
              Current menu references include {menuFlowers.slice(0, 4).join(", ")}, with premium
              seasonal additions available below.
            </p>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:row-span-2 lg:self-start">
          <BouquetPreview flowers={previewFlowers} palette={palette} size={size} flight={flight} />
          <div className="mt-5 rounded-2xl border hairline bg-shell p-6 shadow-[var(--shadow-soft)]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-clay">Bouquet total</p>
            <dl className="mt-5 space-y-3 text-sm">
              {priceRows.map((row) => (
                <PriceRow key={`${row.label}-${row.value}`} label={row.label} value={row.value} />
              ))}
            </dl>
            <div className="my-5 divider-rule" />
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.28em] text-clay">Total</span>
              <span className="font-display text-3xl text-loam tabular-nums">
                {formatSGD(total)}
              </span>
            </div>
            <Button className="mt-6 w-full" size="lg" onClick={addBespoke}>
              Add custom bouquet
            </Button>
            <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">
              Seasonal substitutions may be made while preserving your selected floral direction.
            </p>
          </div>
        </aside>

        <div className="space-y-10 lg:col-start-1 lg:row-start-2">
          <ChoiceSection
            number="01"
            title="Main flowers"
            hint="Choose one to three."
            choices={mainFlowers}
            selectedIds={main}
            onSelect={toggleMain}
          />
          <ChoiceSection
            number="02"
            title="Filler flowers"
            hint="Choose one to three."
            choices={fillerFlowers}
            selectedIds={fillers}
            onSelect={toggleFiller}
          />
          <SizeSection selected={size} onSelect={setSize} />
          <PaletteSection selected={palette} onSelect={setPalette} />
          <section>
            <Label className="text-xs uppercase tracking-[0.22em] text-clay">
              Personal message
            </Label>
            <Textarea
              value={personalMessage}
              onChange={(event) => setPersonalMessage(event.target.value)}
              className="mt-3"
              rows={3}
              maxLength={240}
              placeholder="A note for your recipient — leave blank if not required."
            />
          </section>
        </div>
      </section>
    </div>
  );
}

function ChoiceSection({
  number,
  title,
  hint,
  choices,
  selectedIds,
  onSelect,
}: {
  number: string;
  title: string;
  hint: string;
  choices: FloralChoice[];
  selectedIds: string[];
  onSelect: (choice: FloralChoice) => void;
}) {
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-clay tabular-nums">{number}</span>
          <h2 className="font-display text-xl text-loam md:text-2xl">{title}</h2>
        </div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {choices.map((choice) => {
          const active = selectedIds.includes(choice.id);
          return (
            <button
              type="button"
              key={choice.id}
              onClick={() => onSelect(choice)}
              className={cn(
                "group flex min-h-24 flex-col items-start justify-between rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30",
                active
                  ? "border-loam bg-loam text-cream shadow-[var(--shadow-soft)]"
                  : "hairline bg-shell text-ink/80 hover:-translate-y-0.5 hover:border-clay/50",
              )}
            >
              <span className="flex w-full items-center justify-between gap-3">
                <span
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-full border",
                    active ? "border-cream/40 bg-cream/10" : "hairline bg-cream",
                  )}
                >
                  {active ? (
                    <Check className="size-4" />
                  ) : choice.kind === "filler" ? (
                    <Leaf className="size-4" style={{ color: choice.tone }} />
                  ) : (
                    <MiniBloom tone={choice.tone} accent={choice.accent} />
                  )}
                </span>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    active ? "text-cream/78" : "text-muted-foreground",
                  )}
                >
                  + {formatSGD(choice.price)}
                </span>
              </span>
              <span className="mt-4 block font-display text-base leading-tight">
                {choice.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SizeSection({
  selected,
  onSelect,
}: {
  selected: SizeChoice;
  onSelect: (choice: SizeChoice) => void;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-clay tabular-nums">03</span>
        <h2 className="font-display text-xl text-loam md:text-2xl">Bouquet scale</h2>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {sizeOptions.map((choice) => {
          const active = selected.id === choice.id;
          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => onSelect(choice)}
              className={cn(
                "rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30",
                active
                  ? "border-loam bg-loam text-cream shadow-[var(--shadow-soft)]"
                  : "hairline bg-shell text-ink/80 hover:-translate-y-0.5 hover:border-clay/50",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-2 font-display text-sm",
                  active ? "border-cream/45 text-cream" : "hairline text-clay",
                )}
              >
                {choice.short}
              </span>
              <span className="mt-4 block font-display text-base">{choice.label}</span>
              <span
                className={cn(
                  "mt-2 block text-xs leading-5",
                  active ? "text-cream/72" : "text-muted-foreground",
                )}
              >
                {choice.hint}
              </span>
              <span
                className={cn(
                  "mt-3 block text-xs tabular-nums",
                  active ? "text-cream/82" : "text-ink/70",
                )}
              >
                + {formatSGD(choice.price)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PaletteSection({
  selected,
  onSelect,
}: {
  selected: PaletteChoice;
  onSelect: (choice: PaletteChoice) => void;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-clay tabular-nums">04</span>
        <h2 className="font-display text-xl text-loam md:text-2xl">Palette</h2>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {palettes.map((choice) => {
          const active = selected.id === choice.id;
          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => onSelect(choice)}
              className={cn(
                "group inline-flex items-center gap-3 rounded-full border px-3 py-2 pr-4 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30",
                active
                  ? "border-loam bg-loam text-cream"
                  : "hairline bg-shell text-ink/78 hover:border-clay/50 hover:text-loam",
              )}
            >
              <span
                className={cn(
                  "size-8 rounded-full border shadow-[inset_0_0_0_1px_rgba(255,255,255,0.42)]",
                  active ? "border-cream/45" : "hairline",
                )}
                style={{ backgroundImage: choice.gradient }}
              />
              {choice.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function BouquetPreview({
  flowers,
  palette,
  size,
  flight,
}: {
  flowers: FloralChoice[];
  palette: PaletteChoice;
  size: SizeChoice;
  flight: { key: number; choice: FloralChoice; lane: number } | null;
}) {
  const sizeScale = { small: 0.9, medium: 1, large: 1.08, "extra-large": 1.16 }[size.id];

  return (
    <div className="bouquet-stage relative min-h-[560px] overflow-hidden rounded-[2rem] border hairline bg-shell shadow-[var(--shadow-lift)]">
      <div
        className="absolute inset-0 opacity-[0.13]"
        style={{ backgroundImage: palette.gradient }}
      />
      <img
        src={heroBouquet}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.1]"
      />
      <div className="absolute inset-0 bg-cream/74" />
      <div className="absolute inset-x-0 bottom-0 flex h-[86%] items-end justify-center pb-12">
        <div
          className="relative h-[390px] w-[330px]"
          style={{ transform: `scale(${sizeScale})`, transformOrigin: "50% 100%" }}
        >
          <div className="bouquet-paper bouquet-paper-left" />
          <div className="bouquet-paper bouquet-paper-right" />
          <div className="bouquet-ribbon" />
          <div className="bouquet-shadow" />
          {flowers.map((flower, index) => (
            <FlowerStem key={`${flower.id}-${index}`} flower={flower} index={index} />
          ))}
          {flight && <FlyingFlower key={flight.key} flower={flight.choice} lane={flight.lane} />}
        </div>
      </div>
    </div>
  );
}

function FlowerStem({ flower, index }: { flower: FloralChoice; index: number }) {
  const slots = [
    { left: 48, bottom: 76, rotate: -10, scale: 1.08 },
    { left: 36, bottom: 66, rotate: -22, scale: 0.95 },
    { left: 59, bottom: 68, rotate: 17, scale: 0.98 },
    { left: 43, bottom: 54, rotate: -5, scale: 0.86 },
    { left: 63, bottom: 54, rotate: 25, scale: 0.8 },
    { left: 29, bottom: 50, rotate: -31, scale: 0.76 },
  ];
  const slot = slots[index % slots.length];
  const isFiller = flower.kind === "filler";

  return (
    <div
      className="bouquet-stem absolute"
      style={{
        left: `${slot.left}%`,
        bottom: `${slot.bottom}px`,
        transform: `translateX(-50%) rotate(${slot.rotate}deg) scale(${slot.scale})`,
        zIndex: 20 + index,
      }}
    >
      <span className="flower-stalk" />
      <span className="flower-leaf flower-leaf-a" />
      <span className="flower-leaf flower-leaf-b" />
      {isFiller ? (
        <FillerHead tone={flower.tone} accent={flower.accent} />
      ) : (
        <Bloom tone={flower.tone} accent={flower.accent} />
      )}
    </div>
  );
}

function FlyingFlower({ flower, lane }: { flower: FloralChoice; lane: number }) {
  return (
    <div className="bouquet-flight absolute" style={{ ["--lane" as string]: lane, zIndex: 60 }}>
      <span className="flower-stalk" />
      <span className="flower-leaf flower-leaf-a" />
      <span className="flower-leaf flower-leaf-b" />
      {flower.kind === "filler" ? (
        <FillerHead tone={flower.tone} accent={flower.accent} />
      ) : (
        <Bloom tone={flower.tone} accent={flower.accent} />
      )}
    </div>
  );
}

function Bloom({ tone, accent }: { tone: string; accent?: string }) {
  return (
    <span
      className="bloom"
      style={{ ["--bloom" as string]: tone, ["--bloom-soft" as string]: accent || tone }}
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <span
          key={index}
          className="bloom-petal"
          style={{ transform: `translate(-50%, -50%) rotate(${index * 45}deg) translateY(-18px)` }}
        />
      ))}
      <span className="bloom-heart" />
    </span>
  );
}

function FillerHead({ tone, accent }: { tone: string; accent?: string }) {
  return (
    <span
      className="filler-head"
      style={{ ["--bloom" as string]: tone, ["--bloom-soft" as string]: accent || tone }}
    >
      {Array.from({ length: 7 }).map((_, index) => (
        <span
          key={index}
          className="filler-leaflet"
          style={{ transform: `rotate(${index * 28 - 78}deg) translateY(-${18 + index * 2}px)` }}
        />
      ))}
      <span className="filler-bud filler-bud-a" />
      <span className="filler-bud filler-bud-b" />
    </span>
  );
}

function MiniBloom({ tone, accent }: { tone: string; accent?: string }) {
  return (
    <span className="relative inline-block size-4" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <span
          key={index}
          className="absolute left-1/2 top-1/2 h-2.5 w-1.5 origin-bottom rounded-full"
          style={{
            background: accent || tone,
            transform: `translate(-50%, -85%) rotate(${index * 60}deg)`,
          }}
        />
      ))}
      <span
        className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: tone }}
      />
    </span>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  const prefix = label === "Bouquet Base" ? "" : "+ ";
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums text-ink/85">
        {prefix}
        {formatSGD(value)}
      </dd>
    </div>
  );
}
