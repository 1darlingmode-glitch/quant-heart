import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import type { Trade } from "@/hooks/useTrades";

const marketColors: Record<string, string> = {
  Stocks: "bg-chart-1/10 text-chart-1",
  stocks: "bg-chart-1/10 text-chart-1",
  Forex: "bg-chart-2/10 text-chart-2",
  forex: "bg-chart-2/10 text-chart-2",
  Crypto: "bg-chart-3/10 text-chart-3",
  crypto: "bg-chart-3/10 text-chart-3",
  Futures: "bg-chart-4/10 text-chart-4",
  futures: "bg-chart-4/10 text-chart-4",
  Options: "bg-chart-5/10 text-chart-5",
  options: "bg-chart-5/10 text-chart-5",
};

interface RecentTradesProps {
  trades: Trade[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today, ${format(date, "h:mm a")}`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, "MMM d");
  };

  const calculatePnlPercent = (trade: Trade) => {
    if (!trade.pnl || !trade.entry_price || !trade.size) return 0;
    const investment = trade.entry_price * trade.size;
    return investment > 0 ? (trade.pnl / investment) * 100 : 0;
  };

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
        {trades.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No trades recorded yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add trades to see your activity here
            </p>
          </div>
        ) : (
          trades.map((trade, index) => {
            const pnl = trade.pnl || 0;
            const pnlPercent = calculatePnlPercent(trade);
            const marketKey = trade.market.charAt(0).toUpperCase() + trade.market.slice(1);

            return (
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
                        pnl >= 0 ? "bg-profit/10" : "bg-loss/10"
                      )}
                    >
                      {pnl >= 0 ? (
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
                          className={cn("text-xs", marketColors[trade.market] || marketColors[marketKey])}
                        >
                          {marketKey}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {trade.trade_type.charAt(0).toUpperCase() + trade.trade_type.slice(1)} • {formatDate(trade.exit_date || trade.entry_date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={cn(
                        "font-semibold",
                        pnl >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {pnl >= 0 ? "+" : ""}${Math.abs(pnl).toLocaleString()}
                    </p>
                    <p
                      className={cn(
                        "text-sm",
                        pnl >= 0 ? "text-profit/80" : "text-loss/80"
                      )}
                    >
                      {pnlPercent >= 0 ? "+" : ""}
                      {pnlPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
