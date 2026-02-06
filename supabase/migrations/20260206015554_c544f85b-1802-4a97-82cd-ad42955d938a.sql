-- Enable realtime for trades table
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;

-- Enable realtime for period_records table
ALTER PUBLICATION supabase_realtime ADD TABLE public.period_records;

-- Enable realtime for trading_rules table
ALTER PUBLICATION supabase_realtime ADD TABLE public.trading_rules;

-- Enable realtime for trade_evaluations table
ALTER PUBLICATION supabase_realtime ADD TABLE public.trade_evaluations;