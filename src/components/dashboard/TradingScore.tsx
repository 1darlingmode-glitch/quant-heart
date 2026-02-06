import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";
import { useCompactView } from "@/hooks/useCompactView";

interface Trade {
  id: string;
  pnl: number | null;
  status: string;
  exit_date: string | null;
  entry_date: string;
  reliability_score: number | null;
}

interface TradingScoreProps {
  trades: Trade[];
  delay?: number;
}

export function TradingScore({ trades, delay = 0 }: TradingScoreProps) {
  const { compactView } = useCompactView();

  const radarData = useMemo(() => {
    const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== null);
    
    if (closedTrades.length === 0) {
      return [
        { subject: "Win Rate", A: 0, fullMark: 100 },
        { subject: "Risk Mgmt", A: 0, fullMark: 100 },
        { subject: "Discipline", A: 0, fullMark: 100 },
        { subject: "Consistency", A: 0, fullMark: 100 },
        { subject: "Psychology", A: 0, fullMark: 100 },
        { subject: "Execution", A: 0, fullMark: 100 },
      ];
    }

    // Win Rate - percentage of winning trades
    const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0);
    const winRate = (winningTrades.length / closedTrades.length) * 100;

    // Risk Management - based on average loss vs average win ratio
    const losingTrades = closedTrades.filter((t) => (t.pnl || 0) < 0);
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length 
      : 0;
    const avgLoss = losingTrades.length > 0 
      ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length) 
      : 1;
    const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 2 : 0;
    const riskMgmt = Math.min(riskRewardRatio * 33, 100); // Scale: 3:1 = 100%

    // Discipline - based on reliability scores from strategy checklist
    const tradesWithScore = closedTrades.filter((t) => t.reliability_score !== null);
    const avgReliability = tradesWithScore.length > 0
      ? tradesWithScore.reduce((sum, t) => sum + (t.reliability_score || 0), 0) / tradesWithScore.length
      : 50; // Default to 50% if no evaluations
    const discipline = avgReliability;

    // Consistency - based on variance in P/L (lower variance = higher consistency)
    const pnls = closedTrades.map((t) => t.pnl || 0);
    const avgPnl = pnls.reduce((a, b) => a + b, 0) / pnls.length;
    const variance = pnls.reduce((sum, p) => sum + Math.pow(p - avgPnl, 2), 0) / pnls.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avgPnl !== 0 ? (stdDev / Math.abs(avgPnl)) : 1;
    const consistency = Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 20)));

    // Psychology - based on recovery after losses (bouncing back)
    let recoveries = 0;
    let lossFollowedByTrade = 0;
    const sortedTrades = [...closedTrades].sort(
      (a, b) => new Date(a.exit_date || a.entry_date).getTime() - new Date(b.exit_date || b.entry_date).getTime()
    );
    for (let i = 1; i < sortedTrades.length; i++) {
      if ((sortedTrades[i - 1].pnl || 0) < 0) {
        lossFollowedByTrade++;
        if ((sortedTrades[i].pnl || 0) > 0) {
          recoveries++;
        }
      }
    }
    const psychology = lossFollowedByTrade > 0 
      ? (recoveries / lossFollowedByTrade) * 100 
      : closedTrades.length > 0 ? 75 : 0;

    // Execution - based on profit factor (gross profit / gross loss)
    const grossProfit = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 3 : 0;
    const execution = Math.min(profitFactor * 33, 100); // Scale: 3:1 = 100%

    return [
      { subject: "Win Rate", A: Math.round(winRate), fullMark: 100 },
      { subject: "Risk Mgmt", A: Math.round(riskMgmt), fullMark: 100 },
      { subject: "Discipline", A: Math.round(discipline), fullMark: 100 },
      { subject: "Consistency", A: Math.round(consistency), fullMark: 100 },
      { subject: "Psychology", A: Math.round(psychology), fullMark: 100 },
      { subject: "Execution", A: Math.round(execution), fullMark: 100 },
    ];
  }, [trades]);

  const overallScore = Math.round(
    radarData.reduce((acc, item) => acc + item.A, 0) / radarData.length
  );

  const chartHeight = compactView ? 180 : 220;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-card rounded-xl border border-border p-4 shadow-card"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={compactView ? "font-semibold text-base" : "font-semibold text-lg"}>Trading Score</h3>
        <div className="text-right">
          <p className={compactView ? "text-xl font-bold" : "text-2xl font-bold"}>{overallScore}</p>
          <p className="text-xs text-muted-foreground">Overall</p>
        </div>
      </div>
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius={compactView ? "70%" : "75%"} data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: compactView ? 9 : 10 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
              tickCount={3}
            />
            <Radar
              name="Score"
              dataKey="A"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              animationDuration={1200}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
