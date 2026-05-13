-- Create a confirmed admin user for local QA of authenticated florist workflows.

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  test_user_id UUID := '11111111-1111-4111-8111-111111111111';
  test_email TEXT := 'admin@test.com';
BEGIN
  SELECT id
  INTO test_user_id
  FROM auth.users
  WHERE lower(email) = test_email
  LIMIT 1;

  IF test_user_id IS NULL THEN
    test_user_id := '11111111-1111-4111-8111-111111111111';
  END IF;

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    is_super_admin
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    test_user_id,
    'authenticated',
    'authenticated',
    test_email,
    crypt('Test1234!', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Admin Test"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    '',
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET
    aud = EXCLUDED.aud,
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_app_meta_data = EXCLUDED.raw_app_meta_data,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = now();

  IF EXISTS (
    SELECT 1
    FROM auth.identities
    WHERE user_id = test_user_id
      AND provider = 'email'
  ) THEN
    UPDATE auth.identities
    SET
      provider_id = test_user_id::text,
      identity_data = jsonb_build_object(
        'sub', test_user_id::text,
        'email', test_email,
        'email_verified', true,
        'phone_verified', false
      ),
      updated_at = now()
    WHERE user_id = test_user_id
      AND provider = 'email';
  ELSE
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      test_user_id,
      test_user_id,
      test_user_id::text,
      jsonb_build_object(
        'sub', test_user_id::text,
        'email', test_email,
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      now(),
      now(),
      now()
    );
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (test_user_id, test_email, 'Admin Test')
  ON CONFLICT (user_id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES
    (test_user_id, 'customer'),
    (test_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
