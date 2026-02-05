import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTrades } from "@/hooks/useTrades";
import { getDay, format } from "date-fns";

interface DayData {
  day: string;
  pnl: number;
  trades: number;
  winRate: number;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DayOfWeekChart() {
  const { trades } = useTrades();

  const calculateDayOfWeekData = (): DayData[] => {
    const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== null && t.exit_date);
    const dayMap = new Map<number, { pnl: number; wins: number; total: number }>();

    // Initialize all days
    for (let i = 0; i < 7; i++) {
      dayMap.set(i, { pnl: 0, wins: 0, total: 0 });
    }

    for (const trade of closedTrades) {
      const dayIndex = getDay(new Date(trade.exit_date!));
      const existing = dayMap.get(dayIndex)!;
      existing.pnl += trade.pnl || 0;
      existing.total += 1;
      if ((trade.pnl || 0) > 0) existing.wins += 1;
    }

    return DAYS.map((day, index) => {
      const data = dayMap.get(index)!;
      return {
        day,
        pnl: Math.round(data.pnl * 100) / 100,
        trades: data.total,
        winRate: data.total > 0 ? Math.round((data.wins / data.total) * 100) : 0,
      };
    });
  };

  const data = calculateDayOfWeekData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-card rounded-xl border border-border p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Day of Week</h3>
        <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-md">P/L by Day</span>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <defs>
              <linearGradient id="profitGradientDay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="lossGradientDay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--loss))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--loss))" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="day"
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
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
              formatter={(value: number, name: string) => {
                if (name === "pnl") return [`$${value.toLocaleString()}`, "P/L"];
                return [value, name];
              }}
              labelFormatter={(label) => `${label}`}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as DayData;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-medium mb-2">{label}</p>
                      <p className={`text-sm ${d.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                        P/L: ${d.pnl.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Trades: {d.trades}</p>
                      <p className="text-sm text-muted-foreground">Win Rate: {d.winRate}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="pnl" radius={[6, 6, 0, 0]} animationDuration={1500} animationBegin={100}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? "url(#profitGradientDay)" : "url(#lossGradientDay)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
