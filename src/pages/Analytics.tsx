import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Calendar, Download, TrendingUp, TrendingDown, Target, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const dailyPnL = [
  { day: "Mon", pnl: 450 },
  { day: "Tue", pnl: -120 },
  { day: "Wed", pnl: 680 },
  { day: "Thu", pnl: 220 },
  { day: "Fri", pnl: -350 },
  { day: "Sat", pnl: 0 },
  { day: "Sun", pnl: 0 },
];

const hourlyPerformance = [
  { hour: "6AM", pnl: 120 },
  { hour: "7AM", pnl: 340 },
  { hour: "8AM", pnl: 890 },
  { hour: "9AM", pnl: 1250 },
  { hour: "10AM", pnl: 780 },
  { hour: "11AM", pnl: 420 },
  { hour: "12PM", pnl: 180 },
  { hour: "1PM", pnl: 350 },
  { hour: "2PM", pnl: 560 },
  { hour: "3PM", pnl: 920 },
  { hour: "4PM", pnl: 340 },
];

const strategyPerformance = [
  { strategy: "Breakout", winRate: 72, trades: 28, pnl: 3200 },
  { strategy: "Mean Reversion", winRate: 65, trades: 22, pnl: 1850 },
  { strategy: "Trend Following", winRate: 58, trades: 35, pnl: 2100 },
  { strategy: "Gap Fill", winRate: 78, trades: 15, pnl: 1420 },
  { strategy: "Scalping", winRate: 54, trades: 45, pnl: -320 },
];


export default function Analytics() {
  const [activeTab, setActiveTab] = useState("overview");

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
              <p className="text-xs text-muted-foreground">Best Day</p>
              <p className="font-bold text-lg text-profit">+$2,450</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Jan 3, 2024</p>
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
              <p className="text-xs text-muted-foreground">Worst Day</p>
              <p className="font-bold text-lg text-loss">-$680</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Dec 28, 2023</p>
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
              <p className="font-bold text-lg">$324</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">vs $148 avg loss</p>
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
              <p className="text-xs text-muted-foreground">Win Streak</p>
              <p className="font-bold text-lg">8 trades</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Current: 3</p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily P/L */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card rounded-xl border border-border p-5 shadow-card"
        >
          <h3 className="font-semibold text-lg mb-4">Daily P/L</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyPnL}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`$${value}`, "P/L"]}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]} animationDuration={1200}>
                  {dailyPnL.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.pnl >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Performance by Hour */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl border border-border p-5 shadow-card"
        >
          <h3 className="font-semibold text-lg mb-4">Performance by Hour</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyPerformance}>
                <defs>
                  <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`$${value}`, "Avg P/L"]}
                />
                <Area
                  type="monotone"
                  dataKey="pnl"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#hourlyGradient)"
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Strategy Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
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
              {strategyPerformance.map((strategy, index) => (
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
