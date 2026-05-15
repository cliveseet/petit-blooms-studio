import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type CSSProperties } from "react";
import { Check } from "lucide-react";
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
      { title: "Bespoke — petit blooms" },
      {
        name: "description",
        content:
          "Build a custom Petit Blooms bouquet by choosing main flowers, fillers, size and palette.",
      },
      { property: "og:title", content: "Bespoke — petit blooms" },
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
  form:
    | "rose"
    | "tulip"
    | "sunflower"
    | "hydrangea"
    | "peony"
    | "ranunculus"
    | "anemone"
    | "lisianthus"
    | "snapdragon"
    | "calla"
    | "carnation"
    | "matthiola"
    | "mixed-filler"
    | "eucalyptus"
    | "babys-breath"
    | "dusty-miller"
    | "fern"
    | "wax-flower"
    | "limonium"
    | "ruscus";
  kind?: "bloom" | "filler";
};

type PaletteChoice = {
  id: string;
  label: string;
  gradient: string;
  wrapStart: string;
  wrapEnd: string;
  ribbon: string;
};

type SizeChoice = {
  id: "small" | "medium" | "large" | "extra-large";
  label: string;
  short: string;
  price: number;
  hint: string;
};

const bouquetBase = 68;

const mainFlowers: FloralChoice[] = [
  { id: "rose", label: "Roses", price: 30, tone: "#c96f7d", accent: "#f4d4da", form: "rose" },
  { id: "tulip", label: "Tulips", price: 29, tone: "#d997a2", accent: "#f8dfd7", form: "tulip" },
  {
    id: "sunflower",
    label: "Sunflowers",
    price: 27,
    tone: "#d9a93d",
    accent: "#5f3f24",
    form: "sunflower",
  },
  {
    id: "hydrangea",
    label: "Hydrangea",
    price: 43,
    tone: "#8aa6cf",
    accent: "#d6e2ef",
    form: "hydrangea",
  },
  { id: "peony", label: "Peonies", price: 50, tone: "#e6a4b1", accent: "#f7d8df", form: "peony" },
  {
    id: "ranunculus",
    label: "Ranunculus",
    price: 38,
    tone: "#f0b7a4",
    accent: "#f8e0d4",
    form: "ranunculus",
  },
  {
    id: "anemone",
    label: "Anemones",
    price: 41,
    tone: "#3d3158",
    accent: "#f4ede1",
    form: "anemone",
  },
  {
    id: "lisianthus",
    label: "Lisianthus",
    price: 34,
    tone: "#d8c3e8",
    accent: "#f1e8f6",
    form: "lisianthus",
  },
  {
    id: "snapdragon",
    label: "Snapdragons",
    price: 34,
    tone: "#f3c7d1",
    accent: "#f8e6ea",
    form: "snapdragon",
  },
  {
    id: "calla",
    label: "Calla lilies",
    price: 41,
    tone: "#f4ede1",
    accent: "#c7a76c",
    form: "calla",
  },
  {
    id: "carnation",
    label: "Carnations",
    price: 24,
    tone: "#e0a6b0",
    accent: "#f1d0d6",
    form: "carnation",
  },
  {
    id: "matthiola",
    label: "Matthiola",
    price: 27,
    tone: "#c6b7d6",
    accent: "#eee7f2",
    form: "matthiola",
  },
];

const fillerFlowers: FloralChoice[] = [
  {
    id: "mixed-fillers",
    label: "Mixed Fillers",
    price: 10,
    tone: "#d9e4d0",
    accent: "#f4ede1",
    form: "mixed-filler",
    kind: "filler",
  },
  {
    id: "eucalyptus",
    label: "Eucalyptus",
    price: 14,
    tone: "#8fa085",
    accent: "#dfe7da",
    form: "eucalyptus",
    kind: "filler",
  },
  {
    id: "babys-breath",
    label: "Baby's breath",
    price: 12,
    tone: "#f4ede1",
    accent: "#d5cbb8",
    form: "babys-breath",
    kind: "filler",
  },
  {
    id: "dusty-miller",
    label: "Dusty miller",
    price: 14,
    tone: "#b9c4b3",
    accent: "#edf0ea",
    form: "dusty-miller",
    kind: "filler",
  },
  {
    id: "fern",
    label: "Fern",
    price: 12,
    tone: "#6e8266",
    accent: "#b7c3ad",
    form: "fern",
    kind: "filler",
  },
  {
    id: "wax-flower",
    label: "Wax flower",
    price: 13,
    tone: "#ead0d8",
    accent: "#f7eef1",
    form: "wax-flower",
    kind: "filler",
  },
  {
    id: "limonium",
    label: "Limonium",
    price: 12,
    tone: "#b5a1cf",
    accent: "#eee7f4",
    form: "limonium",
    kind: "filler",
  },
  {
    id: "ruscus",
    label: "Ruscus",
    price: 13,
    tone: "#5f754f",
    accent: "#b8c6ae",
    form: "ruscus",
    kind: "filler",
  },
];

const sizeOptions: SizeChoice[] = [
  { id: "small", label: "Petit", short: "P", price: 0, hint: "A compact hand-tied form." },
  { id: "medium", label: "Maison", short: "M", price: 15, hint: "Balanced volume for gifting." },
  {
    id: "large",
    label: "Luxe",
    short: "L",
    price: 32,
    hint: "A wider face and fuller profile.",
  },
  {
    id: "extra-large",
    label: "Grand",
    short: "G",
    price: 60,
    hint: "A generous studio-scale arrangement.",
  },
];

const palettes: PaletteChoice[] = [
  {
    id: "soft-garden",
    label: "Soft Garden",
    gradient: "linear-gradient(135deg,#f5d3da 0%,#f8e0d4 45%,#d9e4d0 100%)",
    wrapStart: "#f7ece6",
    wrapEnd: "#d9e4d0",
    ribbon: "#2f5a45",
  },
  {
    id: "rosewater",
    label: "Rosewater",
    gradient: "linear-gradient(135deg,#b96a72 0%,#e5aab5 45%,#f6e2dc 100%)",
    wrapStart: "#f6e2dc",
    wrapEnd: "#e5aab5",
    ribbon: "#7e3944",
  },
  {
    id: "buttercream",
    label: "Buttercream",
    gradient: "linear-gradient(135deg,#f4ede1 0%,#e9d5a8 45%,#b9c4a4 100%)",
    wrapStart: "#fbf1df",
    wrapEnd: "#e9d5a8",
    ribbon: "#7b6a3e",
  },
  {
    id: "blue-mist",
    label: "Blue Mist",
    gradient: "linear-gradient(135deg,#6f87aa 0%,#c8d8e9 52%,#f4ede1 100%)",
    wrapStart: "#eef4f8",
    wrapEnd: "#c8d8e9",
    ribbon: "#435d83",
  },
  {
    id: "wine-garden",
    label: "Wine Garden",
    gradient: "linear-gradient(135deg,#5a1a26 0%,#a8323a 38%,#d8b8c0 100%)",
    wrapStart: "#f0dce0",
    wrapEnd: "#d8b8c0",
    ribbon: "#5a1a26",
  },
  {
    id: "denise-choice",
    label: "Denise's Choice",
    gradient: "linear-gradient(135deg,#2f5a45 0%,#d9e4d0 48%,#f4ede1 100%)",
    wrapStart: "#f4ede1",
    wrapEnd: "#d9e4d0",
    ribbon: "#2f5a45",
  },
];

const mixedPreview: FloralChoice[] = [fillerFlowers[1], fillerFlowers[2], fillerFlowers[5]].filter(
  Boolean,
);

type PreviewFlower = {
  id: string;
  choice: FloralChoice;
  groupIndex: number;
  repeatIndex: number;
};

const bloomSlots = [
  { left: 50, top: 23, rotate: -3, scale: 1.08, z: 36 },
  { left: 42, top: 31, rotate: -14, scale: 0.98, z: 33 },
  { left: 59, top: 31, rotate: 13, scale: 1, z: 34 },
  { left: 50, top: 39, rotate: 5, scale: 0.98, z: 40 },
  { left: 35, top: 42, rotate: -25, scale: 0.88, z: 29 },
  { left: 66, top: 43, rotate: 22, scale: 0.88, z: 30 },
  { left: 42, top: 51, rotate: -9, scale: 0.8, z: 37 },
  { left: 58, top: 51, rotate: 14, scale: 0.8, z: 38 },
  { left: 50, top: 57, rotate: -1, scale: 0.76, z: 39 },
];

const fillerSlots = [
  { left: 32, top: 24, rotate: -32, scale: 0.86, z: 18 },
  { left: 68, top: 24, rotate: 32, scale: 0.86, z: 18 },
  { left: 25, top: 38, rotate: -50, scale: 0.8, z: 20 },
  { left: 75, top: 39, rotate: 50, scale: 0.8, z: 20 },
  { left: 41, top: 18, rotate: -14, scale: 0.76, z: 17 },
  { left: 59, top: 18, rotate: 16, scale: 0.76, z: 17 },
  { left: 35, top: 53, rotate: -22, scale: 0.68, z: 28 },
  { left: 65, top: 53, rotate: 22, scale: 0.68, z: 28 },
];

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
  const previewFlowers = useMemo<PreviewFlower[]>(() => {
    const expandedFillers = fillers.includes("mixed-fillers") ? mixedPreview : fillerSelections;
    const fillerPreview = expandedFillers.flatMap((flower, groupIndex) =>
      Array.from({ length: 2 }, (_, repeatIndex) => ({
        id: `filler-${flower.id}-${groupIndex}-${repeatIndex}`,
        choice: flower,
        groupIndex,
        repeatIndex,
      })),
    );
    const mainPreview = mainSelections.flatMap((flower, groupIndex) =>
      Array.from({ length: 3 }, (_, repeatIndex) => ({
        id: `main-${flower.id}-${groupIndex}-${repeatIndex}`,
        choice: flower,
        groupIndex,
        repeatIndex,
      })),
    );
    return [...fillerPreview, ...mainPreview];
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
      slug: "bespoke-bouquet",
      name: "Bespoke Bouquet",
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
    toast.success("Bespoke Bouquet added to your bag.");
  };

  return (
    <div className="bg-cream">
      <section className="container-page grid gap-12 py-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(380px,0.75fr)] lg:gap-14 lg:py-24">
        <div>
          <p className="text-[11px] uppercase tracking-[0.34em] text-clay">Bespoke</p>
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
              Add bespoke bouquet
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
                    active ? "border-cream/40 bg-cream/10" : "hairline bg-shell",
                  )}
                >
                  {active ? <Check className="size-4" /> : <MiniFlower choice={choice} />}
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
        <h2 className="font-display text-xl text-loam md:text-2xl">Size</h2>
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
  flowers: PreviewFlower[];
  palette: PaletteChoice;
  size: SizeChoice;
  flight: { key: number; choice: FloralChoice; lane: number } | null;
}) {
  const sizeScale = { small: 0.96, medium: 1.05, large: 1.14, "extra-large": 1.22 }[size.id];

  return (
    <div
      className="bouquet-stage relative min-h-[560px] overflow-hidden rounded-[2rem] border hairline bg-shell shadow-[var(--shadow-lift)]"
      style={
        {
          ["--wrap-start" as string]: palette.wrapStart,
          ["--wrap-end" as string]: palette.wrapEnd,
          ["--wrap-ribbon" as string]: palette.ribbon,
        } as CSSProperties
      }
    >
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
          className="bouquet-arrangement relative h-[410px] w-[350px]"
          style={{ transform: `scale(${sizeScale})`, transformOrigin: "50% 100%" }}
        >
          <div className="bouquet-shadow" />
          <BouquetGreenery />
          {flowers.map((stem, index) => (
            <BouquetBloom key={stem.id} stem={stem} index={index} />
          ))}
          <BouquetWrap />
          {flight && <FlyingFlower key={flight.key} flower={flight.choice} lane={flight.lane} />}
        </div>
      </div>
    </div>
  );
}

function BouquetGreenery() {
  return (
    <svg className="bouquet-greenery" viewBox="0 0 320 340" aria-hidden="true">
      {[
        ["M154 255 C123 189 91 132 50 68 C93 111 128 171 166 255 Z", -14],
        ["M166 255 C199 187 233 130 273 72 C232 114 196 174 154 255 Z", 14],
        ["M158 252 C136 179 132 121 139 70 C157 133 165 190 168 252 Z", -3],
        ["M164 252 C188 184 200 127 197 72 C174 132 160 190 154 252 Z", 7],
      ].map(([path, rotate], index) => (
        <path
          key={`stem-${index}`}
          className="bouquet-greenery-stem"
          d={path}
          transform={`rotate(${rotate} 160 260)`}
        />
      ))}
      {[
        [70, 104, -38, 1],
        [98, 148, -34, 0.92],
        [123, 190, -28, 0.86],
        [241, 109, 38, 1],
        [216, 151, 34, 0.92],
        [190, 193, 28, 0.86],
        [147, 93, -12, 0.9],
        [180, 96, 16, 0.9],
        [115, 122, -18, 0.78],
        [211, 125, 20, 0.78],
      ].map(([x, y, rotate, scale], index) => (
        <path
          key={`leaf-${index}`}
          className="bouquet-greenery-leaf"
          d="M0 0 C-22 -9 -30 -31 -18 -48 C4 -39 15 -17 0 0 Z"
          transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}
        />
      ))}
    </svg>
  );
}

function BouquetWrap() {
  return (
    <svg className="bouquet-wrap" viewBox="0 0 260 260" aria-hidden="true">
      <path
        className="bouquet-wrap-paper"
        d="M37 74 C70 104 100 124 130 245 C160 124 190 104 223 74 C203 137 178 198 130 245 C82 198 57 137 37 74 Z"
      />
      <path
        className="bouquet-wrap-fold"
        d="M52 88 C86 121 110 154 130 245 C116 160 92 110 52 88 Z"
      />
      <path
        className="bouquet-wrap-fold"
        d="M208 88 C174 121 150 154 130 245 C144 160 168 110 208 88 Z"
      />
      <path
        className="bouquet-wrap-ribbon"
        d="M78 173 C104 166 156 166 182 173 C184 184 178 191 160 190 C148 190 140 185 130 185 C120 185 112 190 100 190 C82 191 76 184 78 173 Z"
      />
    </svg>
  );
}

function BouquetBloom({ stem, index }: { stem: PreviewFlower; index: number }) {
  const slots = stem.choice.kind === "filler" ? fillerSlots : bloomSlots;
  const slot = slots[index % slots.length];

  return (
    <div
      className="bouquet-bloom absolute"
      style={{
        left: `${slot.left}%`,
        top: `${slot.top}%`,
        transform: `translate(-50%, -50%) rotate(${slot.rotate}deg) scale(${slot.scale})`,
        zIndex: slot.z,
      }}
    >
      <FlowerVector flower={stem.choice} />
    </div>
  );
}

function FlyingFlower({ flower, lane }: { flower: FloralChoice; lane: number }) {
  return (
    <div className="bouquet-flight absolute" style={{ ["--lane" as string]: lane, zIndex: 60 }}>
      <FlowerVector flower={flower} />
    </div>
  );
}

function FlowerVector({ flower, mini = false }: { flower: FloralChoice; mini?: boolean }) {
  const style = {
    ["--bloom" as string]: flower.tone,
    ["--bloom-soft" as string]: flower.accent || flower.tone,
  } as CSSProperties;

  return (
    <svg
      viewBox="0 0 120 160"
      aria-hidden="true"
      className={cn("flower-vector", mini && "flower-vector-mini")}
      style={style}
    >
      <path
        className="flower-vector-stem"
        d="M57 156 C56 126 59 102 58 75 C61 73 64 73 66 75 C64 103 63 128 64 156 Z"
      />
      <path className="flower-vector-leaf" d="M59 113 C40 96 33 91 19 94 C30 110 42 116 59 113 Z" />
      <path
        className="flower-vector-leaf flower-vector-leaf-b"
        d="M63 126 C82 111 91 106 104 111 C91 126 78 131 63 126 Z"
      />
      {flower.kind === "filler" ? (
        <FillerVector flower={flower} />
      ) : (
        <BloomVector flower={flower} />
      )}
    </svg>
  );
}

function BloomVector({ flower }: { flower: FloralChoice }) {
  if (flower.form === "rose") {
    return (
      <g className="flower-vector-head">
        {Array.from({ length: 14 }).map((_, index) => (
          <path
            key={`rose-outer-${index}`}
            className="flower-vector-petal flower-vector-petal-soft"
            d="M60 56 C48 42 50 23 60 15 C72 24 73 42 60 56 Z"
            transform={`rotate(${index * 25.7} 60 58) translate(0 -16)`}
          />
        ))}
        {Array.from({ length: 8 }).map((_, index) => (
          <path
            key={`rose-inner-${index}`}
            className="flower-vector-petal"
            d="M60 60 C51 51 52 37 60 31 C68 38 69 51 60 60 Z"
            transform={`rotate(${index * 45 + 12} 60 59) translate(0 -7)`}
          />
        ))}
        <path className="flower-vector-core" d="M51 57 C54 47 66 47 70 56 C67 67 55 68 51 57 Z" />
      </g>
    );
  }

  if (flower.form === "tulip" || flower.form === "calla") {
    return (
      <g className="flower-vector-head">
        <path
          className="flower-vector-petal flower-vector-petal-soft"
          d="M60 68 C45 53 43 26 57 13 C70 29 72 51 60 68 Z"
        />
        <path className="flower-vector-petal" d="M57 70 C39 59 33 35 45 18 C60 31 63 52 57 70 Z" />
        <path className="flower-vector-petal" d="M63 70 C82 59 87 35 75 18 C61 31 58 52 63 70 Z" />
      </g>
    );
  }

  if (flower.form === "sunflower") {
    return (
      <g className="flower-vector-head">
        {Array.from({ length: 18 }).map((_, index) => (
          <path
            key={`sunflower-${index}`}
            className="flower-vector-petal"
            d="M60 55 C52 42 54 29 60 18 C67 29 69 42 60 55 Z"
            transform={`rotate(${index * 20} 60 58) translate(0 -19)`}
          />
        ))}
        <path
          className="flower-vector-core flower-vector-core-dark"
          d="M43 58 C45 43 74 43 77 58 C75 75 46 75 43 58 Z"
        />
      </g>
    );
  }

  if (flower.form === "hydrangea") {
    const clusters = [
      [60, 52, 1],
      [45, 45, 0.9],
      [76, 45, 0.9],
      [41, 61, 0.85],
      [79, 61, 0.85],
      [57, 70, 0.82],
      [67, 32, 0.76],
    ];
    return (
      <g className="flower-vector-head">
        {clusters.map(([x, y, scale], index) => (
          <g key={index} transform={`translate(${x} ${y}) scale(${scale})`}>
            {Array.from({ length: 4 }).map((_, petal) => (
              <path
                key={petal}
                className="flower-vector-petal"
                d="M0 0 C-8 -5 -8 -17 0 -22 C8 -17 8 -5 0 0 Z"
                transform={`rotate(${petal * 90})`}
              />
            ))}
          </g>
        ))}
      </g>
    );
  }

  if (flower.form === "snapdragon" || flower.form === "matthiola") {
    return (
      <g className="flower-vector-head">
        <path className="flower-vector-spike" d="M58 82 C57 55 59 30 61 13 C64 30 64 55 62 82 Z" />
        {Array.from({ length: 8 }).map((_, index) => (
          <path
            key={index}
            className="flower-vector-petal"
            d="M60 70 C48 65 47 52 59 49 C70 53 70 65 60 70 Z"
            transform={`translate(${index % 2 ? 9 : -9} ${-index * 7}) rotate(${index % 2 ? 18 : -18} 60 70) scale(${1 - index * 0.035})`}
          />
        ))}
      </g>
    );
  }

  const petalCount =
    flower.form === "peony"
      ? 18
      : flower.form === "ranunculus"
        ? 20
        : flower.form === "carnation"
          ? 16
          : 12;
  const innerCount = flower.form === "ranunculus" ? 11 : flower.form === "peony" ? 9 : 7;
  return (
    <g className="flower-vector-head">
      {Array.from({ length: petalCount }).map((_, index) => (
        <path
          key={`outer-${index}`}
          className="flower-vector-petal flower-vector-petal-soft"
          d="M60 58 C49 45 51 28 60 18 C70 28 72 45 60 58 Z"
          transform={`rotate(${index * (360 / petalCount)} 60 58) translate(0 -15)`}
        />
      ))}
      {Array.from({ length: innerCount }).map((_, index) => (
        <path
          key={`inner-${index}`}
          className="flower-vector-petal"
          d="M60 60 C52 51 53 39 60 32 C67 39 68 51 60 60 Z"
          transform={`rotate(${index * (360 / innerCount) + 8} 60 59) translate(0 -7)`}
        />
      ))}
      <path
        className={cn("flower-vector-core", flower.form === "anemone" && "flower-vector-core-dark")}
        d="M50 59 C53 49 67 49 70 59 C67 70 53 70 50 59 Z"
      />
    </g>
  );
}

function FillerVector({ flower }: { flower: FloralChoice }) {
  const budForms = flower.form === "babys-breath" || flower.form === "wax-flower";
  if (budForms) {
    return (
      <g className="flower-vector-head">
        <path className="flower-vector-spike" d="M58 96 C57 65 59 33 61 12 C64 35 65 67 62 96 Z" />
        {[
          [44, 41],
          [73, 34],
          [38, 63],
          [78, 61],
          [55, 22],
          [63, 79],
        ].map(([x, y], index) => (
          <g key={index} transform={`translate(${x} ${y}) scale(0.72)`}>
            {Array.from({ length: 5 }).map((_, petal) => (
              <path
                key={petal}
                className="flower-vector-filler-petal"
                d="M0 0 C-5 -4 -5 -11 0 -14 C5 -11 5 -4 0 0 Z"
                transform={`rotate(${petal * 72})`}
              />
            ))}
          </g>
        ))}
      </g>
    );
  }

  return (
    <g className="flower-vector-head">
      <path className="flower-vector-spike" d="M58 104 C55 70 57 36 61 10 C66 39 67 74 62 104 Z" />
      {Array.from({ length: 10 }).map((_, index) => (
        <path
          key={index}
          className="flower-vector-foliage-leaf"
          d="M60 62 C43 55 37 43 43 31 C58 37 65 49 60 62 Z"
          transform={`translate(${index % 2 ? 10 : -10} ${-index * 7}) rotate(${index % 2 ? 38 : -38} 60 62) scale(${1 - index * 0.035})`}
        />
      ))}
    </g>
  );
}

function MiniFlower({ choice }: { choice: FloralChoice }) {
  return <FlowerVector flower={choice} mini />;
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
