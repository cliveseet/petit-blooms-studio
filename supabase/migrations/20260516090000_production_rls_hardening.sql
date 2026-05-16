CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = 'denise@petitblooms.com'
ON CONFLICT (user_id, role) DO NOTHING;

DELETE FROM public.discount_codes
WHERE code IN (concat('BLOOM', '10'), concat('PETIT', '5'));

DELETE FROM public.user_roles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE lower(email) = concat('admin', '@', 'test.com')
);

DELETE FROM public.profiles
WHERE lower(email) = concat('admin', '@', 'test.com')
   OR user_id IN (
     SELECT id FROM auth.users WHERE lower(email) = concat('admin', '@', 'test.com')
   );

DELETE FROM auth.identities
WHERE user_id IN (
  SELECT id FROM auth.users WHERE lower(email) = concat('admin', '@', 'test.com')
);

DELETE FROM auth.users
WHERE lower(email) = concat('admin', '@', 'test.com');

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_adjustments ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT SELECT ON public.discount_codes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.discount_codes TO authenticated;
GRANT SELECT ON public.pricing_adjustments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pricing_adjustments TO authenticated;

DROP POLICY IF EXISTS "admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins update profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "users update own profile" ON public.profiles;

CREATE POLICY "users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_admin_user());
CREATE POLICY "admins insert profiles" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_user());
CREATE POLICY "admins update profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY "admins delete profiles" ON public.profiles
  FOR DELETE TO authenticated USING (public.is_admin_user());

DROP POLICY IF EXISTS "users view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins update roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins delete roles" ON public.user_roles;

CREATE POLICY "users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_admin_user());
CREATE POLICY "admins insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_user());
CREATE POLICY "admins update roles" ON public.user_roles
  FOR UPDATE TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY "admins delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.is_admin_user());

DROP POLICY IF EXISTS "users view own orders" ON public.orders;
DROP POLICY IF EXISTS "users create own orders" ON public.orders;
DROP POLICY IF EXISTS "users delete own unpaid orders" ON public.orders;
DROP POLICY IF EXISTS "admins view all orders" ON public.orders;
DROP POLICY IF EXISTS "admins insert orders" ON public.orders;
DROP POLICY IF EXISTS "admins update orders" ON public.orders;
DROP POLICY IF EXISTS "admins delete orders" ON public.orders;

CREATE POLICY "users view own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users create own orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own unpaid orders" ON public.orders
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND payment_status IN ('unpaid', 'failed', 'cancelled'));
CREATE POLICY "admins view all orders" ON public.orders
  FOR SELECT TO authenticated USING (public.is_admin_user());
CREATE POLICY "admins insert orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_user());
CREATE POLICY "admins update orders" ON public.orders
  FOR UPDATE TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY "admins delete orders" ON public.orders
  FOR DELETE TO authenticated USING (public.is_admin_user());

DROP POLICY IF EXISTS "users view own order items" ON public.order_items;
DROP POLICY IF EXISTS "users create order items for own orders" ON public.order_items;
DROP POLICY IF EXISTS "admins view all order items" ON public.order_items;
DROP POLICY IF EXISTS "admins insert order items" ON public.order_items;
DROP POLICY IF EXISTS "admins update order items" ON public.order_items;
DROP POLICY IF EXISTS "admins delete order items" ON public.order_items;

CREATE POLICY "users view own order items" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
    )
  );
CREATE POLICY "users create order items for own orders" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
    )
  );
CREATE POLICY "admins view all order items" ON public.order_items
  FOR SELECT TO authenticated USING (public.is_admin_user());
CREATE POLICY "admins insert order items" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_user());
CREATE POLICY "admins update order items" ON public.order_items
  FOR UPDATE TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY "admins delete order items" ON public.order_items
  FOR DELETE TO authenticated USING (public.is_admin_user());

DROP POLICY IF EXISTS "public read active menu items" ON public.menu_items;
DROP POLICY IF EXISTS "admins read all menu items" ON public.menu_items;
DROP POLICY IF EXISTS "admins select menu items" ON public.menu_items;
DROP POLICY IF EXISTS "admins insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "admins update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "admins delete menu items" ON public.menu_items;

CREATE POLICY "public read active menu items" ON public.menu_items
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL AND archived = false);
CREATE POLICY "admins select menu items" ON public.menu_items
  FOR SELECT TO authenticated USING (public.is_admin_user());
CREATE POLICY "admins insert menu items" ON public.menu_items
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_user());
CREATE POLICY "admins update menu items" ON public.menu_items
  FOR UPDATE TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY "admins delete menu items" ON public.menu_items
  FOR DELETE TO authenticated USING (public.is_admin_user());

DROP POLICY IF EXISTS "customers read usable discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "admins select discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "admins insert discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "admins update discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "admins delete discount codes" ON public.discount_codes;

CREATE POLICY "customers read usable discount codes" ON public.discount_codes
  FOR SELECT TO authenticated
  USING (active = true AND (expires_at IS NULL OR expires_at >= CURRENT_DATE));
CREATE POLICY "admins select discount codes" ON public.discount_codes
  FOR SELECT TO authenticated USING (public.is_admin_user());
CREATE POLICY "admins insert discount codes" ON public.discount_codes
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_user());
CREATE POLICY "admins update discount codes" ON public.discount_codes
  FOR UPDATE TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY "admins delete discount codes" ON public.discount_codes
  FOR DELETE TO authenticated USING (public.is_admin_user());

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
  FOR SELECT TO authenticated USING (public.is_admin_user());
CREATE POLICY "admins insert pricing adjustments" ON public.pricing_adjustments
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_user());
CREATE POLICY "admins update pricing adjustments" ON public.pricing_adjustments
  FOR UPDATE TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY "admins delete pricing adjustments" ON public.pricing_adjustments
  FOR DELETE TO authenticated USING (public.is_admin_user());
