import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import { Calendar, Download, TrendingUp, TrendingDown, Target, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTrades } from "@/hooks/useTrades";
import { DayOfWeekChart } from "@/components/analytics/DayOfWeekChart";
import { HourOfDayChart } from "@/components/analytics/HourOfDayChart";
import { WeeklyChart } from "@/components/analytics/WeeklyChart";
import { MonthlyChart } from "@/components/analytics/MonthlyChart";
import { TradeDurationChart } from "@/components/analytics/TradeDurationChart";
import { TopInstrumentsChart } from "@/components/analytics/TopInstrumentsChart";
import { format } from "date-fns";

const strategyPerformance = [
  { strategy: "Breakout", winRate: 72, trades: 28, pnl: 3200 },
  { strategy: "Mean Reversion", winRate: 65, trades: 22, pnl: 1850 },
  { strategy: "Trend Following", winRate: 58, trades: 35, pnl: 2100 },
  { strategy: "Gap Fill", winRate: 78, trades: 15, pnl: 1420 },
  { strategy: "Scalping", winRate: 54, trades: 45, pnl: -320 },
];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const { trades, stats } = useTrades();

  // Calculate best/worst trade dates
  const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== null);
  const sortedByPnl = [...closedTrades].sort((a, b) => (b.pnl || 0) - (a.pnl || 0));
  const bestTrade = sortedByPnl[0];
  const worstTrade = sortedByPnl[sortedByPnl.length - 1];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "strategies", label: "Strategies" },
    { id: "timing", label: "Timing" },
    { id: "risk", label: "Risk" },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Deep dive into your trading performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-card">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline" className="bg-card">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1 bg-secondary/50 p-1 rounded-lg w-fit mb-8"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl border border-border p-5 shadow-card"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-profit/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-profit" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Best Trade</p>
              <p className="font-bold text-lg text-profit">
                {stats.bestTrade > 0 ? `+$${stats.bestTrade.toLocaleString()}` : "$0"}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {bestTrade?.exit_date ? format(new Date(bestTrade.exit_date), "MMM d, yyyy") : "No trades yet"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-5 shadow-card"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-loss/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-loss" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Worst Trade</p>
              <p className="font-bold text-lg text-loss">
                {stats.worstTrade < 0 ? `-$${Math.abs(stats.worstTrade).toLocaleString()}` : "$0"}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {worstTrade?.exit_date ? format(new Date(worstTrade.exit_date), "MMM d, yyyy") : "No trades yet"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-xl border border-border p-5 shadow-card"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Win</p>
              <p className="font-bold text-lg">${Math.round(stats.avgWin).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">vs ${Math.round(stats.avgLoss).toLocaleString()} avg loss</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border p-5 shadow-card"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Streak</p>
              <p className="font-bold text-lg">
                {stats.currentStreak} {stats.streakType !== "none" ? stats.streakType : ""}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.streakType === "win" ? "Winning streak" : stats.streakType === "loss" ? "Losing streak" : "No streak"}
          </p>
        </motion.div>
      </div>

      {/* Performance Charts Grid - TradeZella Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <DayOfWeekChart />
        <HourOfDayChart />
        <WeeklyChart />
        <MonthlyChart />
        <TradeDurationChart />
        <TopInstrumentsChart />
      </div>

      {/* Strategy Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-card rounded-xl border border-border p-5 shadow-card"
      >
        <h3 className="font-semibold text-lg mb-4">Strategy Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Strategy</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Win Rate</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Trades</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total P/L</th>
              </tr>
            </thead>
            <tbody>
              {strategyPerformance.map((strategy) => (
                <tr key={strategy.strategy} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 font-medium">{strategy.strategy}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            strategy.winRate >= 60 ? "bg-profit" : strategy.winRate >= 50 ? "bg-warning" : "bg-loss"
                          )}
                          style={{ width: `${strategy.winRate}%` }}
                        />
                      </div>
                      <span className="text-sm">{strategy.winRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{strategy.trades}</td>
                  <td className={cn(
                    "py-3 px-4 text-right font-semibold",
                    strategy.pnl >= 0 ? "text-profit" : "text-loss"
                  )}>
                    {strategy.pnl >= 0 ? "+" : ""}${Math.abs(strategy.pnl).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AppLayout>
  );
}
