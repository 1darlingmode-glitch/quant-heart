
-- Add unique constraint for trade deduplication during MT5 sync
CREATE UNIQUE INDEX idx_trades_dedup ON public.trades (user_id, symbol, entry_date, entry_price);
