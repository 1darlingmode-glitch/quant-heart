import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Image,
  MessageSquare,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const journalEntries = [
  {
    id: 1,
    symbol: "AAPL",
    market: "Stocks",
    type: "Long",
    date: "Jan 5, 2024",
    time: "2:34 PM",
    entry: 178.5,
    exit: 185.2,
    size: 100,
    pnl: 670,
    pnlPercent: 3.75,
    thesis: "Strong earnings momentum, breakout above 178 resistance with high volume.",
    execution: "Good entry on pullback, held through initial volatility.",
    emotion: "Confident",
    tags: ["Breakout", "Earnings Play"],
    hasScreenshot: true,
    notes: 2,
  },
  {
    id: 2,
    symbol: "EUR/USD",
    market: "Forex",
    type: "Short",
    date: "Jan 5, 2024",
    time: "11:20 AM",
    entry: 1.0892,
    exit: 1.0845,
    size: 50000,
    pnl: 470,
    pnlPercent: 0.43,
    thesis: "ECB dovish pivot, USD strength on strong jobs data.",
    execution: "Entered slightly early, could have waited for confirmation.",
    emotion: "Disciplined",
    tags: ["Macro", "Central Bank"],
    hasScreenshot: true,
    notes: 1,
  },
  {
    id: 3,
    symbol: "BTC/USDT",
    market: "Crypto",
    type: "Long",
    date: "Jan 4, 2024",
    time: "9:15 AM",
    entry: 42150,
    exit: 41800,
    size: 0.5,
    pnl: -350,
    pnlPercent: -0.83,
    thesis: "ETF approval anticipation, bullish structure on daily.",
    execution: "Poor stop placement, got stopped out on a wick.",
    emotion: "Frustrated",
    tags: ["News Trade", "ETF"],
    hasScreenshot: false,
    notes: 3,
  },
  {
    id: 4,
    symbol: "ES",
    market: "Futures",
    type: "Long",
    date: "Jan 4, 2024",
    time: "10:30 AM",
    entry: 4520,
    exit: 4548,
    size: 2,
    pnl: 1400,
    pnlPercent: 0.62,
    thesis: "Gap fill strategy, market structure bullish after test of lows.",
    execution: "Perfect execution, followed the plan exactly.",
    emotion: "Calm",
    tags: ["Gap Fill", "Structure"],
    hasScreenshot: true,
    notes: 0,
  },
  {
    id: 5,
    symbol: "TSLA",
    market: "Stocks",
    type: "Short",
    date: "Jan 3, 2024",
    time: "3:15 PM",
    entry: 245.8,
    exit: 238.2,
    size: 50,
    pnl: 760,
    pnlPercent: 3.09,
    thesis: "Overextended rally, divergence on RSI, resistance at 246.",
    execution: "Good patience waiting for the right entry level.",
    emotion: "Focused",
    tags: ["Mean Reversion", "Technical"],
    hasScreenshot: true,
    notes: 1,
  },
];

const marketColors: Record<string, string> = {
  Stocks: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Forex: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Crypto: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Futures: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  Options: "bg-chart-5/10 text-chart-5 border-chart-5/20",
};

const emotionColors: Record<string, string> = {
  Confident: "bg-profit/10 text-profit",
  Disciplined: "bg-primary/10 text-primary",
  Frustrated: "bg-loss/10 text-loss",
  Calm: "bg-chart-2/10 text-chart-2",
  Focused: "bg-chart-4/10 text-chart-4",
};

export default function Journal() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AppLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Trade Journal</h1>
          <p className="text-muted-foreground">
            Document and reflect on your trades
          </p>
        </div>
        <Button className="gradient-primary shadow-glow">
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by symbol, tag, or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-card">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline" className="bg-card">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </motion.div>

      {/* Journal Entries */}
      <div className="space-y-4">
        {journalEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.05 }}
            whileHover={{ scale: 1.005 }}
            className="bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all cursor-pointer overflow-hidden"
          >
            <div className="p-5">
              {/* Header Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      entry.pnl >= 0 ? "bg-profit/10" : "bg-loss/10"
                    )}
                  >
                    {entry.pnl >= 0 ? (
                      <ArrowUpRight className="w-6 h-6 text-profit" />
                    ) : (
                      <ArrowDownRight className="w-6 h-6 text-loss" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{entry.symbol}</h3>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", marketColors[entry.market])}
                      >
                        {entry.market}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {entry.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entry.date} at {entry.time}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={cn(
                      "text-xl font-bold",
                      entry.pnl >= 0 ? "text-profit" : "text-loss"
                    )}
                  >
                    {entry.pnl >= 0 ? "+" : ""}${Math.abs(entry.pnl).toLocaleString()}
                  </p>
                  <p
                    className={cn(
                      "text-sm",
                      entry.pnl >= 0 ? "text-profit/80" : "text-loss/80"
                    )}
                  >
                    {entry.pnlPercent >= 0 ? "+" : ""}
                    {entry.pnlPercent.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Trade Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-secondary/30 rounded-lg mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Entry</p>
                  <p className="font-medium">${entry.entry.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Exit</p>
                  <p className="font-medium">${entry.exit.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Size</p>
                  <p className="font-medium">{entry.size}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Emotion</p>
                  <Badge className={cn("text-xs", emotionColors[entry.emotion])}>
                    {entry.emotion}
                  </Badge>
                </div>
              </div>

              {/* Thesis */}
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                  Trade Thesis
                </p>
                <p className="text-sm">{entry.thesis}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  {entry.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs bg-secondary/50"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  {entry.hasScreenshot && (
                    <div className="flex items-center gap-1 text-xs">
                      <Image className="w-3.5 h-3.5" />
                      <span>Screenshot</span>
                    </div>
                  )}
                  {entry.notes > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{entry.notes} notes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}
