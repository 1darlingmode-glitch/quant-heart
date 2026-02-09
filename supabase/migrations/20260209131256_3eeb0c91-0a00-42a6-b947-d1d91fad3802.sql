
-- Demo trades spanning the last 30 days with realistic trading data
INSERT INTO trades (user_id, symbol, market, trade_type, entry_price, exit_price, entry_date, exit_date, size, pnl, status, strategy, reliability_score, notes) VALUES
-- Today
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'AAPL', 'stocks', 'long', 182.50, 185.20, now() - interval '3 hours', now() - interval '1 hour', 50, 135.00, 'closed', 'Momentum', 85, 'Clean breakout above resistance'),
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'TSLA', 'stocks', 'short', 245.00, 248.50, now() - interval '5 hours', now() - interval '4 hours', 20, -70.00, 'closed', 'Mean Reversion', 60, 'Stopped out, reversal failed'),
-- Yesterday
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'MSFT', 'stocks', 'long', 415.30, 420.10, now() - interval '1 day 6 hours', now() - interval '1 day 2 hours', 30, 144.00, 'closed', 'Breakout', 90, 'Held through pullback'),
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'SPY', 'stocks', 'long', 520.00, 518.50, now() - interval '1 day 4 hours', now() - interval '1 day 3 hours', 100, -150.00, 'closed', 'Scalp', 45, 'Chased entry'),
-- 2 days ago
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'NVDA', 'stocks', 'long', 875.00, 892.00, now() - interval '2 days 7 hours', now() - interval '2 days 1 hour', 10, 170.00, 'closed', 'Momentum', 95, 'Perfect setup'),
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'AMD', 'stocks', 'long', 165.00, 163.20, now() - interval '2 days 5 hours', now() - interval '2 days 3 hours', 40, -72.00, 'closed', 'Breakout', 55, 'False breakout'),
-- 3 days ago
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'EUR/USD', 'forex', 'long', 1.0850, 1.0892, now() - interval '3 days 8 hours', now() - interval '3 days 2 hours', 10000, 42.00, 'closed', 'Trend Following', 80, 'Rode the trend'),
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'GBP/USD', 'forex', 'short', 1.2650, 1.2620, now() - interval '3 days 6 hours', now() - interval '3 days 4 hours', 10000, 30.00, 'closed', 'Mean Reversion', 75, 'Good entry'),
-- 4 days ago
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'BTC/USD', 'crypto', 'long', 62500, 63800, now() - interval '4 days 10 hours', now() - interval '4 days 3 hours', 0.5, 650.00, 'closed', 'Breakout', 88, 'Breakout above consolidation'),
-- 5 days ago
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'META', 'stocks', 'long', 505.00, 498.00, now() - interval '5 days 6 hours', now() - interval '5 days 2 hours', 15, -105.00, 'closed', 'Momentum', 40, 'Bad timing'),
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'GOOGL', 'stocks', 'long', 175.00, 178.50, now() - interval '5 days 5 hours', now() - interval '5 days 1 hour', 50, 175.00, 'closed', 'Trend Following', 82, 'Followed the trend nicely'),
-- 7 days ago
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'ETH/USD', 'crypto', 'long', 3400, 3520, now() - interval '7 days 8 hours', now() - interval '7 days 2 hours', 2, 240.00, 'closed', 'Breakout', 78, 'Good risk management'),
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'AMZN', 'stocks', 'short', 185.00, 182.50, now() - interval '7 days 6 hours', now() - interval '7 days 3 hours', 40, 100.00, 'closed', 'Mean Reversion', 70, 'Overbought reversal'),
-- 10 days ago
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'QQQ', 'stocks', 'long', 480.00, 485.20, now() - interval '10 days 5 hours', now() - interval '10 days 1 hour', 30, 156.00, 'closed', 'Momentum', 85, 'Strong momentum play'),
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'USD/JPY', 'forex', 'short', 154.50, 155.10, now() - interval '10 days 4 hours', now() - interval '10 days 2 hours', 10000, -60.00, 'closed', 'Scalp', 50, 'Wrong direction'),
-- 14 days ago
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'NFLX', 'stocks', 'long', 620.00, 635.00, now() - interval '14 days 7 hours', now() - interval '14 days 2 hours', 10, 150.00, 'closed', 'Breakout', 92, 'Earnings play worked'),
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'SOL/USD', 'crypto', 'long', 145.00, 138.00, now() - interval '14 days 5 hours', now() - interval '14 days 3 hours', 10, -70.00, 'closed', 'Momentum', 35, 'Crypto dump'),
-- 20 days ago
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'DIS', 'stocks', 'long', 112.00, 115.80, now() - interval '20 days 6 hours', now() - interval '20 days 1 hour', 50, 190.00, 'closed', 'Trend Following', 88, 'Held for the full move'),
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'BA', 'stocks', 'short', 195.00, 198.00, now() - interval '20 days 4 hours', now() - interval '20 days 2 hours', 20, -60.00, 'closed', 'Mean Reversion', 52, 'Stopped out'),
-- 25 days ago
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'COIN', 'stocks', 'long', 225.00, 240.00, now() - interval '25 days 8 hours', now() - interval '25 days 1 hour', 15, 225.00, 'closed', 'Breakout', 90, 'Crypto correlation play'),
-- Open trade
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'AAPL', 'stocks', 'long', 184.00, NULL, now() - interval '2 hours', NULL, 30, NULL, 'open', 'Momentum', 80, 'Watching for breakout');

-- Demo trading rules
INSERT INTO trading_rules (user_id, title, description, weight_percentage, sort_order, is_active) VALUES
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'Wait for confirmation', 'Never enter before the setup confirms on the chart', 20, 1, true),
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'Risk max 1% per trade', 'Position size so max loss is 1% of account', 25, 2, true),
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'Set stop loss before entry', 'Always have a stop loss placed before entering', 20, 3, true),
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'No revenge trading', 'Walk away after 2 consecutive losses', 15, 4, true),
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'Follow the plan', 'Stick to pre-market analysis and planned setups', 20, 5, true);
