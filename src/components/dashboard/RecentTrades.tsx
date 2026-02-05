import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const trades = [
  {
    id: 1,
    symbol: "AAPL",
    type: "Long",
    entry: 178.5,
    exit: 185.2,
    pnl: 670,
    pnlPercent: 3.75,
    date: "Today, 2:34 PM",
    market: "Stocks",
  },
  {
    id: 2,
    symbol: "EUR/USD",
    type: "Short",
    entry: 1.0892,
    exit: 1.0845,
    pnl: 470,
    pnlPercent: 0.43,
    date: "Today, 11:20 AM",
    market: "Forex",
  },
  {
    id: 3,
    symbol: "BTC/USDT",
    type: "Long",
    entry: 42150,
    exit: 41800,
    pnl: -350,
    pnlPercent: -0.83,
    date: "Yesterday",
    market: "Crypto",
  },
  {
    id: 4,
    symbol: "ES",
    type: "Long",
    entry: 4520,
    exit: 4548,
    pnl: 1400,
    pnlPercent: 0.62,
    date: "Yesterday",
    market: "Futures",
  },
  {
    id: 5,
    symbol: "TSLA",
    type: "Short",
    entry: 245.8,
    exit: 238.2,
    pnl: 760,
    pnlPercent: 3.09,
    date: "Dec 28",
    market: "Stocks",
  },
];

const marketColors: Record<string, string> = {
  Stocks: "bg-chart-1/10 text-chart-1",
  Forex: "bg-chart-2/10 text-chart-2",
  Crypto: "bg-chart-3/10 text-chart-3",
  Futures: "bg-chart-4/10 text-chart-4",
  Options: "bg-chart-5/10 text-chart-5",
};

export function RecentTrades() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card rounded-xl border border-border shadow-card"
    >
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Recent Trades</h3>
            <p className="text-sm text-muted-foreground">
              Your latest trading activity
            </p>
          </div>
          <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            View all
          </button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {trades.map((trade, index) => (
          <motion.div
            key={trade.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
            className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    trade.pnl >= 0 ? "bg-profit/10" : "bg-loss/10"
                  )}
                >
                  {trade.pnl >= 0 ? (
                    <ArrowUpRight className="w-5 h-5 text-profit" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-loss" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{trade.symbol}</span>
                    <Badge
                      variant="secondary"
                      className={cn("text-xs", marketColors[trade.market])}
                    >
                      {trade.market}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {trade.type} • {trade.date}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={cn(
                    "font-semibold",
                    trade.pnl >= 0 ? "text-profit" : "text-loss"
                  )}
                >
                  {trade.pnl >= 0 ? "+" : ""}${Math.abs(trade.pnl).toLocaleString()}
                </p>
                <p
                  className={cn(
                    "text-sm",
                    trade.pnl >= 0 ? "text-profit/80" : "text-loss/80"
                  )}
                >
                  {trade.pnlPercent >= 0 ? "+" : ""}
                  {trade.pnlPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
