import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

const radarData = [
  { subject: "Win Rate", A: 68, fullMark: 100 },
  { subject: "Risk Mgmt", A: 85, fullMark: 100 },
  { subject: "Discipline", A: 72, fullMark: 100 },
  { subject: "Consistency", A: 78, fullMark: 100 },
  { subject: "Psychology", A: 65, fullMark: 100 },
  { subject: "Execution", A: 82, fullMark: 100 },
];

interface TradingScoreProps {
  delay?: number;
}

export function TradingScore({ delay = 0 }: TradingScoreProps) {
  const overallScore = Math.round(
    radarData.reduce((acc, item) => acc + item.A, 0) / radarData.length
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-card rounded-xl border border-border p-5 shadow-card"
    >
      <h3 className="font-semibold text-lg mb-4">Trading Score</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
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
      <div className="text-center mt-2">
        <p className="text-2xl font-bold">{overallScore}</p>
        <p className="text-sm text-muted-foreground">Overall Score</p>
      </div>
    </motion.div>
  );
}
