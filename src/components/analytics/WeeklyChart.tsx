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
import { startOfWeek, format, subWeeks } from "date-fns";

interface WeekData {
  week: string;
  pnl: number;
  trades: number;
  startDate: Date;
}

export function WeeklyChart() {
  const { trades } = useTrades();

  const calculateWeeklyData = (): WeekData[] => {
    const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== null && t.exit_date);
    const weeks: WeekData[] = [];

    // Last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekTrades = closedTrades.filter((t) => {
        const exitDate = new Date(t.exit_date!);
        return exitDate >= weekStart && exitDate < weekEnd;
      });

      const weekPnl = weekTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

      weeks.push({
        week: format(weekStart, "MMM d"),
        pnl: Math.round(weekPnl * 100) / 100,
        trades: weekTrades.length,
        startDate: weekStart,
      });
    }

    return weeks;
  };

  const data = calculateWeeklyData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card rounded-xl border border-border p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Weekly Performance</h3>
        <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-md">Last 8 Weeks</span>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="15%">
            <defs>
              <linearGradient id="profitGradientWeek" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 76%, 45%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(142, 76%, 35%)" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="lossGradientWeek" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 84%, 55%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(0, 84%, 45%)" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              angle={-35}
              textAnchor="end"
              height={50}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickFormatter={(value) => `$${value}`}
              width={55}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as WeekData;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-medium mb-2">Week of {d.week}</p>
                      <p className={`text-sm ${d.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                        P/L: ${d.pnl.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Trades: {d.trades}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]} animationDuration={1600} animationBegin={300}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? "url(#profitGradientWeek)" : "url(#lossGradientWeek)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
