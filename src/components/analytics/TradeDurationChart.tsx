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

interface DurationData {
  range: string;
  pnl: number;
  trades: number;
  avgPnl: number;
  color: string;
}

const DURATION_RANGES = [
  { label: "<5m", min: 0, max: 5 },
  { label: "5-15m", min: 5, max: 15 },
  { label: "15-30m", min: 15, max: 30 },
  { label: "30m-1h", min: 30, max: 60 },
  { label: "1-2h", min: 60, max: 120 },
  { label: "2-4h", min: 120, max: 240 },
  { label: ">4h", min: 240, max: Infinity },
];

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
  "hsl(var(--accent))",
];

export function TradeDurationChart() {
  const { trades } = useTrades();

  const calculateDurationData = (): DurationData[] => {
    const closedTrades = trades.filter(
      (t) => t.status === "closed" && t.pnl !== null && t.exit_date && t.entry_date
    );

    return DURATION_RANGES.map((range, index) => {
      const rangeTrades = closedTrades.filter((t) => {
        const durationMs = new Date(t.exit_date!).getTime() - new Date(t.entry_date).getTime();
        const durationMins = durationMs / (1000 * 60);
        return durationMins >= range.min && durationMins < range.max;
      });

      const totalPnl = rangeTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const avgPnl = rangeTrades.length > 0 ? totalPnl / rangeTrades.length : 0;

      return {
        range: range.label,
        pnl: Math.round(totalPnl * 100) / 100,
        trades: rangeTrades.length,
        avgPnl: Math.round(avgPnl * 100) / 100,
        color: COLORS[index],
      };
    });
  };

  const data = calculateDurationData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-card rounded-xl border border-border p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Trade Duration</h3>
        <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-md">Intraday</span>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="12%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="range"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              width={35}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as DurationData;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-medium mb-2">{d.range} Duration</p>
                      <p className={`text-sm ${d.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                        Total P/L: ${d.pnl.toLocaleString()}
                      </p>
                      <p className={`text-sm ${d.avgPnl >= 0 ? "text-profit" : "text-loss"}`}>
                        Avg P/L: ${d.avgPnl.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Trades: {d.trades}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="trades" radius={[6, 6, 0, 0]} animationDuration={1500} animationBegin={500}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
