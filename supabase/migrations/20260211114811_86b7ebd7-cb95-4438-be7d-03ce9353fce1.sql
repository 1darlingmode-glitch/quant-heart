
CREATE TABLE public.user_s3_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  access_key_id TEXT NOT NULL,
  secret_access_key TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'auto',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_s3_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own s3 credentials" ON public.user_s3_credentials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own s3 credentials" ON public.user_s3_credentials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own s3 credentials" ON public.user_s3_credentials FOR DELETE USING (auth.uid() = user_id);
