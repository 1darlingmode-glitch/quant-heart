import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { EquityChart } from "@/components/dashboard/EquityChart";
import { RecentTrades } from "@/components/dashboard/RecentTrades";
import { PerformanceRing } from "@/components/dashboard/PerformanceRing";
import { MarketBreakdown } from "@/components/dashboard/MarketBreakdown";
import {
  DollarSign,
  TrendingUp,
  Target,
  BarChart3,
  Percent,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <AppLayout>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back, John</h1>
        <p className="text-muted-foreground">
          Here's an overview of your trading performance
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total P/L"
          value="+$15,120"
          change={12.5}
          changeLabel="vs last month"
          icon={DollarSign}
          variant="profit"
          delay={0}
        />
        <StatCard
          title="Today's P/L"
          value="+$1,140"
          change={8.2}
          changeLabel="vs yesterday"
          icon={TrendingUp}
          variant="profit"
          delay={0.1}
        />
        <StatCard
          title="Win Rate"
          value="68%"
          change={3.1}
          changeLabel="100 trades"
          icon={Target}
          delay={0.15}
        />
        <StatCard
          title="Avg Risk/Reward"
          value="1:2.4"
          change={-0.2}
          changeLabel="target: 1:3"
          icon={BarChart3}
          delay={0.2}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <EquityChart />
          <RecentTrades />
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          <PerformanceRing />
          <MarketBreakdown />

          {/* Quick Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-card rounded-xl border border-border p-5 shadow-card"
          >
            <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Expectancy</span>
                <span className="font-semibold text-profit">+$42.50</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Max Drawdown</span>
                <span className="font-semibold text-loss">-8.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Profit Factor</span>
                <span className="font-semibold">2.14</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Avg Hold Time</span>
                <span className="font-semibold">2h 34m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Best Trade</span>
                <span className="font-semibold text-profit">+$2,450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Worst Trade</span>
                <span className="font-semibold text-loss">-$680</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
