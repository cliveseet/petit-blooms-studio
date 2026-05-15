import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { defaultProducts, mergeMenuProducts, type MenuItemRow } from "@/lib/menu";
import type { PricingAdjustmentRow } from "@/lib/promotions";
import type { Product } from "@/lib/products";

type MenuProductsState = {
  products: Product[];
  rows: MenuItemRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useMenuProducts(includeArchived = false, applyPricing = true): MenuProductsState {
  const [rows, setRows] = useState<MenuItemRow[]>([]);
  const [pricingRows, setPricingRows] = useState<PricingAdjustmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const pricingPromise = applyPricing
      ? supabase.from("pricing_adjustments").select("*").order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null });
    const [{ data, error: loadError }, { data: pricingData, error: pricingError }] =
      await Promise.all([
        supabase.from("menu_items").select("*").order("sort_order", { ascending: true }),
        pricingPromise,
      ]);

    if (loadError) {
      setRows([]);
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setRows((data as MenuItemRow[]) ?? []);
    setPricingRows(pricingError ? [] : ((pricingData as PricingAdjustmentRow[]) ?? []));
    setLoading(false);
  }, [applyPricing]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const products = useMemo(() => {
    if (loading && rows.length === 0) {
      return includeArchived
        ? defaultProducts
        : defaultProducts.filter((product) => !product.archived);
    }
    return mergeMenuProducts(rows, includeArchived, pricingRows);
  }, [includeArchived, loading, pricingRows, rows]);

  return { products, rows, loading, error, refresh };
}
