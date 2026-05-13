-- Add recipient details and per-item handwritten note messages for checkout orders.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS recipient_name TEXT,
  ADD COLUMN IF NOT EXISTS recipient_phone TEXT,
  ADD COLUMN IF NOT EXISTS delivery_instructions TEXT;

UPDATE public.orders
SET
  recipient_name = COALESCE(recipient_name, contact_name),
  recipient_phone = COALESCE(recipient_phone, contact_phone)
WHERE recipient_name IS NULL
   OR recipient_phone IS NULL;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS personal_message TEXT NOT NULL DEFAULT 'NIL';
