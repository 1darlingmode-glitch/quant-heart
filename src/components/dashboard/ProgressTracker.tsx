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
      // Last 30 days
      const startDate = subDays(now, 29);
      const days = eachDayOfInterval({ start: startDate, end: now });
      periods = days.map((day) => ({
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
    };
  });
}

export function ProgressTracker({ trades = [] }: ProgressTrackerProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeType>("daily");

  const periodData = getPeriodData(trades, activeTimeframe);

  const totalWins = periodData.filter((p) => p.result === "win").length;
  const totalLosses = periodData.filter((p) => p.result === "loss").length;
  const totalPnl = periodData.reduce((sum, p) => sum + p.pnl, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="bg-card rounded-xl border border-border p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-5">
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

      <TooltipProvider>
        <div className={cn(
          "grid gap-1.5",
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
                  className={cn(
                    "aspect-square rounded-sm cursor-pointer transition-all hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-offset-card",
                    period.result === "win" && "bg-profit hover:ring-profit/50",
                    period.result === "loss" && "bg-loss hover:ring-loss/50",
                    period.result === "neutral" && "bg-muted hover:ring-muted-foreground/50"
                  )}
                />
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
          <div className="w-3 h-3 rounded-sm bg-profit" />
          <span className="text-xs text-muted-foreground">Winning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-loss" />
          <span className="text-xs text-muted-foreground">Losing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <span className="text-xs text-muted-foreground">No trades</span>
        </div>
      </div>
    </motion.div>
  );
}
