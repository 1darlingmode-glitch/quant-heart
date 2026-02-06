-- Create period_records table to store user notes and screenshots for trading periods
CREATE TABLE public.period_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  period_label TEXT NOT NULL,
  notes TEXT,
  screenshots TEXT[] DEFAULT '{}',
  -- Cached stats at time of save
  total_trades INTEGER DEFAULT 0,
  winners INTEGER DEFAULT 0,
  losers INTEGER DEFAULT 0,
  win_rate NUMERIC DEFAULT 0,
  gross_pnl NUMERIC DEFAULT 0,
  gross_profit NUMERIC DEFAULT 0,
  gross_loss NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.period_records ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own period records"
ON public.period_records
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own period records"
ON public.period_records
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own period records"
ON public.period_records
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own period records"
ON public.period_records
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_period_records_updated_at
BEFORE UPDATE ON public.period_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for period screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('period-screenshots', 'period-screenshots', true);

-- Create storage policies for screenshots
CREATE POLICY "Period screenshots are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'period-screenshots');

CREATE POLICY "Users can upload their own period screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'period-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own period screenshots"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'period-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own period screenshots"
ON storage.objects
FOR DELETE
USING (bucket_id = 'period-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);