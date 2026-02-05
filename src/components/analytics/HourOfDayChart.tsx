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
import { useTrades } from "@/hooks/useTrades";
import { getHours } from "date-fns";

interface HourData {
  hour: string;
  pnl: number;
  trades: number;
  avgPnl: number;
}

export function HourOfDayChart() {
  const { trades } = useTrades();

  const calculateHourData = (): HourData[] => {
    const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== null && t.exit_date);
    const hourMap = new Map<number, { pnl: number; total: number }>();

    // Initialize market hours (typically 4am - 8pm for major markets)
    for (let i = 4; i <= 20; i++) {
      hourMap.set(i, { pnl: 0, total: 0 });
    }

    for (const trade of closedTrades) {
      const hour = getHours(new Date(trade.exit_date!));
      if (hour >= 4 && hour <= 20) {
        const existing = hourMap.get(hour) || { pnl: 0, total: 0 };
        existing.pnl += trade.pnl || 0;
        existing.total += 1;
        hourMap.set(hour, existing);
      }
    }

    const result: HourData[] = [];
    for (let i = 4; i <= 20; i++) {
      const data = hourMap.get(i)!;
      const hourStr = i < 12 ? `${i}AM` : i === 12 ? "12PM" : `${i - 12}PM`;
      result.push({
        hour: hourStr,
        pnl: Math.round(data.pnl * 100) / 100,
        trades: data.total,
        avgPnl: data.total > 0 ? Math.round((data.pnl / data.total) * 100) / 100 : 0,
      });
    }

    return result;
  };

  const data = calculateHourData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card rounded-xl border border-border p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Hours of Day</h3>
        <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-md">Average P/L</span>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="hourAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="hour"
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
                  const d = payload[0].payload as HourData;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-medium mb-2">{label}</p>
                      <p className={`text-sm ${d.avgPnl >= 0 ? "text-profit" : "text-loss"}`}>
                        Avg P/L: ${d.avgPnl.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Total P/L: ${d.pnl.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Trades: {d.trades}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="avgPnl"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              fill="url(#hourAreaGradient)"
              animationDuration={1800}
              animationBegin={200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
