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
import { format, startOfDay, subDays } from "date-fns";

interface DailyPnLData {
  day: string;
  pnl: number;
  date: Date;
}

export function DailyPnLChart() {
  const { trades } = useTrades();

  // Calculate daily P/L for the last 7 days
  const calculateDailyPnL = (): DailyPnLData[] => {
    const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== null);
    const days: DailyPnLData[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayTrades = closedTrades.filter((t) => {
        if (!t.exit_date) return false;
        const exitDate = new Date(t.exit_date);
        return exitDate >= dayStart && exitDate < dayEnd;
      });

      const dayPnl = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

      days.push({
        day: format(date, "EEE"),
        pnl: dayPnl,
        date: date,
      });
    }

    return days;
  };

  const dailyPnL = calculateDailyPnL();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card rounded-xl border border-border p-5 shadow-card"
    >
      <h3 className="font-semibold text-lg mb-4">Daily P/L</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyPnL}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
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
              formatter={(value: number) => [`$${value.toLocaleString()}`, "P/L"]}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload as DailyPnLData;
                  return format(data.date, "MMM d, yyyy");
                }
                return label;
              }}
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
  );
}
