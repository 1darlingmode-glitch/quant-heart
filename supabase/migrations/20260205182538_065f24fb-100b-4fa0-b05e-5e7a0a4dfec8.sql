-- Create trading_rules table for user's checklist rules
CREATE TABLE public.trading_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  weight_percentage NUMERIC NOT NULL DEFAULT 10,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trade_evaluations table to store which rules were met for each trade
CREATE TABLE public.trade_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.trading_rules(id) ON DELETE CASCADE,
  is_met BOOLEAN NOT NULL DEFAULT false,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trade_id, rule_id)
);

-- Add reliability_score column to trades table
ALTER TABLE public.trades ADD COLUMN reliability_score NUMERIC;

-- Enable RLS on trading_rules
ALTER TABLE public.trading_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trading rules" 
ON public.trading_rules FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trading rules" 
ON public.trading_rules FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trading rules" 
ON public.trading_rules FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trading rules" 
ON public.trading_rules FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on trade_evaluations
ALTER TABLE public.trade_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own evaluations" 
ON public.trade_evaluations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own evaluations" 
ON public.trade_evaluations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own evaluations" 
ON public.trade_evaluations FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own evaluations" 
ON public.trade_evaluations FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_trading_rules_updated_at
BEFORE UPDATE ON public.trading_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();