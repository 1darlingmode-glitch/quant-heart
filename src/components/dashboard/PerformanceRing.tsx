import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Wins", value: 68, color: "hsl(var(--profit))" },
  { name: "Losses", value: 32, color: "hsl(var(--loss))" },
];

export function PerformanceRing() {
  const winRate = 68;

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
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
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
              {winRate}%
            </motion.span>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-profit" />
          <span className="text-sm text-muted-foreground">68 Wins</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-loss" />
          <span className="text-sm text-muted-foreground">32 Losses</span>
        </div>
      </div>
    </motion.div>
  );
}
