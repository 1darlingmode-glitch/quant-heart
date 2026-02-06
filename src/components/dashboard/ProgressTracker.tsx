import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Trade } from "@/hooks/useTrades";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  isWithinInterval,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  subDays,
  subWeeks,
  subMonths,
  subYears,
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PeriodDetailModal } from "./PeriodDetailModal";

interface ProgressTrackerProps {
  trades?: Trade[];
}

type TimeframeType = "daily" | "weekly" | "monthly" | "yearly";

interface PeriodData {
  label: string;
  wins: number;
  losses: number;
  pnl: number;
  result: "win" | "loss" | "neutral";
  start: Date;
  end: Date;
}

const timeframes: { label: string; value: TimeframeType }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

function getPeriodData(trades: Trade[], timeframe: TimeframeType): PeriodData[] {
  const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== null && t.exit_date);
  const now = new Date();
  
  let periods: { start: Date; end: Date; label: string }[] = [];
  
  switch (timeframe) {
    case "daily": {
      // Last 30 days (30 boxes total)
      const startDate = subDays(now, 29);
      const days = eachDayOfInterval({ start: startDate, end: now });
      periods = days.slice(-30).map((day) => ({
        start: startOfDay(day),
        end: endOfDay(day),
        label: format(day, "MMM d"),
      }));
      break;
    }
    case "weekly": {
      // Last 12 weeks
      const startDate = subWeeks(now, 11);
      const weeks = eachWeekOfInterval({ start: startDate, end: now }, { weekStartsOn: 1 });
      periods = weeks.map((week) => ({
        start: startOfWeek(week, { weekStartsOn: 1 }),
        end: endOfWeek(week, { weekStartsOn: 1 }),
        label: `Week of ${format(week, "MMM d")}`,
      }));
      break;
    }
    case "monthly": {
      // Last 12 months
      const startDate = subMonths(now, 11);
      const months = eachMonthOfInterval({ start: startDate, end: now });
      periods = months.map((month) => ({
        start: startOfMonth(month),
        end: endOfMonth(month),
        label: format(month, "MMM yyyy"),
      }));
      break;
    }
    case "yearly": {
      // Last 5 years
      const years: { start: Date; end: Date; label: string }[] = [];
      for (let i = 4; i >= 0; i--) {
        const year = subYears(now, i);
        years.push({
          start: startOfYear(year),
          end: endOfYear(year),
          label: format(year, "yyyy"),
        });
      }
      periods = years;
      break;
    }
  }

  return periods.map((period) => {
    const periodTrades = closedTrades.filter((t) =>
      isWithinInterval(new Date(t.exit_date!), {
        start: period.start,
        end: period.end,
      })
    );

    const wins = periodTrades.filter((t) => (t.pnl || 0) > 0).length;
    const losses = periodTrades.filter((t) => (t.pnl || 0) < 0).length;
    const pnl = periodTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

    let result: "win" | "loss" | "neutral" = "neutral";
    if (pnl > 0) result = "win";
    else if (pnl < 0) result = "loss";

    return {
      label: period.label,
      wins,
      losses,
      pnl,
      result,
      start: period.start,
      end: period.end,
    };
  });
}

export function ProgressTracker({ trades = [] }: ProgressTrackerProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeType>("daily");
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodData | null>(null);
  const periodData = getPeriodData(trades, activeTimeframe);

  const totalWins = periodData.filter((p) => p.result === "win").length;
  const totalLosses = periodData.filter((p) => p.result === "loss").length;
  const totalPnl = periodData.reduce((sum, p) => sum + p.pnl, 0);
  
  // Calculate total profit and total loss separately
  const totalProfit = periodData.reduce((sum, p) => sum + (p.pnl > 0 ? p.pnl : 0), 0);
  const totalLoss = periodData.reduce((sum, p) => sum + (p.pnl < 0 ? Math.abs(p.pnl) : 0), 0);

  // Get dynamic date range label based on timeframe
  const getDateRangeLabel = (): string => {
    const now = new Date();
    switch (activeTimeframe) {
      case "daily":
        return format(now, "MMMM yyyy");
      case "weekly":
        return format(now, "MMMM yyyy");
      case "monthly":
        return `${format(subMonths(now, 11), "MMM yyyy")} - ${format(now, "MMM yyyy")}`;
      case "yearly":
        return `${format(subYears(now, 4), "yyyy")} - ${format(now, "yyyy")}`;
    }
  };

  // Get short label for boxes based on timeframe
  const getShortLabel = (label: string, timeframe: TimeframeType): string => {
    switch (timeframe) {
      case "daily":
        // "Jan 5" -> "5"
        return label.split(" ")[1] || label;
      case "weekly":
        // "Week of Jan 5" -> "W1" style, use week number
        return label.replace("Week of ", "").split(" ")[1] || "";
      case "monthly":
        // "Jan 2024" -> "Jan"
        return label.split(" ")[0].substring(0, 3);
      case "yearly":
        // "2024" -> "'24"
        return "'" + label.slice(-2);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="bg-card rounded-xl border border-border p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">Progress Tracker</h3>
          <p className="text-sm text-muted-foreground">
            {totalWins}W - {totalLosses}L • Net:{" "}
            <span className={cn(
              "font-medium",
              totalPnl >= 0 ? "text-profit" : "text-loss"
            )}>
              {totalPnl >= 0 ? "+" : ""}${Math.abs(totalPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </p>
        </div>
        <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setActiveTimeframe(tf.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                activeTimeframe === tf.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Total Profit/Loss Stats */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-profit/10 rounded-lg border border-profit/20">
          <div className="w-2 h-2 rounded-full bg-profit" />
          <span className="text-xs text-muted-foreground">Total Profit:</span>
          <span className="text-sm font-semibold text-profit">
            +${totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-loss/10 rounded-lg border border-loss/20">
          <div className="w-2 h-2 rounded-full bg-loss" />
          <span className="text-xs text-muted-foreground">Total Loss:</span>
          <span className="text-sm font-semibold text-loss">
            -${totalLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Date Range Label */}
      <div className="mb-3">
        <p className="text-sm font-medium text-foreground">{getDateRangeLabel()}</p>
      </div>

      <TooltipProvider>
        <div className={cn(
          "grid gap-2",
          activeTimeframe === "daily" && "grid-cols-10",
          activeTimeframe === "weekly" && "grid-cols-6",
          activeTimeframe === "monthly" && "grid-cols-6",
          activeTimeframe === "yearly" && "grid-cols-5"
        )}>
          {periodData.map((period, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.02,
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                  }}
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    "aspect-square rounded-md cursor-pointer transition-all hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-offset-card flex items-center justify-center min-h-[28px] border",
                    period.result === "win" && "bg-profit border-profit/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.2)] hover:ring-profit/50",
                    period.result === "loss" && "bg-loss border-loss/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.2)] hover:ring-loss/50",
                    period.result === "neutral" && "bg-muted/50 border-border hover:ring-muted-foreground/50"
                  )}
                >
                  {period.result === "neutral" && (
                    <span className="text-[9px] font-medium text-muted-foreground/60">
                      {getShortLabel(period.label, activeTimeframe)}
                    </span>
                  )}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent className="text-center">
                <p className="font-semibold">{period.label}</p>
                <p className="text-xs text-muted-foreground">
                  {period.wins}W / {period.losses}L
                </p>
                <p className={cn(
                  "text-sm font-medium",
                  period.pnl >= 0 ? "text-profit" : "text-loss"
                )}>
                  {period.pnl >= 0 ? "+" : ""}${period.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-profit shadow-sm" />
          <span className="text-xs text-muted-foreground">Winning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-loss shadow-sm" />
          <span className="text-xs text-muted-foreground">Losing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-muted/50 border border-border" />
          <span className="text-xs text-muted-foreground">No trades</span>
        </div>
      </div>

      {/* Period Detail Modal */}
      {selectedPeriod && (
        <PeriodDetailModal
          isOpen={!!selectedPeriod}
          onClose={() => setSelectedPeriod(null)}
          periodLabel={selectedPeriod.label}
          periodStart={selectedPeriod.start}
          periodEnd={selectedPeriod.end}
          periodType={activeTimeframe}
          trades={trades}
        />
      )}
    </motion.div>
  );
}
