import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useTrades } from "@/hooks/useTrades";
import { getDay, getHours, startOfWeek, format, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";

type AnalyticsField = "dayOfWeek" | "hoursOfDay" | "weeks" | "months" | "duration" | "instruments";

interface FieldOption {
  id: AnalyticsField;
  label: string;
}

const FIELD_OPTIONS: FieldOption[] = [
  { id: "dayOfWeek", label: "Day of Week" },
  { id: "hoursOfDay", label: "Hours of Day" },
  { id: "weeks", label: "Weeks" },
  { id: "months", label: "Months" },
  { id: "duration", label: "Intraday Duration" },
  { id: "instruments", label: "Top 5 Instruments" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DURATION_BUCKETS = ["<5m", "5-15m", "15-30m", "30m-1h", "1-2h", "2h+"];

const DISTRIBUTION_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(262, 83%, 58%)",
  "hsl(316, 70%, 52%)",
  "hsl(25, 95%, 53%)",
  "hsl(47, 95%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(199, 89%, 48%)",
];

export function AnalyticsToggleView() {
  const [activeField, setActiveField] = useState<AnalyticsField>("dayOfWeek");
  const { trades } = useTrades();

  const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== null);

  // Calculate data based on active field
  const calculateData = () => {
    switch (activeField) {
      case "dayOfWeek":
        return calculateDayOfWeekData();
      case "hoursOfDay":
        return calculateHourData();
      case "weeks":
        return calculateWeeklyData();
      case "months":
        return calculateMonthlyData();
      case "duration":
        return calculateDurationData();
      case "instruments":
        return calculateInstrumentData();
      default:
        return { performance: [], distribution: [] };
    }
  };

  const calculateDayOfWeekData = () => {
    const dayMap = new Map<number, { pnl: number; count: number }>();
    for (let i = 0; i < 7; i++) dayMap.set(i, { pnl: 0, count: 0 });

    for (const trade of closedTrades) {
      if (!trade.exit_date) continue;
      const dayIndex = getDay(new Date(trade.exit_date));
      const existing = dayMap.get(dayIndex)!;
      existing.pnl += trade.pnl || 0;
      existing.count += 1;
    }

    const performance = DAYS.map((day, index) => ({
      name: day,
      pnl: Math.round((dayMap.get(index)?.pnl || 0) * 100) / 100,
    }));

    const distribution = DAYS.map((day, index) => ({
      name: day,
      value: dayMap.get(index)?.count || 0,
    }));

    return { performance, distribution };
  };

  const calculateHourData = () => {
    const hourMap = new Map<number, { pnl: number; count: number }>();
    // Initialize all 24 hours
    for (let i = 0; i < 24; i++) hourMap.set(i, { pnl: 0, count: 0 });

    for (const trade of closedTrades) {
      if (!trade.exit_date) continue;
      const hour = getHours(new Date(trade.exit_date));
      const existing = hourMap.get(hour) || { pnl: 0, count: 0 };
      existing.pnl += trade.pnl || 0;
      existing.count += 1;
      hourMap.set(hour, existing);
    }

    const performance: { name: string; pnl: number }[] = [];
    const distribution: { name: string; value: number }[] = [];

    // Generate labels for all 24 hours
    for (let i = 0; i < 24; i++) {
      const hourStr = i === 0 ? "12AM" : i < 12 ? `${i}AM` : i === 12 ? "12PM" : `${i - 12}PM`;
      const data = hourMap.get(i)!;
      performance.push({ name: hourStr, pnl: Math.round(data.pnl * 100) / 100 });
      distribution.push({ name: hourStr, value: data.count });
    }

    return { performance, distribution };
  };

  const calculateWeeklyData = () => {
    const weekMap = new Map<string, { pnl: number; count: number }>();
    const today = new Date();

    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000));
      const weekKey = format(weekStart, "MMM d");
      weekMap.set(weekKey, { pnl: 0, count: 0 });
    }

    for (const trade of closedTrades) {
      if (!trade.exit_date) continue;
      const weekStart = startOfWeek(new Date(trade.exit_date));
      const weekKey = format(weekStart, "MMM d");
      if (weekMap.has(weekKey)) {
        const existing = weekMap.get(weekKey)!;
        existing.pnl += trade.pnl || 0;
        existing.count += 1;
      }
    }

    const performance = Array.from(weekMap.entries()).map(([name, data]) => ({
      name,
      pnl: Math.round(data.pnl * 100) / 100,
    }));

    const distribution = Array.from(weekMap.entries()).map(([name, data]) => ({
      name,
      value: data.count,
    }));

    return { performance, distribution };
  };

  const calculateMonthlyData = () => {
    const monthMap = new Map<string, { pnl: number; count: number }>();
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = format(monthDate, "MMM");
      monthMap.set(monthKey, { pnl: 0, count: 0 });
    }

    for (const trade of closedTrades) {
      if (!trade.exit_date) continue;
      const monthKey = format(new Date(trade.exit_date), "MMM");
      if (monthMap.has(monthKey)) {
        const existing = monthMap.get(monthKey)!;
        existing.pnl += trade.pnl || 0;
        existing.count += 1;
      }
    }

    const performance = Array.from(monthMap.entries()).map(([name, data]) => ({
      name,
      pnl: Math.round(data.pnl * 100) / 100,
    }));

    const distribution = Array.from(monthMap.entries()).map(([name, data]) => ({
      name,
      value: data.count,
    }));

    return { performance, distribution };
  };

  const calculateDurationData = () => {
    const durationMap = new Map<string, { pnl: number; count: number }>();
    for (const bucket of DURATION_BUCKETS) {
      durationMap.set(bucket, { pnl: 0, count: 0 });
    }

    for (const trade of closedTrades) {
      if (!trade.exit_date || !trade.entry_date) continue;
      const duration = differenceInMinutes(new Date(trade.exit_date), new Date(trade.entry_date));

      let bucket: string;
      if (duration < 5) bucket = "<5m";
      else if (duration < 15) bucket = "5-15m";
      else if (duration < 30) bucket = "15-30m";
      else if (duration < 60) bucket = "30m-1h";
      else if (duration < 120) bucket = "1-2h";
      else bucket = "2h+";

      const existing = durationMap.get(bucket)!;
      existing.pnl += trade.pnl || 0;
      existing.count += 1;
    }

    const performance = DURATION_BUCKETS.map((bucket) => ({
      name: bucket,
      pnl: Math.round((durationMap.get(bucket)?.pnl || 0) * 100) / 100,
    }));

    const distribution = DURATION_BUCKETS.map((bucket) => ({
      name: bucket,
      value: durationMap.get(bucket)?.count || 0,
    }));

    return { performance, distribution };
  };

  const calculateInstrumentData = () => {
    const instrumentMap = new Map<string, { pnl: number; count: number }>();

    for (const trade of closedTrades) {
      const symbol = trade.symbol.toUpperCase();
      const existing = instrumentMap.get(symbol) || { pnl: 0, count: 0 };
      existing.pnl += trade.pnl || 0;
      existing.count += 1;
      instrumentMap.set(symbol, existing);
    }

    const sorted = Array.from(instrumentMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    const performance = sorted.map(([name, data]) => ({
      name,
      pnl: Math.round(data.pnl * 100) / 100,
    }));

    const distribution = sorted.map(([name, data]) => ({
      name,
      value: data.count,
    }));

    return { performance, distribution };
  };

  const data = calculateData();
  const hasData = data.performance.some((d) => d.pnl !== 0) || data.distribution.some((d) => d.value !== 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-xl border border-border p-6 shadow-card"
    >
      {/* Toggle Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FIELD_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => setActiveField(option.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300",
              activeField === option.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Charts Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeField}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Performance Graph */}
          <div className="bg-secondary/20 rounded-xl p-5 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Performance (P/L)</h3>
              <span className="text-xs text-muted-foreground px-2 py-1 bg-profit/10 text-profit rounded-md">
                Profit/Loss
              </span>
            </div>
            <div className="h-[280px]">
              {!hasData ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No trade data available
                </div>
              ) : activeField === "instruments" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.performance} layout="vertical" barCategoryGap="20%">
                    <defs>
                      <linearGradient id="perfProfitGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="perfLossGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(var(--loss))" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="hsl(var(--loss))" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 500 }}
                      width={60}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium mb-1">{d.name}</p>
                              <p className={cn("text-sm font-semibold", d.pnl >= 0 ? "text-profit" : "text-loss")}>
                                P/L: {d.pnl >= 0 ? "+" : ""}${d.pnl.toLocaleString()}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="pnl" radius={[0, 6, 6, 0]} animationDuration={1200} animationBegin={0}>
                      {data.performance.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.pnl >= 0 ? "url(#perfProfitGradient)" : "url(#perfLossGradient)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : activeField === "hoursOfDay" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.performance}>
                    <defs>
                      <linearGradient id="perfAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      interval={2}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickFormatter={(value) => `$${value}`}
                      width={50}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium mb-1">{label}</p>
                              <p className={cn("text-sm font-semibold", d.pnl >= 0 ? "text-profit" : "text-loss")}>
                                P/L: {d.pnl >= 0 ? "+" : ""}${d.pnl.toLocaleString()}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pnl"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      fill="url(#perfAreaGradient)"
                      animationDuration={1500}
                      animationBegin={0}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.performance} barCategoryGap="20%">
                    <defs>
                      <linearGradient id="perfBarProfitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="perfBarLossGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--loss))" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(var(--loss))" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickFormatter={(value) => `$${value}`}
                      width={50}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium mb-1">{label}</p>
                              <p className={cn("text-sm font-semibold", d.pnl >= 0 ? "text-profit" : "text-loss")}>
                                P/L: {d.pnl >= 0 ? "+" : ""}${d.pnl.toLocaleString()}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="pnl" radius={[6, 6, 0, 0]} animationDuration={1200} animationBegin={0}>
                      {data.performance.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.pnl >= 0 ? "url(#perfBarProfitGradient)" : "url(#perfBarLossGradient)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Trade Distribution Graph */}
          <div className="bg-secondary/20 rounded-xl p-5 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Trade Distribution</h3>
              <span className="text-xs text-muted-foreground px-2 py-1 bg-chart-2/10 text-chart-2 rounded-md">
                Trade Count
              </span>
            </div>
            <div className="h-[280px]">
              {!hasData ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No trade data available
                </div>
              ) : activeField === "instruments" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {DISTRIBUTION_COLORS.map((color, index) => (
                        <linearGradient key={index} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={1} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={data.distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={1500}
                      animationBegin={200}
                    >
                      {data.distribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#pieGradient${index % DISTRIBUTION_COLORS.length})`} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium mb-1">{d.name}</p>
                              <p className="text-sm text-chart-2">Trades: {d.value}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.distribution} barCategoryGap="15%">
                    <defs>
                      <linearGradient id="distBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: activeField === "hoursOfDay" ? 10 : 11 }}
                      interval={activeField === "hoursOfDay" ? 2 : 0}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      width={40}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium mb-1">{label}</p>
                              <p className="text-sm text-chart-2">Trades: {payload[0].value}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="url(#distBarGradient)"
                      radius={[6, 6, 0, 0]}
                      animationDuration={1200}
                      animationBegin={200}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Legend for Pie Chart */}
            {activeField === "instruments" && hasData && (
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {data.distribution.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length] }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
