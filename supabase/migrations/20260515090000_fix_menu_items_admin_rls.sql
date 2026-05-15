-- Repair menu_items admin access. Run this in the Supabase SQL Editor if the
-- admin dashboard still reports row-level security errors.

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

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) IN ('denise@petitblooms.com', 'admin@test.com')
ON CONFLICT (user_id, role) DO NOTHING;

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;

DROP POLICY IF EXISTS "public read active menu items" ON public.menu_items;
DROP POLICY IF EXISTS "admins select menu items" ON public.menu_items;
DROP POLICY IF EXISTS "admins insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "admins update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "admins delete menu items" ON public.menu_items;
DROP POLICY IF EXISTS "admins manage menu items" ON public.menu_items;

CREATE POLICY "public read active menu items" ON public.menu_items
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL AND archived = false);

CREATE POLICY "admins select menu items" ON public.menu_items
  FOR SELECT TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "admins insert menu items" ON public.menu_items
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user());

CREATE POLICY "admins update menu items" ON public.menu_items
  FOR UPDATE TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY "admins delete menu items" ON public.menu_items
  FOR DELETE TO authenticated
  USING (public.is_admin_user());

INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "public read menu images" ON storage.objects;
DROP POLICY IF EXISTS "admins upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "admins update menu images" ON storage.objects;
DROP POLICY IF EXISTS "admins delete menu images" ON storage.objects;

CREATE POLICY "public read menu images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'menu-images');

CREATE POLICY "admins upload menu images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'menu-images'
    AND public.is_admin_user()
  );

CREATE POLICY "admins update menu images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'menu-images'
    AND public.is_admin_user()
  )
  WITH CHECK (
    bucket_id = 'menu-images'
    AND public.is_admin_user()
  );

CREATE POLICY "admins delete menu images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'menu-images'
    AND public.is_admin_user()
  );
