import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { defaultProducts, mergeMenuProducts, type MenuItemRow } from "@/lib/menu";
import type { Product } from "@/lib/products";

type MenuProductsState = {
  products: Product[];
  rows: MenuItemRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useMenuProducts(includeArchived = false): MenuProductsState {
  const [rows, setRows] = useState<MenuItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    const { data, error: loadError } = await supabase
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true });

    if (loadError) {
      setRows([]);
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setRows((data as MenuItemRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const products = useMemo(() => {
    if (loading && rows.length === 0) {
      return includeArchived
        ? defaultProducts
        : defaultProducts.filter((product) => !product.archived);
    }
    return mergeMenuProducts(rows, includeArchived);
  }, [includeArchived, loading, rows]);

  return { products, rows, loading, error, refresh };
}
