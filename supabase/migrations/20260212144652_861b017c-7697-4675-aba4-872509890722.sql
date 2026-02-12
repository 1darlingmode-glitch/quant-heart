
-- Table to store per-user API keys for MT5 EA sync
CREATE TABLE public.user_api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  api_key text NOT NULL UNIQUE,
  label text NOT NULL DEFAULT 'MT5 Sync',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own API keys"
ON public.user_api_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys"
ON public.user_api_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
ON public.user_api_keys FOR DELETE
USING (auth.uid() = user_id);
