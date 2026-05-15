import type { Database } from "@/integrations/supabase/types";
import type { CartLine } from "@/lib/cart";
import type { Product } from "@/lib/products";

export type DiscountCodeRow = Database["public"]["Tables"]["discount_codes"]["Row"];
export type PricingAdjustmentRow = Database["public"]["Tables"]["pricing_adjustments"]["Row"];

const today = () => new Date().toISOString().slice(0, 10);

export function roundMoney(value: number) {
  return Math.max(0, Math.round(value * 100) / 100);
}

function appliesToSlug(scope: string, slugs: string[], slug: string) {
  return scope === "all" || slugs.includes(slug);
}

export function isDiscountUsable(code: DiscountCodeRow, date = today()) {
  if (!code.active) return false;
  return !code.expires_at || code.expires_at >= date;
}

export function discountAppliesToLine(code: DiscountCodeRow, line: CartLine) {
  return appliesToSlug(code.scope, code.product_slugs ?? [], line.slug);
}

export function calculateDiscountAmount(code: DiscountCodeRow, lines: CartLine[]) {
  const eligibleSubtotal = lines
    .filter((line) => discountAppliesToLine(code, line))
    .reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  return {
    eligibleSubtotal,
    discount: roundMoney(eligibleSubtotal * (Number(code.percent_off) / 100)),
  };
}

export function isPricingAdjustmentActive(adjustment: PricingAdjustmentRow, date = today()) {
  if (!adjustment.active) return false;
  if (adjustment.starts_on && adjustment.starts_on > date) return false;
  if (adjustment.ends_on && adjustment.ends_on < date) return false;
  return true;
}

export function pricingAppliesToProduct(adjustment: PricingAdjustmentRow, product: Product) {
  return appliesToSlug(adjustment.scope, adjustment.product_slugs ?? [], product.slug);
}

export function applyPricingAdjustments(
  product: Product,
  adjustments: PricingAdjustmentRow[] = [],
  date = today(),
): Product {
  const activeAdjustments = adjustments.filter(
    (adjustment) =>
      isPricingAdjustmentActive(adjustment, date) && pricingAppliesToProduct(adjustment, product),
  );

  if (activeAdjustments.length === 0) return product;

  const factor = activeAdjustments.reduce(
    (current, adjustment) => current * (1 + Number(adjustment.percent_change) / 100),
    1,
  );

  return {
    ...product,
    basePrice: roundMoney(product.basePrice * factor),
    options: product.options.map((group) => ({
      ...group,
      choices: group.choices.map((choice) => ({
        ...choice,
        ...(typeof choice.setsPriceTo === "number"
          ? { setsPriceTo: roundMoney(choice.setsPriceTo * factor) }
          : {}),
        ...(typeof choice.priceDelta === "number"
          ? { priceDelta: roundMoney(choice.priceDelta * factor) }
          : {}),
      })),
    })),
  };
}
