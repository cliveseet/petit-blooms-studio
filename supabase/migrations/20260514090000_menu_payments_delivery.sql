-- Menu management, payment metadata, and distance-based delivery quotes.

CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fresh', 'preserved', 'accessories')),
  occasions TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
  from_price BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  options JSONB NOT NULL DEFAULT '[]'::JSONB,
  add_ons TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  default_personalisation_prompt TEXT NOT NULL DEFAULT 'A note for your recipient — leave blank if not required.',
  sort_order INTEGER NOT NULL DEFAULT 0,
  archived BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'admin' CHECK (source IN ('admin', 'local_override')),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT menu_items_options_array CHECK (jsonb_typeof(options) = 'array')
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;

DROP POLICY IF EXISTS "public read active menu items" ON public.menu_items;
CREATE POLICY "public read active menu items" ON public.menu_items
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL AND archived = false);

DROP POLICY IF EXISTS "admins select menu items" ON public.menu_items;
CREATE POLICY "admins select menu items" ON public.menu_items
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "admins insert menu items" ON public.menu_items;
CREATE POLICY "admins insert menu items" ON public.menu_items
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "admins update menu items" ON public.menu_items;
CREATE POLICY "admins update menu items" ON public.menu_items
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "admins delete menu items" ON public.menu_items;
CREATE POLICY "admins delete menu items" ON public.menu_items
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "admins manage menu items" ON public.menu_items;

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON public.menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON public.menu_items(archived, deleted_at);

INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "public read menu images" ON storage.objects;
CREATE POLICY "public read menu images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "admins upload menu images" ON storage.objects;
CREATE POLICY "admins upload menu images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'menu-images'
    AND public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "admins update menu images" ON storage.objects;
CREATE POLICY "admins update menu images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'menu-images'
    AND public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    bucket_id = 'menu-images'
    AND public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "admins delete menu images" ON storage.objects;
CREATE POLICY "admins delete menu images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'menu-images'
    AND public.has_role(auth.uid(), 'admin')
  );

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_provider TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'cancelled', 'refunded')),
  ADD COLUMN IF NOT EXISTS hitpay_payment_request_id TEXT,
  ADD COLUMN IF NOT EXISTS hitpay_payment_url TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivery_distance_km NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS delivery_quote_source TEXT,
  ADD COLUMN IF NOT EXISTS delivery_quote_checked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_hitpay_payment_request_id
  ON public.orders(hitpay_payment_request_id);
