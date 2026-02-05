import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTrades } from "@/hooks/useTrades";

interface InstrumentData {
  symbol: string;
  pnl: number;
  trades: number;
  winRate: number;
}

const GRADIENT_COLORS = [
  { start: "hsl(217, 91%, 60%)", end: "hsl(217, 91%, 45%)" }, // Blue
  { start: "hsl(262, 83%, 58%)", end: "hsl(262, 83%, 43%)" }, // Purple
  { start: "hsl(316, 70%, 52%)", end: "hsl(316, 70%, 38%)" }, // Pink
  { start: "hsl(25, 95%, 53%)", end: "hsl(25, 95%, 40%)" }, // Orange
  { start: "hsl(47, 95%, 53%)", end: "hsl(47, 95%, 40%)" }, // Yellow
];

export function TopInstrumentsChart() {
  const { trades } = useTrades();

  const calculateInstrumentData = (): InstrumentData[] => {
    const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== null);
    const instrumentMap = new Map<string, { pnl: number; wins: number; total: number }>();

    for (const trade of closedTrades) {
      const symbol = trade.symbol.toUpperCase();
      const existing = instrumentMap.get(symbol) || { pnl: 0, wins: 0, total: 0 };
      existing.pnl += trade.pnl || 0;
      existing.total += 1;
      if ((trade.pnl || 0) > 0) existing.wins += 1;
      instrumentMap.set(symbol, existing);
    }

    // Sort by trade count and take top 5
    const sorted = Array.from(instrumentMap.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);

    return sorted.map(([symbol, data]) => ({
      symbol,
      pnl: Math.round(data.pnl * 100) / 100,
      trades: data.total,
      winRate: data.total > 0 ? Math.round((data.wins / data.total) * 100) : 0,
    }));
  };

  const data = calculateInstrumentData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-card rounded-xl border border-border p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Top Instruments</h3>
        <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-md">By Trade Count</span>
      </div>
      <div className="h-[220px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No trade data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barCategoryGap="20%">
              <defs>
                {GRADIENT_COLORS.map((color, index) => (
                  <linearGradient key={index} id={`instrumentGradient${index}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={color.start} />
                    <stop offset="100%" stopColor={color.end} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="symbol"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 500 }}
                width={60}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload as InstrumentData;
                    return (
                      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium mb-2">{d.symbol}</p>
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
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
              />
              <Bar dataKey="trades" radius={[0, 6, 6, 0]} animationDuration={1800} animationBegin={600}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#instrumentGradient${index % 5})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
