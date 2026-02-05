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

const hourlyPerformance = [
  { hour: "6AM", pnl: 120 },
  { hour: "7AM", pnl: 340 },
  { hour: "8AM", pnl: 890 },
  { hour: "9AM", pnl: 1250 },
  { hour: "10AM", pnl: 780 },
  { hour: "11AM", pnl: 420 },
  { hour: "12PM", pnl: 180 },
  { hour: "1PM", pnl: 350 },
  { hour: "2PM", pnl: 560 },
  { hour: "3PM", pnl: 920 },
  { hour: "4PM", pnl: 340 },
];

interface PerformanceByHourProps {
  delay?: number;
}

export function PerformanceByHour({ delay = 0 }: PerformanceByHourProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-card rounded-xl border border-border p-5 shadow-card"
    >
      <h3 className="font-semibold text-lg mb-4">Performance by Hour</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourlyPerformance}>
            <defs>
              <linearGradient id="hourlyGradientDashboard" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
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
              formatter={(value: number) => [`$${value}`, "Avg P/L"]}
            />
            <Area
              type="monotone"
              dataKey="pnl"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#hourlyGradientDashboard)"
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
