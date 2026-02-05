import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface PerformanceRingProps {
  winRate?: number;
  wins?: number;
  losses?: number;
}

export function PerformanceRing({ winRate = 0, wins = 0, losses = 0 }: PerformanceRingProps) {
  const data = [
    { name: "Wins", value: wins || 1, color: "hsl(var(--profit))" },
    { name: "Losses", value: losses || 1, color: "hsl(var(--loss))" },
  ];

  // Handle case when there are no trades
  const hasNoTrades = wins === 0 && losses === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-card rounded-xl border border-border p-5 shadow-card"
    >
      <h3 className="font-semibold text-lg mb-4">Win Rate</h3>

      <div className="relative h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={hasNoTrades ? [{ name: "No Data", value: 1, color: "hsl(var(--muted))" }] : data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={hasNoTrades ? 0 : 2}
              dataKey="value"
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {(hasNoTrades ? [{ color: "hsl(var(--muted))" }] : data).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-3xl font-bold"
            >
              {hasNoTrades ? "N/A" : `${winRate.toFixed(0)}%`}
            </motion.span>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-profit" />
          <span className="text-sm text-muted-foreground">{wins} Wins</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-loss" />
          <span className="text-sm text-muted-foreground">{losses} Losses</span>
        </div>
      </div>
    </motion.div>
  );
}
