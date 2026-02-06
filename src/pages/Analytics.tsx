import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import { Calendar, Download, TrendingUp, TrendingDown, Target, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTrades } from "@/hooks/useTrades";
import { AnalyticsToggleView } from "@/components/analytics/AnalyticsToggleView";
import { RuleAnalytics } from "@/components/checklist/RuleAnalytics";
import { format } from "date-fns";

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

      {/* Analytics Toggle View - TradeZella Style */}
      <div className="mb-8">
        <AnalyticsToggleView />
      </div>

      {/* Summary Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h3 className="font-semibold text-lg mb-4">Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
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
          </div>

          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
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
          </div>

          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
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
          </div>

          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
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
          </div>
        </div>
      </motion.div>

      {/* Rule Compliance Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="font-semibold text-lg mb-4">Rule Compliance Analytics</h3>
        <RuleAnalytics />
      </motion.div>
    </AppLayout>
  );
}
