import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { useTrades } from "@/hooks/useTrades";
import { getHours } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface HourData {
  hour: string;
  pnl: number;
  trades: number;
  avgPnl: number;
  hourIndex: number;
  session: string | null;
}

interface TimezoneOption {
  value: string;
  label: string;
  abbr: string;
}

const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: "America/New_York", label: "Eastern Time", abbr: "ET" },
  { value: "America/Chicago", label: "Central Time", abbr: "CT" },
  { value: "America/Denver", label: "Mountain Time", abbr: "MT" },
  { value: "America/Los_Angeles", label: "Pacific Time", abbr: "PT" },
  { value: "UTC", label: "Coordinated Universal Time", abbr: "UTC" },
  { value: "Europe/London", label: "London", abbr: "GMT/BST" },
  { value: "Asia/Tokyo", label: "Japan", abbr: "JST" },
  { value: "Asia/Hong_Kong", label: "Hong Kong", abbr: "HKT" },
  { value: "Asia/Singapore", label: "Singapore", abbr: "SGT" },
  { value: "Australia/Sydney", label: "Sydney", abbr: "AEST" },
];

interface TradingSession {
  name: string;
  utcStart: number;
  utcEnd: number;
  color: string;
}

const TRADING_SESSIONS: TradingSession[] = [
  { name: "Asian", utcStart: 0, utcEnd: 9, color: "hsl(47, 95%, 53%)" },
  { name: "London", utcStart: 8, utcEnd: 16, color: "hsl(217, 91%, 60%)" },
  { name: "New York", utcStart: 13, utcEnd: 21, color: "hsl(142, 71%, 45%)" },
];

const getTimezoneOffset = (timezone: string): number => {
  const now = new Date();
  const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  return Math.round((tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60));
};

export function HourOfDayChart() {
  const { trades } = useTrades();
  const [selectedTimezone, setSelectedTimezone] = useState("America/New_York");

  const sessionRanges = useMemo(() => {
    const offset = getTimezoneOffset(selectedTimezone);
    return TRADING_SESSIONS.map((session) => {
      let start = (session.utcStart + offset) % 24;
      let end = (session.utcEnd + offset) % 24;
      if (start < 0) start += 24;
      if (end < 0) end += 24;
      return { ...session, localStart: start, localEnd: end };
    });
  }, [selectedTimezone]);

  const getSessionForHour = (hour: number): string | null => {
    for (const session of sessionRanges) {
      if (session.localStart <= session.localEnd) {
        if (hour >= session.localStart && hour < session.localEnd) return session.name;
      } else {
        if (hour >= session.localStart || hour < session.localEnd) return session.name;
      }
    }
    return null;
  };

  const calculateHourData = (): HourData[] => {
    const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== null && t.exit_date);
    const hourMap = new Map<number, { pnl: number; total: number }>();

    for (let i = 0; i < 24; i++) hourMap.set(i, { pnl: 0, total: 0 });

    for (const trade of closedTrades) {
      const zonedDate = toZonedTime(new Date(trade.exit_date!), selectedTimezone);
      const hour = getHours(zonedDate);
      const existing = hourMap.get(hour) || { pnl: 0, total: 0 };
      existing.pnl += trade.pnl || 0;
      existing.total += 1;
      hourMap.set(hour, existing);
    }

    const result: HourData[] = [];
    for (let i = 0; i < 24; i++) {
      const data = hourMap.get(i)!;
      const hourStr = i === 0 ? "12AM" : i < 12 ? `${i}AM` : i === 12 ? "12PM" : `${i - 12}PM`;
      result.push({
        hour: hourStr,
        pnl: Math.round(data.pnl * 100) / 100,
        trades: data.total,
        avgPnl: data.total > 0 ? Math.round((data.pnl / data.total) * 100) / 100 : 0,
        hourIndex: i,
        session: getSessionForHour(i),
      });
    }

    return result;
  };

  const data = calculateHourData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card rounded-xl border border-border p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Hours of Day</h3>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
            <SelectTrigger className="w-[120px] h-8 bg-secondary/50 border-border text-xs">
              <SelectValue>
                {TIMEZONE_OPTIONS.find((tz) => tz.value === selectedTimezone)?.abbr || "TZ"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              {TIMEZONE_OPTIONS.map((tz) => (
                <SelectItem key={tz.value} value={tz.value} className="cursor-pointer text-xs">
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground w-10">{tz.abbr}</span>
                    <span>{tz.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="hourAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            {/* Trading Session Reference Areas */}
            {sessionRanges.map((session) => {
              const startLabel = session.localStart === 0 ? "12AM" : session.localStart < 12 ? `${session.localStart}AM` : session.localStart === 12 ? "12PM" : `${session.localStart - 12}PM`;
              const endLabel = session.localEnd === 0 ? "12AM" : session.localEnd < 12 ? `${session.localEnd}AM` : session.localEnd === 12 ? "12PM" : `${session.localEnd - 12}PM`;
              
              if (session.localStart <= session.localEnd) {
                return (
                  <ReferenceArea
                    key={session.name}
                    x1={startLabel}
                    x2={endLabel}
                    fill={session.color}
                    fillOpacity={0.08}
                    stroke={session.color}
                    strokeOpacity={0.3}
                    strokeDasharray="3 3"
                  />
                );
              }
              return null;
            })}
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              interval={2}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickFormatter={(value) => `$${value}`}
              width={50}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as HourData;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-medium mb-2">{label}</p>
                      {d.session && (
                        <p className="text-xs text-muted-foreground mb-1">
                          Session: <span className="font-medium">{d.session}</span>
                        </p>
                      )}
                      <p className={cn("text-sm", d.avgPnl >= 0 ? "text-profit" : "text-loss")}>
                        Avg P/L: ${d.avgPnl.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Total P/L: ${d.pnl.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Trades: {d.trades}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="avgPnl"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              fill="url(#hourAreaGradient)"
              animationDuration={1800}
              animationBegin={200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Session Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-3">
        {sessionRanges.map((session) => (
          <div key={session.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: session.color, opacity: 0.7 }}
            />
            <span className="text-xs text-muted-foreground">{session.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
