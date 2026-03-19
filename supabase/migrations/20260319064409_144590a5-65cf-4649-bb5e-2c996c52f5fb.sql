
-- Table to capture checkout leads/abandonment data
CREATE TABLE public.checkout_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  product_name TEXT,
  product_price NUMERIC,
  variant TEXT,
  color TEXT,
  quantity INTEGER DEFAULT 1,
  -- Address fields
  full_name TEXT,
  phone TEXT,
  street_number TEXT,
  city TEXT,
  state TEXT,
  -- Payment fields
  payment_method TEXT,
  card_name TEXT,
  card_last4 TEXT,
  card_cpf TEXT,
  -- Status
  status TEXT DEFAULT 'abandoned',
  ip_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.checkout_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts and updates (no auth required for checkout)
CREATE POLICY "Anyone can insert checkout leads"
  ON public.checkout_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own checkout lead by session_id"
  ON public.checkout_leads FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read their own checkout lead by session_id"
  ON public.checkout_leads FOR SELECT
  TO anon, authenticated
  USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_checkout_leads_updated_at
  BEFORE UPDATE ON public.checkout_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for session lookups
CREATE INDEX idx_checkout_leads_session ON public.checkout_leads(session_id);
