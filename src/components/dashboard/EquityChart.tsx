import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { format, subHours, subDays, subWeeks, subMonths, subYears, startOfHour } from "date-fns";

interface Trade {
  id: string;
  pnl: number | null;
  exit_date: string | null;
  status: string;
}

interface EquityPoint {
  date: string;
  equity: number;
  timestamp: number;
}

interface EquityChartProps {
  trades: Trade[];
  startingBalance?: number;
}

const timeframes = ["1H", "1D", "1W", "1M", "3M", "6M", "1Y", "ALL"];

export function EquityChart({ trades, startingBalance = 10000 }: EquityChartProps) {
  const [activeTimeframe, setActiveTimeframe] = useState("1M");

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let groupFormat: string;
    let displayFormat: string;

    switch (activeTimeframe) {
      case "1H":
        startDate = subHours(now, 1);
        groupFormat = "HH:mm";
        displayFormat = "HH:mm";
        break;
      case "1D":
        startDate = subDays(now, 1);
        groupFormat = "yyyy-MM-dd HH";
        displayFormat = "HH:mm";
        break;
      case "1W":
        startDate = subWeeks(now, 1);
        groupFormat = "yyyy-MM-dd";
        displayFormat = "EEE";
        break;
      case "1M":
        startDate = subMonths(now, 1);
        groupFormat = "yyyy-MM-dd";
        displayFormat = "MMM d";
        break;
      case "3M":
        startDate = subMonths(now, 3);
        groupFormat = "yyyy-MM-dd";
        displayFormat = "MMM d";
        break;
      case "6M":
        startDate = subMonths(now, 6);
        groupFormat = "yyyy-'W'ww";
        displayFormat = "MMM d";
        break;
      case "1Y":
        startDate = subYears(now, 1);
        groupFormat = "yyyy-MM";
        displayFormat = "MMM";
        break;
      case "ALL":
      default:
        startDate = new Date(0);
        groupFormat = "yyyy-MM";
        displayFormat = "MMM yy";
        break;
    }

    // Filter and sort closed trades within the timeframe
    const closedTrades = trades
      .filter((t) => t.status === "closed" && t.pnl !== null && t.exit_date)
      .filter((t) => new Date(t.exit_date!) >= startDate)
      .sort((a, b) => new Date(a.exit_date!).getTime() - new Date(b.exit_date!).getTime());

    if (closedTrades.length === 0) {
      // Return current point with starting balance
      return [{ date: format(now, displayFormat), equity: startingBalance, timestamp: now.getTime() }];
    }

    // Calculate cumulative equity for each trade in timeframe
    // First, get total equity before the timeframe started
    const tradesBeforeTimeframe = trades
      .filter((t) => t.status === "closed" && t.pnl !== null && t.exit_date)
      .filter((t) => new Date(t.exit_date!) < startDate)
      .reduce((sum, t) => sum + (t.pnl || 0), 0);

    let cumulative = startingBalance + tradesBeforeTimeframe;

    // Group trades by the appropriate time period
    const groupedEquity = new Map<string, { equity: number; displayDate: string; timestamp: number }>();

    for (const trade of closedTrades) {
      const tradeDate = new Date(trade.exit_date!);
      const groupKey = format(tradeDate, groupFormat);
      const displayDate = format(tradeDate, displayFormat);
      cumulative += trade.pnl || 0;
      groupedEquity.set(groupKey, { 
        equity: cumulative, 
        displayDate, 
        timestamp: tradeDate.getTime() 
      });
    }

    // Convert to array and sort by timestamp
    const points: EquityPoint[] = Array.from(groupedEquity.entries())
      .map(([_, data]) => ({
        date: data.displayDate,
        equity: data.equity,
        timestamp: data.timestamp,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Add starting point if we have equity before timeframe
    if (tradesBeforeTimeframe !== 0 && points.length > 0) {
      points.unshift({
        date: format(startDate, displayFormat),
        equity: startingBalance + tradesBeforeTimeframe,
        timestamp: startDate.getTime(),
      });
    }

    return points.length > 0 ? points : [{ date: format(now, displayFormat), equity: startingBalance, timestamp: now.getTime() }];
  }, [trades, activeTimeframe, startingBalance]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card rounded-xl border border-border p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg">Equity Curve</h3>
          <p className="text-sm text-muted-foreground">
            Portfolio performance over time
          </p>
        </div>
        <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={cn(
                "px-2 py-1.5 text-xs font-medium rounded-md transition-all",
                activeTimeframe === tf
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-lg)",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Equity"]}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#equityGradient)"
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
