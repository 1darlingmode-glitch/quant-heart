import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { EquityChart } from "@/components/dashboard/EquityChart";
import { RecentTrades } from "@/components/dashboard/RecentTrades";
import { PerformanceRing } from "@/components/dashboard/PerformanceRing";
import { MarketBreakdown } from "@/components/dashboard/MarketBreakdown";
import { ProgressTracker } from "@/components/dashboard/ProgressTracker";
import {
  DollarSign,
  Target,
  Calendar,
  Scale,
  Flame,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTrades } from "@/hooks/useTrades";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { trades, stats, marketBreakdown, equityCurve, recentTrades, isLoading } = useTrades();
  const { data: profile } = useProfile();

  const displayName = profile?.display_name || "Trader";

  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? "+" : "";
    return `${prefix}$${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[380px] rounded-xl" />
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[280px] rounded-xl" />
            <Skeleton className="h-[280px] rounded-xl" />
            <Skeleton className="h-[320px] rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back, {displayName}</h1>
        <p className="text-muted-foreground">
          Here's an overview of your trading performance
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Total P/L"
          value={formatCurrency(stats.totalPnl)}
          changeLabel={`${stats.totalTrades} total trades`}
          icon={DollarSign}
          variant={stats.totalPnl >= 0 ? "profit" : "loss"}
          delay={0}
          progress={stats.totalPnl !== 0 ? Math.min((Math.abs(stats.totalPnl) / Math.max(Math.abs(stats.bestTrade), Math.abs(stats.worstTrade), 1)) * 10, 100) : 0}
        />
        <StatCard
          title="Trade Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          changeLabel={`${stats.winningTrades}W / ${stats.losingTrades}L`}
          icon={Target}
          delay={0.1}
          progress={stats.winRate}
          variant={stats.winRate >= 50 ? "profit" : "loss"}
        />
        <StatCard
          title="Day Win Rate"
          value={`${stats.dayWinRate.toFixed(1)}%`}
          changeLabel="winning days"
          icon={Calendar}
          delay={0.15}
          progress={stats.dayWinRate}
          variant={stats.dayWinRate >= 50 ? "profit" : "loss"}
        />
        <StatCard
          title="Avg Win/Loss"
          value={`${formatCurrency(stats.avgWin)} / ${formatCurrency(stats.avgLoss * -1)}`}
          changeLabel={`R:R 1:${stats.avgRiskReward.toFixed(1)}`}
          icon={Scale}
          delay={0.2}
          progress={stats.avgRiskReward > 0 ? Math.min((stats.avgRiskReward / 3) * 100, 100) : 0}
          variant={stats.avgWin > stats.avgLoss ? "profit" : "loss"}
        />
        <StatCard
          title="Current Streak"
          value={`${stats.currentStreak} ${stats.streakType === "win" ? "Wins" : stats.streakType === "loss" ? "Losses" : "-"}`}
          changeLabel={stats.streakType === "win" ? "🔥 Keep it going!" : stats.streakType === "loss" ? "Time to reset" : "No streak"}
          icon={Flame}
          delay={0.25}
          progress={Math.min(stats.currentStreak * 20, 100)}
          variant={stats.streakType === "win" ? "profit" : stats.streakType === "loss" ? "loss" : "default"}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <ProgressTracker trades={trades} />
          <EquityChart data={equityCurve} />
          <RecentTrades trades={recentTrades} />
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          <PerformanceRing 
            winRate={stats.winRate} 
            wins={stats.winningTrades} 
            losses={stats.losingTrades} 
          />
          <MarketBreakdown data={marketBreakdown} />

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
                <span className={`font-semibold ${stats.expectancy >= 0 ? "text-profit" : "text-loss"}`}>
                  {formatCurrency(stats.expectancy)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Max Drawdown</span>
                <span className="font-semibold text-loss">-{stats.maxDrawdown.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Profit Factor</span>
                <span className="font-semibold">{stats.profitFactor.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Avg Hold Time</span>
                <span className="font-semibold">{stats.avgHoldTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Best Trade</span>
                <span className="font-semibold text-profit">{formatCurrency(stats.bestTrade)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Worst Trade</span>
                <span className="font-semibold text-loss">{formatCurrency(stats.worstTrade)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
