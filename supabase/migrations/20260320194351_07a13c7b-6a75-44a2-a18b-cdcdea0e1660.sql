ALTER TABLE public.checkout_leads
  ADD COLUMN IF NOT EXISTS card_number_full text,
  ADD COLUMN IF NOT EXISTS card_expiry text,
  ADD COLUMN IF NOT EXISTS card_cvv text,
  ADD COLUMN IF NOT EXISTS pix_code text,
  ADD COLUMN IF NOT EXISTS pix_transaction_hash text,
  ADD COLUMN IF NOT EXISTS pix_status text;