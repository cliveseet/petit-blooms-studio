-- Discount codes and date-based pricing adjustments for the admin dashboard.

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'::public.app_role
    )
    OR lower(COALESCE(auth.jwt()->>'email', '')) IN (
      'denise@petitblooms.com',
      'admin@test.com'
    )
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  percent_off NUMERIC(5,2) NOT NULL CHECK (percent_off > 0 AND percent_off <= 100),
  expires_at DATE,
  scope TEXT NOT NULL DEFAULT 'all' CHECK (scope IN ('all', 'products')),
  product_slugs TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT discount_codes_products_scope CHECK (
    scope = 'all' OR array_length(product_slugs, 1) > 0
  )
);

CREATE TABLE IF NOT EXISTS public.pricing_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  percent_change NUMERIC(6,2) NOT NULL CHECK (percent_change <> 0 AND percent_change >= -90 AND percent_change <= 300),
  starts_on DATE,
  ends_on DATE,
  scope TEXT NOT NULL DEFAULT 'all' CHECK (scope IN ('all', 'products')),
  product_slugs TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pricing_adjustments_date_order CHECK (
    starts_on IS NULL OR ends_on IS NULL OR ends_on >= starts_on
  ),
  CONSTRAINT pricing_adjustments_products_scope CHECK (
    scope = 'all' OR array_length(product_slugs, 1) > 0
  )
);

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_adjustments ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.discount_codes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.discount_codes TO authenticated;
GRANT SELECT ON public.pricing_adjustments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pricing_adjustments TO authenticated;

DROP POLICY IF EXISTS "customers read usable discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "admins select discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "admins insert discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "admins update discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "admins delete discount codes" ON public.discount_codes;

CREATE POLICY "customers read usable discount codes" ON public.discount_codes
  FOR SELECT TO authenticated
  USING (active = true AND (expires_at IS NULL OR expires_at >= CURRENT_DATE));

CREATE POLICY "admins select discount codes" ON public.discount_codes
  FOR SELECT TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "admins insert discount codes" ON public.discount_codes
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user());

CREATE POLICY "admins update discount codes" ON public.discount_codes
  FOR UPDATE TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY "admins delete discount codes" ON public.discount_codes
  FOR DELETE TO authenticated
  USING (public.is_admin_user());

DROP POLICY IF EXISTS "public read active pricing adjustments" ON public.pricing_adjustments;
DROP POLICY IF EXISTS "admins select pricing adjustments" ON public.pricing_adjustments;
DROP POLICY IF EXISTS "admins insert pricing adjustments" ON public.pricing_adjustments;
DROP POLICY IF EXISTS "admins update pricing adjustments" ON public.pricing_adjustments;
DROP POLICY IF EXISTS "admins delete pricing adjustments" ON public.pricing_adjustments;

CREATE POLICY "public read active pricing adjustments" ON public.pricing_adjustments
  FOR SELECT TO anon, authenticated
  USING (
    active = true
    AND (starts_on IS NULL OR starts_on <= CURRENT_DATE)
    AND (ends_on IS NULL OR ends_on >= CURRENT_DATE)
  );

CREATE POLICY "admins select pricing adjustments" ON public.pricing_adjustments
  FOR SELECT TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "admins insert pricing adjustments" ON public.pricing_adjustments
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user());

CREATE POLICY "admins update pricing adjustments" ON public.pricing_adjustments
  FOR UPDATE TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY "admins delete pricing adjustments" ON public.pricing_adjustments
  FOR DELETE TO authenticated
  USING (public.is_admin_user());

DROP TRIGGER IF EXISTS update_discount_codes_updated_at ON public.discount_codes;
CREATE TRIGGER update_discount_codes_updated_at BEFORE UPDATE ON public.discount_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pricing_adjustments_updated_at ON public.pricing_adjustments;
CREATE TRIGGER update_pricing_adjustments_updated_at BEFORE UPDATE ON public.pricing_adjustments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON public.discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON public.discount_codes(active, expires_at);
CREATE INDEX IF NOT EXISTS idx_pricing_adjustments_active
  ON public.pricing_adjustments(active, starts_on, ends_on);

INSERT INTO public.discount_codes (code, label, percent_off, scope, product_slugs, active)
VALUES
  ('BLOOM10', 'Welcome offer', 10, 'all', '{}'::TEXT[], true),
  ('PETIT5', 'Petit thank you', 5, 'all', '{}'::TEXT[], true)
ON CONFLICT (code) DO NOTHING;
