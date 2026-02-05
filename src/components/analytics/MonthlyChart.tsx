import { motion } from "framer-motion";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTrades } from "@/hooks/useTrades";
import { startOfMonth, format, subMonths } from "date-fns";

interface MonthData {
  month: string;
  pnl: number;
  trades: number;
  cumulative: number;
}

export function MonthlyChart() {
  const { trades } = useTrades();

  const calculateMonthlyData = (): MonthData[] => {
    const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== null && t.exit_date);
    const months: MonthData[] = [];
    let cumulative = 0;

    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = startOfMonth(subMonths(new Date(), i - 1));

      const monthTrades = closedTrades.filter((t) => {
        const exitDate = new Date(t.exit_date!);
        return exitDate >= monthStart && exitDate < monthEnd;
      });

      const monthPnl = monthTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      cumulative += monthPnl;

      months.push({
        month: format(monthStart, "MMM"),
        pnl: Math.round(monthPnl * 100) / 100,
        trades: monthTrades.length,
        cumulative: Math.round(cumulative * 100) / 100,
      });
    }

    return months;
  };

  const data = calculateMonthlyData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-card rounded-xl border border-border p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Monthly Performance</h3>
        <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-md">Last 6 Months</span>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="profitGradientMonth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="lossGradientMonth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-5))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--chart-5))" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickFormatter={(value) => `$${value}`}
              width={55}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--chart-4))", fontSize: 11 }}
              tickFormatter={(value) => `$${value}`}
              width={55}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as MonthData;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-medium mb-2">{d.month}</p>
                      <p className={`text-sm ${d.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                        Monthly P/L: ${d.pnl.toLocaleString()}
                      </p>
                      <p className="text-sm" style={{ color: "hsl(var(--chart-4))" }}>
                        Cumulative: ${d.cumulative.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Trades: {d.trades}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="pnl"
              radius={[6, 6, 0, 0]}
              animationDuration={1700}
              animationBegin={400}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? "url(#profitGradientMonth)" : "url(#lossGradientMonth)"}
                />
              ))}
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulative"
              stroke="hsl(var(--chart-4))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-4))", r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={2000}
              animationBegin={600}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
