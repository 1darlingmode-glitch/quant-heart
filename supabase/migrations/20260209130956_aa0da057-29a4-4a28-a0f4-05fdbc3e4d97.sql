
-- Insert demo broker accounts (one-time data seed, not a schema change)
-- Using a DO block to insert via the service role which bypasses RLS
INSERT INTO broker_accounts (user_id, name, broker, balance, status, last_sync) VALUES
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'Main Trading', 'Interactive Brokers', 25430.75, 'active', now() - interval '2 hours'),
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'Crypto Portfolio', 'Binance', 8920.50, 'active', now() - interval '30 minutes'),
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'Swing Account', 'TD Ameritrade', 12750.00, 'active', now() - interval '1 day'),
('c8c06764-c962-46a3-917c-02a6cbf56c78', 'Forex Demo', 'MetaTrader 5', 5000.00, 'inactive', now() - interval '7 days');
