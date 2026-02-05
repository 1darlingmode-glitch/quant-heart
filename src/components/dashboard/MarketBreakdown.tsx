import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface MarketBreakdownData {
  market: string;
  pnl: number;
  trades: number;
}

interface MarketBreakdownProps {
  data?: MarketBreakdownData[];
}

export function MarketBreakdown({ data = [] }: MarketBreakdownProps) {
  const hasData = data && data.length > 0;

  // Default empty state data
  const displayData = hasData
    ? data
    : [
        { market: "Stocks", pnl: 0, trades: 0 },
        { market: "Forex", pnl: 0, trades: 0 },
        { market: "Crypto", pnl: 0, trades: 0 },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-card rounded-xl border border-border p-5 shadow-card"
    >
      <div className="mb-6">
        <h3 className="font-semibold text-lg">Market Breakdown</h3>
        <p className="text-sm text-muted-foreground">P/L by market type</p>
      </div>

      {!hasData ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No trades recorded yet</p>
        </div>
      ) : (
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData} layout="vertical">
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
              />
              <YAxis
                type="category"
                dataKey="market"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "P/L"]}
              />
              <Bar dataKey="pnl" radius={[0, 4, 4, 0]} animationDuration={1200}>
                {displayData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pnl >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
