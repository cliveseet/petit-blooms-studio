import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Archive,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useMenuProducts } from "@/hooks/use-menu-products";
import {
  categoryOptions,
  choiceSwatch,
  defaultPersonalisationPrompt,
  defaultProducts,
  isColourGroup,
  isSizeOrCountGroup,
  occasionOptions,
  productToMenuInsert,
  slugify,
} from "@/lib/menu";
import {
  occasionLabels,
  type Category,
  type Occasion,
  type OptionChoice,
  type OptionGroup,
  type Product,
} from "@/lib/products";
import { cn } from "@/lib/utils";
import { formatSGD } from "@/lib/cart";
import { sanitizeMultiline, sanitizeText } from "@/lib/sanitize";

type Draft = Product & { isNew?: boolean };
type ConfirmAction = { type: "archive" | "remove"; product: Product } | null;
type GradientDraft = { label: string; a: string; b: string; c: string };

const defaultGradient: GradientDraft = {
  label: "Soft garden mix",
  a: "#f5d3da",
  b: "#f8e0d4",
  c: "#d9e4d0",
};

function draftFromProduct(product: Product): Draft {
  return {
    ...product,
    occasions: [...product.occasions],
    options: product.options
      .filter((group) => isSizeOrCountGroup(group) || isColourGroup(group))
      .map((group) => ({
        ...group,
        choices: group.choices.map((choice) => ({ ...choice })),
      })),
    addOns: [...(product.addOns ?? [])],
    defaultPersonalisationPrompt:
      product.defaultPersonalisationPrompt || defaultPersonalisationPrompt,
  };
}

function newDraft(nextOrder: number): Draft {
  return {
    slug: "",
    name: "",
    category: "fresh",
    occasions: ["everyday"],
    basePrice: 45,
    fromPrice: false,
    image: "",
    shortDescription: "",
    description: "",
    options: [],
    addOns: [],
    defaultPersonalisationPrompt,
    sortOrder: nextOrder,
    archived: false,
    deletedAt: null,
    source: "database",
    isNew: true,
  };
}

function uniqueSlug(name: string, products: Product[], currentSlug?: string) {
  const base = slugify(name) || "new-menu-item";
  let slug = base;
  let index = 2;
  const used = new Set(
    products
      .map((product) => product.slug)
      .filter((candidate) => candidate && candidate !== currentSlug),
  );
  while (used.has(slug)) {
    slug = `${base}-${index}`;
    index += 1;
  }
  return slug;
}

function gradientValue(gradient: GradientDraft) {
  return `linear-gradient(135deg,${gradient.a} 0%,${gradient.b} 50%,${gradient.c} 100%)`;
}

function sanitizeChoice(choice: OptionChoice): OptionChoice {
  const label = sanitizeText(choice.label, 80);
  return {
    ...choice,
    value: slugify(label || choice.value) || choice.value,
    label,
    ...(choice.swatch ? { swatch: sanitizeText(choice.swatch, 300) } : {}),
  };
}

function sanitizeOptionGroup(group: OptionGroup): OptionGroup {
  return {
    ...group,
    id: sanitizeText(group.id, 60),
    label: sanitizeText(group.label, 80),
    choices: group.choices.map(sanitizeChoice).filter((choice) => choice.label),
  };
}

function swatchStyle(value?: string) {
  if (!value) return { backgroundColor: "var(--shell)" };
  return value.startsWith("linear-gradient")
    ? { backgroundImage: value }
    : { backgroundColor: value };
}

function categoryLabel(value: Category) {
  return categoryOptions.find((option) => option.value === value)?.label ?? value;
}

function formatOccasions(values: Occasion[]) {
  return values
    .map((value) => occasionLabels[value])
    .filter(Boolean)
    .join(", ");
}

async function uploadMenuImage(file: File, slug: string) {
  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${slug}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from("menu-images")
    .upload(path, file, { contentType: file.type || "image/jpeg" });

  if (error) throw error;

  const { data } = supabase.storage.from("menu-images").getPublicUrl(path);
  return data.publicUrl;
}

function editorOptions(options: OptionGroup[]) {
  return options.filter((group) => isSizeOrCountGroup(group) || isColourGroup(group));
}

function tierChoices(draft: Draft) {
  return draft.options.find(isSizeOrCountGroup)?.choices ?? [];
}

function colourChoices(draft: Draft) {
  return draft.options.find(isColourGroup)?.choices ?? [];
}

export function MenuManagement() {
  const { products, loading, error, refresh } = useMenuProducts(true, false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [gradient, setGradient] = useState(defaultGradient);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const nextOrder = useMemo(
    () => Math.max(0, ...products.map((product) => product.sortOrder ?? 0)) + 10,
    [products],
  );

  const openDraft = (product: Product) => {
    setDraft(draftFromProduct(product));
    setImageFile(null);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  };

  const updateDraft = (patch: Partial<Draft>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  };

  const saveDraft = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      toast.error("Add the product name first.");
      return;
    }

    const name = sanitizeText(draft.name, 140);
    const slug = draft.slug || uniqueSlug(name, products, draft.slug);
    const options = editorOptions(draft.options).map(sanitizeOptionGroup);
    const tierGroup = options.find(isSizeOrCountGroup);
    const colourGroup = options.find(isColourGroup);
    const tierPrices = tierGroup?.choices
      .map((choice) => Number(choice.setsPriceTo))
      .filter((price) => Number.isFinite(price) && price >= 0);

    if (tierGroup && (!tierPrices || tierPrices.length === 0)) {
      toast.error("Add at least one tiered price, or turn Tiered Pricing off.");
      return;
    }

    if (colourGroup && colourGroup.choices.length === 0) {
      toast.error("Add at least one colour choice, or turn the colour picker off.");
      return;
    }

    const basePrice = tierPrices?.length ? Math.min(...tierPrices) : Number(draft.basePrice);
    if (!Number.isFinite(basePrice) || basePrice < 0) {
      toast.error("Enter a valid base price.");
      return;
    }

    setSaving(true);
    try {
      const image = imageFile
        ? await uploadMenuImage(imageFile, slug)
        : sanitizeText(draft.image, 900);
      const product: Product = {
        ...draft,
        slug,
        name,
        basePrice,
        fromPrice: Boolean(tierGroup),
        image,
        shortDescription: sanitizeMultiline(draft.shortDescription, 280),
        description: sanitizeMultiline(draft.description, 1200),
        options,
        defaultPersonalisationPrompt:
          sanitizeText(draft.defaultPersonalisationPrompt, 160) || defaultPersonalisationPrompt,
        source: draft.source === "local" ? "local" : "database",
      };

      const { error: saveError } = await supabase
        .from("menu_items")
        .upsert(productToMenuInsert(product), { onConflict: "slug" });

      if (saveError) {
        toast.error(saveError.message);
        return;
      }

      toast.success("Menu item saved.");
      setDraft(null);
      setImageFile(null);
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      await refresh();
    } catch (saveError) {
      toast.error(
        saveError instanceof Error ? saveError.message : "The menu item could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  };

  const moveProduct = async (product: Product, direction: -1 | 1) => {
    const index = products.findIndex((candidate) => candidate.slug === product.slug);
    const target = products[index + direction];
    if (!target) return;

    const first = { ...product, sortOrder: target.sortOrder ?? 0 };
    const second = { ...target, sortOrder: product.sortOrder ?? 0 };
    const { error: reorderError } = await supabase
      .from("menu_items")
      .upsert([productToMenuInsert(first), productToMenuInsert(second)], { onConflict: "slug" });

    if (reorderError) {
      toast.error(reorderError.message);
      return;
    }

    await refresh();
  };

  const archiveProduct = async (product: Product) => {
    const { error: archiveError } = await supabase
      .from("menu_items")
      .upsert(productToMenuInsert({ ...product, archived: !product.archived }), {
        onConflict: "slug",
      });

    if (archiveError) {
      toast.error(archiveError.message);
      return;
    }

    toast.success(product.archived ? "Item restored." : "Item archived.");
    setConfirm(null);
    await refresh();
  };

  const removeProduct = async (product: Product) => {
    const isLocalDefault = defaultProducts.some((candidate) => candidate.slug === product.slug);
    const { error: removeError } = isLocalDefault
      ? await supabase.from("menu_items").upsert(
          productToMenuInsert({
            ...product,
            archived: true,
            deletedAt: new Date().toISOString(),
          }),
          { onConflict: "slug" },
        )
      : await supabase.from("menu_items").delete().eq("slug", product.slug);

    if (removeError) {
      toast.error(removeError.message);
      return;
    }

    toast.success("Item removed from the menu.");
    setConfirm(null);
    if (draft?.slug === product.slug) setDraft(null);
    await refresh();
  };

  const liveProducts = products.filter((product) => !product.archived);
  const archivedProducts = products.filter((product) => product.archived);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,480px)]">
      <section className="overflow-hidden rounded-2xl border hairline bg-shell shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b hairline px-5 py-4 md:px-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-clay">Menu Management</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add, edit, order, archive or remove shop pieces.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              setDraft(newDraft(nextOrder));
              setImageFile(null);
              setPreviewUrl((current) => {
                if (current) URL.revokeObjectURL(current);
                return null;
              });
            }}
            className="text-xs uppercase tracking-[0.2em]"
          >
            <Plus className="size-4" />
            New item
          </Button>
        </div>

        {error && (
          <div className="border-b hairline bg-blush/50 px-5 py-3 text-xs text-loam md:px-6">
            {error}
          </div>
        )}

        <div className="divide-y hairline">
          {loading ? (
            <div className="flex min-h-60 items-center justify-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-clay" />
              Loading menu...
            </div>
          ) : products.length === 0 ? (
            <div className="min-h-60 px-6 py-16 text-center">
              <p className="font-serif-italic text-xl text-loam">No menu pieces yet.</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Choose New item to add the first bouquet to the collection.
              </p>
            </div>
          ) : (
            <>
              <ProductList
                title="Live collection"
                products={liveProducts}
                allProducts={products}
                confirm={confirm}
                onConfirm={setConfirm}
                onEdit={openDraft}
                onMove={moveProduct}
                onArchive={archiveProduct}
                onRemove={removeProduct}
              />
              <ProductList
                title="Archived items"
                description="Hidden from the shop until restored."
                products={archivedProducts}
                allProducts={products}
                archived
                confirm={confirm}
                onConfirm={setConfirm}
                onEdit={openDraft}
                onMove={moveProduct}
                onArchive={archiveProduct}
                onRemove={removeProduct}
              />
            </>
          )}
        </div>
      </section>

      <ProductEditor
        draft={draft}
        imageFile={imageFile}
        previewUrl={previewUrl}
        gradient={gradient}
        saving={saving}
        onGradientChange={setGradient}
        onImageFileChange={(file) => {
          setImageFile(file);
          setPreviewUrl((current) => {
            if (current) URL.revokeObjectURL(current);
            return file ? URL.createObjectURL(file) : null;
          });
        }}
        onChange={updateDraft}
        onCancel={() => {
          setDraft(null);
          setImageFile(null);
          setPreviewUrl((current) => {
            if (current) URL.revokeObjectURL(current);
            return null;
          });
        }}
        onSave={saveDraft}
      />
    </div>
  );
}

function ProductList({
  title,
  description,
  products,
  allProducts,
  archived = false,
  confirm,
  onConfirm,
  onEdit,
  onMove,
  onArchive,
  onRemove,
}: {
  title: string;
  description?: string;
  products: Product[];
  allProducts: Product[];
  archived?: boolean;
  confirm: ConfirmAction;
  onConfirm: (value: ConfirmAction) => void;
  onEdit: (product: Product) => void;
  onMove: (product: Product, direction: -1 | 1) => Promise<void>;
  onArchive: (product: Product) => Promise<void>;
  onRemove: (product: Product) => Promise<void>;
}) {
  return (
    <div>
      <div className="bg-cream/35 px-5 py-3 md:px-6">
        <p className="text-[10px] uppercase tracking-[0.28em] text-clay">{title}</p>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      {products.length === 0 ? (
        <div className="px-5 py-8 text-sm text-muted-foreground md:px-6">
          {archived ? "No archived items." : "No live items."}
        </div>
      ) : (
        products.map((product) => (
          <ProductRow
            key={product.slug}
            product={product}
            index={allProducts.findIndex((candidate) => candidate.slug === product.slug)}
            total={allProducts.length}
            archived={archived}
            confirm={confirm}
            onConfirm={onConfirm}
            onEdit={onEdit}
            onMove={onMove}
            onArchive={onArchive}
            onRemove={onRemove}
          />
        ))
      )}
    </div>
  );
}

function ProductRow({
  product,
  index,
  total,
  archived,
  confirm,
  onConfirm,
  onEdit,
  onMove,
  onArchive,
  onRemove,
}: {
  product: Product;
  index: number;
  total: number;
  archived: boolean;
  confirm: ConfirmAction;
  onConfirm: (value: ConfirmAction) => void;
  onEdit: (product: Product) => void;
  onMove: (product: Product, direction: -1 | 1) => Promise<void>;
  onArchive: (product: Product) => Promise<void>;
  onRemove: (product: Product) => Promise<void>;
}) {
  return (
    <article className="border-t hairline px-5 py-5 md:px-6">
      <div className="flex gap-4">
        <img
          src={product.image}
          alt={product.name}
          className={cn("h-24 w-20 flex-none rounded-md object-cover", archived && "opacity-45")}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg leading-tight text-loam">{product.name}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {categoryLabel(product.category)} ·{" "}
                {formatOccasions(product.occasions) || "No occasion"}
              </p>
            </div>
            <p className="font-display text-base tabular-nums text-loam">
              {product.fromPrice ? "from " : ""}
              {formatSGD(product.basePrice)}
            </p>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/70">
            {product.shortDescription || "No short description yet."}
          </p>

          {archived && (
            <span className="mt-3 inline-flex rounded-md border border-bronze/30 bg-blush px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-loam">
              Archived
            </span>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onEdit(product)}>
              Edit
            </Button>
            {!archived && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => void onMove(product, -1)}
                >
                  <ChevronUp className="size-4" />
                  Up
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={index === total - 1}
                  onClick={() => void onMove(product, 1)}
                >
                  <ChevronDown className="size-4" />
                  Down
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onConfirm({ type: "archive", product })}
            >
              {archived ? <RotateCcw className="size-4" /> : <Archive className="size-4" />}
              {archived ? "Restore item" : "Archive"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onConfirm({ type: "remove", product })}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>

          {confirm?.product.slug === product.slug && (
            <div className="mt-4 rounded-xl border hairline bg-shell p-4 shadow-[var(--shadow-soft)]">
              <p className="font-display text-base text-loam">
                {confirm.type === "archive"
                  ? archived
                    ? "Restore this item?"
                    : "Archive this item?"
                  : "Permanently remove this item?"}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {confirm.type === "archive"
                  ? archived
                    ? "Restoring brings this piece back to the public collection."
                    : "Archiving hides the piece from the public shop without deleting it."
                  : "This permanently removes the piece from the menu. Please confirm before continuing."}
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    confirm.type === "archive" ? void onArchive(product) : void onRemove(product)
                  }
                >
                  Confirm
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => onConfirm(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function ProductEditor({
  draft,
  imageFile,
  previewUrl,
  gradient,
  saving,
  onGradientChange,
  onImageFileChange,
  onChange,
  onCancel,
  onSave,
}: {
  draft: Draft | null;
  imageFile: File | null;
  previewUrl: string | null;
  gradient: GradientDraft;
  saving: boolean;
  onGradientChange: (value: GradientDraft) => void;
  onImageFileChange: (file: File | null) => void;
  onChange: (patch: Partial<Draft>) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!draft) {
    return (
      <aside className="rounded-2xl border hairline bg-shell p-8 text-center shadow-[var(--shadow-soft)] lg:sticky lg:top-28 lg:self-start">
        <p className="font-serif-italic text-xl text-loam">Choose a piece to update.</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Select a bouquet from the list to adjust its photo, pricing, colours and position in the
          collection. To add something new, choose New item.
        </p>
      </aside>
    );
  }

  const selectedOccasions = new Set(draft.occasions);
  const tierGroup = draft.options.find(isSizeOrCountGroup);
  const colourGroup = draft.options.find(isColourGroup);
  const hasTieredPricing = Boolean(tierGroup);
  const hasColourPicker = Boolean(colourGroup);
  const tiers = tierChoices(draft);
  const colours = colourChoices(draft);
  const previewImage = previewUrl || draft.image;
  const currentGradient = gradientValue(gradient);

  const replaceOption = (predicate: (group: OptionGroup) => boolean, nextGroup: OptionGroup) => {
    const others = draft.options.filter((group) => !predicate(group));
    onChange({ options: [...others, nextGroup] });
  };

  const removeOption = (predicate: (group: OptionGroup) => boolean) => {
    onChange({ options: draft.options.filter((group) => !predicate(group)) });
  };

  const setTieredPricing = (enabled: boolean) => {
    if (!enabled) {
      removeOption(isSizeOrCountGroup);
      onChange({ fromPrice: false });
      return;
    }

    const base = Number(draft.basePrice) || 45;
    replaceOption(isSizeOrCountGroup, {
      id: "stalks",
      label: "Stalks",
      required: true,
      choices: [
        { value: "3-stalks", label: "3 stalks", setsPriceTo: base },
        { value: "6-stalks", label: "6 stalks", setsPriceTo: base + 20 },
      ],
    });
    onChange({ fromPrice: true });
  };

  const updateTier = (index: number, patch: Partial<OptionChoice>) => {
    if (!tierGroup) return;
    const nextChoices = tiers.map((choice, choiceIndex) =>
      choiceIndex === index
        ? {
            ...choice,
            ...patch,
            value: patch.label ? slugify(patch.label) : choice.value,
          }
        : choice,
    );
    replaceOption(isSizeOrCountGroup, { ...tierGroup, choices: nextChoices });
  };

  const addTier = () => {
    const nextIndex = tiers.length + 1;
    replaceOption(isSizeOrCountGroup, {
      ...(tierGroup ?? { id: "stalks", label: "Stalks", required: true }),
      choices: [
        ...tiers,
        {
          value: `${nextIndex}-stalks`,
          label: `${nextIndex} stalks`,
          setsPriceTo: Number(draft.basePrice) || 45,
        },
      ],
    });
  };

  const removeLastTier = () => {
    if (!tierGroup || tiers.length <= 1) return;
    replaceOption(isSizeOrCountGroup, { ...tierGroup, choices: tiers.slice(0, -1) });
  };

  const setColourPicker = (enabled: boolean) => {
    if (!enabled) {
      removeOption(isColourGroup);
      return;
    }
    replaceOption(isColourGroup, {
      id: "colour",
      label: "Colour",
      required: true,
      choices: [
        {
          value: slugify(defaultGradient.label),
          label: defaultGradient.label,
          swatch: gradientValue(defaultGradient),
        },
      ],
    });
  };

  const addGradientChoice = () => {
    const nextChoice = {
      value: slugify(gradient.label),
      label: gradient.label,
      swatch: currentGradient,
    };
    replaceOption(isColourGroup, {
      ...(colourGroup ?? { id: "colour", label: "Colour", required: true }),
      choices: [...colours, nextChoice],
    });
  };

  const removeColour = (index: number) => {
    if (!colourGroup) return;
    replaceOption(isColourGroup, {
      ...colourGroup,
      choices: colours.filter((_, choiceIndex) => choiceIndex !== index),
    });
  };

  return (
    <aside className="rounded-2xl border hairline bg-shell p-6 shadow-[var(--shadow-soft)] lg:sticky lg:top-28 lg:self-start">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-clay">
            {draft.isNew ? "New menu item" : "Edit menu item"}
          </p>
          <h2 className="mt-2 font-display text-2xl text-loam">{draft.name || "Untitled"}</h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close editor"
          className="rounded-md p-1 text-clay transition-colors hover:bg-cream hover:text-loam focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="mt-6 space-y-6">
        <Field label="Product name">
          <Input value={draft.name} onChange={(event) => onChange({ name: event.target.value })} />
        </Field>

        <Field label="Image upload">
          <div className="grid gap-3">
            {previewImage && (
              <img
                src={previewImage}
                alt={draft.name || "Menu item preview"}
                className="aspect-[4/3] w-full rounded-md object-cover"
              />
            )}
            <label className="group flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border hairline bg-shell px-4 py-5 text-center transition-colors hover:border-clay/50 hover:bg-cream/60">
              <ImagePlus className="size-5 text-clay transition-colors group-hover:text-loam" />
              <span className="mt-2 text-xs uppercase tracking-[0.22em] text-loam">
                Upload image
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                {imageFile ? imageFile.name : "JPG, PNG or WebP"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => onImageFileChange(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </Field>

        <Field label="Category">
          <Select
            value={draft.category}
            onValueChange={(value) => onChange({ category: value as Category })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Occasions">
          <div className="flex flex-wrap gap-2">
            {occasionOptions.map((option) => {
              const active = selectedOccasions.has(option.value);
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() =>
                    onChange({
                      occasions: active
                        ? draft.occasions.filter((item) => item !== option.value)
                        : [...draft.occasions, option.value],
                    })
                  }
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-xs uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30",
                    active
                      ? "border-loam bg-loam text-cream"
                      : "hairline bg-shell text-ink/75 hover:border-clay/50 hover:text-loam",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Short description">
          <Textarea
            value={draft.shortDescription}
            onChange={(event) => onChange({ shortDescription: event.target.value })}
            rows={2}
          />
        </Field>

        <Field label="Long description">
          <Textarea
            value={draft.description}
            onChange={(event) => onChange({ description: event.target.value })}
            rows={4}
          />
        </Field>

        <TogglePanel
          title="Tiered Pricing"
          enabled={hasTieredPricing}
          onChange={setTieredPricing}
          disabledContent={
            <Field label="Base price">
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.basePrice}
                onChange={(event) => onChange({ basePrice: Number(event.target.value) })}
              />
            </Field>
          }
        >
          <div className="rounded-xl border hairline bg-shell p-3">
            <div className="grid grid-cols-2 gap-3 px-1 pb-2 text-[10px] uppercase tracking-[0.22em] text-clay">
              <div>Stalks</div>
              <div>Price</div>
            </div>
            <div className="grid gap-2">
              {tiers.map((choice, index) => (
                <div key={`${choice.value}-${index}`} className="grid grid-cols-2 gap-3">
                  <Input
                    value={choice.label}
                    onChange={(event) => updateTier(index, { label: event.target.value })}
                    className="h-9"
                  />
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={choice.setsPriceTo ?? ""}
                    onChange={(event) =>
                      updateTier(index, {
                        setsPriceTo: event.target.value ? Number(event.target.value) : undefined,
                      })
                    }
                    className="h-9"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={addTier}>
              <Plus className="size-4" />
              Add tier
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={tiers.length <= 1}
              onClick={removeLastTier}
            >
              Remove last tier
            </Button>
          </div>
        </TogglePanel>

        <TogglePanel
          title="Colour Gradient Picker"
          enabled={hasColourPicker}
          onChange={setColourPicker}
        >
          <div className="space-y-4">
            <Input
              value={gradient.label}
              onChange={(event) => onGradientChange({ ...gradient, label: event.target.value })}
              placeholder="Palette name"
            />
            <div className="flex items-center gap-3">
              {(["a", "b", "c"] as const).map((key) => (
                <label
                  key={key}
                  className="relative inline-flex size-9 cursor-pointer items-center justify-center rounded-full border hairline"
                  style={{ backgroundColor: gradient[key] }}
                  aria-label={`Gradient colour ${key}`}
                >
                  <input
                    type="color"
                    value={gradient[key]}
                    onChange={(event) =>
                      onGradientChange({ ...gradient, [key]: event.target.value })
                    }
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </label>
              ))}
              <span
                className="inline-block size-9 rounded-full border hairline"
                style={{ backgroundImage: currentGradient }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addGradientChoice}>
                Add colour
              </Button>
            </div>
            {colours.length > 0 && (
              <div className="grid gap-2">
                {colours.map((choice, index) => (
                  <div
                    key={`${choice.value}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-md border hairline bg-shell px-3 py-2"
                  >
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <span
                        className="inline-block size-6 flex-none rounded-full border hairline"
                        style={swatchStyle(choiceSwatch(choice))}
                      />
                      <span className="truncate text-sm text-ink/80">{choice.label}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeColour(index)}
                      className="rounded-md p-1 text-clay transition-colors hover:bg-cream hover:text-loam focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30"
                      aria-label={`Remove ${choice.label}`}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TogglePanel>

        <Field label="Personalised note">
          <Input
            value={draft.defaultPersonalisationPrompt}
            onChange={(event) => onChange({ defaultPersonalisationPrompt: event.target.value })}
            placeholder="Message prompt shown to customers"
          />
        </Field>

        <div className="flex gap-3 border-t hairline pt-5">
          <Button type="button" disabled={saving} onClick={onSave} className="flex-1">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save item
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </aside>
  );
}

function TogglePanel({
  title,
  enabled,
  onChange,
  disabledContent,
  children,
}: {
  title: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabledContent?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border hairline bg-shell p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-clay">{title}</p>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onChange(!enabled)}
          className={cn(
            "relative h-7 w-12 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30",
            enabled ? "border-loam bg-loam" : "hairline bg-shell",
          )}
        >
          <span
            className={cn(
              "absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-cream shadow-[var(--shadow-soft)] transition-transform",
              enabled ? "translate-x-[1.45rem]" : "translate-x-1",
            )}
          />
        </button>
      </div>
      <div className="mt-4">{enabled ? children : disabledContent}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-clay">{label}</Label>
      {children}
    </div>
  );
}
