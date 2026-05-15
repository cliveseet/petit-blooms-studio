import fallbackImage from "@/assets/product-petit-signature.jpg";
import {
  products as localProducts,
  type Category,
  type Occasion,
  type OptionChoice,
  type OptionGroup,
  type Product,
} from "@/lib/products";
import type { Database, Json } from "@/integrations/supabase/types";
import { applyPricingAdjustments, type PricingAdjustmentRow } from "@/lib/promotions";

export type MenuItemRow = Database["public"]["Tables"]["menu_items"]["Row"];
export type MenuItemInsert = Database["public"]["Tables"]["menu_items"]["Insert"];

export const categoryOptions: Array<{ value: Category; label: string }> = [
  { value: "fresh", label: "Fresh" },
  { value: "preserved", label: "Preserved" },
  { value: "accessories", label: "Accessories" },
];

export const occasionOptions: Array<{ value: Occasion; label: string }> = [
  { value: "romance", label: "Romance" },
  { value: "birthday", label: "Birthday" },
  { value: "celebration", label: "Celebration" },
  { value: "everyday", label: "Everyday" },
  { value: "get-well", label: "Get Well Soon" },
  { value: "sympathy", label: "Sympathy" },
];

export const defaultPersonalisationPrompt =
  "A note for your recipient — leave blank if not required.";

export const colourSwatches: Record<string, string> = {
  pink: "#f5c6cf",
  red: "#a8323a",
  white: "#f4ede1",
  cappuccino: "#bfa085",
  "dark-blue": "#28406b",
  "mixed-blues": "linear-gradient(135deg,#28406b 0%,#4866a0 50%,#9fb6dc 100%)",
  "mixed-pinks": "linear-gradient(135deg,#a8323a 0%,#e6a4b1 50%,#f5d3da 100%)",
  pastels: "linear-gradient(135deg,#f5d3da 0%,#f5e6c8 33%,#cdd9ec 66%,#e7dcd0 100%)",
  dark: "linear-gradient(135deg,#5a1a26 0%,#7a2a3e 33%,#5a2b6e 66%,#2a1a4f 100%)",
  rich: "linear-gradient(135deg,#5a1a26 0%,#a8323a 33%,#6a2a5e 66%,#3a1a4f 100%)",
  emerald: "#2f5a45",
  purple: "#6a4f88",
  green: "#6e8266",
  khaki: "#a89a72",
  blue: "#4f6f96",
  "silver-white": "linear-gradient(135deg,#e0e0d8 0%,#f5ede0 50%,#cfcfc8 100%)",
  black: "#1c1a17",
  newspaper: "linear-gradient(135deg,#bfb8a6 0%,#e8e2d3 50%,#9a8c70 100%)",
  brown: "#7a5640",
  "white-grad": "#f4ede1",
  "brown-grad": "linear-gradient(135deg,#f4ede1 0%,#bfa085 50%,#7a5640 100%)",
  soft: "linear-gradient(135deg,#f5d3da 0%,#f8e0d4 50%,#f4ede1 100%)",
  whispers: "linear-gradient(135deg,#f5d3da 0%,#f8e0d4 50%,#f4ede1 100%)",
  classics: "linear-gradient(135deg,#a8323a 0%,#d49b9f 50%,#f4ede1 100%)",
  helios: "linear-gradient(135deg,#e6b94f 0%,#d49b9f 100%)",
};

const categories = new Set<Category>(["fresh", "preserved", "accessories"]);
const occasions = new Set<Occasion>(occasionOptions.map((o) => o.value));

function normaliseOccasion(value: string): Occasion[] {
  const cleaned = value.trim().toLowerCase();
  if (occasions.has(cleaned as Occasion)) return [cleaned as Occasion];
  if (cleaned === "anniversary" || cleaned === "wedding") return ["romance", "celebration"];
  if (cleaned === "get well" || cleaned === "get well soon") return ["get-well"];
  return [];
}

export const defaultProducts: Product[] = localProducts.map((product, index) => ({
  ...product,
  defaultPersonalisationPrompt,
  sortOrder: (index + 1) * 10,
  source: "local",
}));

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function toNumber(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function normaliseChoices(value: unknown): OptionChoice[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isObject).map((choice) => ({
    value: String(choice.value ?? slugify(String(choice.label ?? "choice"))),
    label: String(choice.label ?? choice.value ?? "Choice"),
    ...(choice.priceDelta != null ? { priceDelta: toNumber(choice.priceDelta) } : {}),
    ...(choice.setsPriceTo != null ? { setsPriceTo: toNumber(choice.setsPriceTo) } : {}),
    ...(typeof choice.swatch === "string" && choice.swatch ? { swatch: choice.swatch } : {}),
  }));
}

export function normaliseOptions(value: unknown): OptionGroup[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isObject)
    .map((group) => ({
      id: String(group.id ?? slugify(String(group.label ?? "option"))),
      label: String(group.label ?? group.id ?? "Option"),
      required: Boolean(group.required),
      choices: normaliseChoices(group.choices),
    }))
    .filter((group) => group.choices.length > 0);
}

export function rowToProduct(row: MenuItemRow, local?: Product): Product {
  const category = categories.has(row.category as Category) ? (row.category as Category) : "fresh";
  const rowOccasions = Array.from(
    new Set(row.occasions.flatMap((item) => normaliseOccasion(item))),
  );

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category,
    occasions: rowOccasions,
    basePrice: Number(row.base_price),
    fromPrice: row.from_price,
    image: row.image_url || local?.image || fallbackImage,
    shortDescription: row.short_description,
    description: row.description,
    options: normaliseOptions(row.options),
    addOns: row.add_ons,
    defaultPersonalisationPrompt:
      row.default_personalisation_prompt || defaultPersonalisationPrompt,
    sortOrder: row.sort_order,
    archived: row.archived,
    deletedAt: row.deleted_at,
    source: "database",
  };
}

export function mergeMenuProducts(
  rows: MenuItemRow[] = [],
  includeArchived = false,
  pricingAdjustments: PricingAdjustmentRow[] = [],
): Product[] {
  const map = new Map<string, Product>();
  for (const product of defaultProducts) {
    map.set(product.slug, product);
  }

  for (const row of rows) {
    const local = map.get(row.slug);
    if (row.deleted_at) {
      map.delete(row.slug);
      continue;
    }
    map.set(row.slug, rowToProduct(row, local));
  }

  return Array.from(map.values())
    .filter((product) => includeArchived || !product.archived)
    .map((product) => applyPricingAdjustments(product, pricingAdjustments))
    .sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999) || a.name.localeCompare(b.name));
}

export function productToMenuInsert(
  product: Product,
  overrides: Partial<MenuItemInsert> = {},
): MenuItemInsert {
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    occasions: product.occasions,
    base_price: product.basePrice,
    from_price: product.fromPrice,
    image_url: product.image,
    short_description: product.shortDescription,
    description: product.description,
    options: product.options as unknown as Json,
    add_ons: product.addOns ?? [],
    default_personalisation_prompt:
      product.defaultPersonalisationPrompt || defaultPersonalisationPrompt,
    sort_order: product.sortOrder ?? 999,
    archived: product.archived ?? false,
    source: product.source === "local" ? "local_override" : "admin",
    deleted_at: product.deletedAt ?? null,
    ...overrides,
  };
}

export function isColourGroup(group: OptionGroup) {
  return /colour|color|scheme/i.test(group.label) || group.id === "colour" || group.id === "scheme";
}

export function isSizeOrCountGroup(group: OptionGroup) {
  return /size|stalk|bundle/i.test(group.label) || group.id === "size" || group.id === "stalks";
}

export function choiceSwatch(choice: OptionChoice) {
  return choice.swatch || colourSwatches[choice.value];
}
