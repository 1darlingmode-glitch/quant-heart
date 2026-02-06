import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { startOfMonth, startOfDay, subMonths, format } from "date-fns";
import { useEffect } from "react";

export interface Trade {
  id: string;
  symbol: string;
  market: string;
  trade_type: string;
  entry_price: number;
  exit_price: number | null;
  entry_date: string;
  exit_date: string | null;
  size: number;
  pnl: number | null;
  status: string;
  strategy: string | null;
  notes: string | null;
  reliability_score: number | null;
}

export interface TradeStats {
  totalPnl: number;
  todayPnl: number;
  winRate: number;
  avgRiskReward: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  expectancy: number;
  maxDrawdown: number;
  profitFactor: number;
  avgHoldTime: string;
  bestTrade: number;
  worstTrade: number;
  monthlyChange: number;
  dailyChange: number;
  dayWinRate: number;
  avgWin: number;
  avgLoss: number;
  currentStreak: number;
  streakType: "win" | "loss" | "none";
}

export interface MarketBreakdown {
  market: string;
  pnl: number;
  trades: number;
}

export interface EquityPoint {
  date: string;
  equity: number;
}

function calculateStats(trades: Trade[]): TradeStats {
  const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== null);
  const today = startOfDay(new Date());
  const thisMonth = startOfMonth(new Date());
  const lastMonth = startOfMonth(subMonths(new Date(), 1));

  // Today's P/L
  const todayTrades = closedTrades.filter(
    (t) => t.exit_date && new Date(t.exit_date) >= today
  );
  const todayPnl = todayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  // This month's P/L
  const thisMonthTrades = closedTrades.filter(
    (t) => t.exit_date && new Date(t.exit_date) >= thisMonth
  );
  const thisMonthPnl = thisMonthTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  // Last month's P/L
  const lastMonthTrades = closedTrades.filter(
    (t) =>
      t.exit_date &&
      new Date(t.exit_date) >= lastMonth &&
      new Date(t.exit_date) < thisMonth
  );
  const lastMonthPnl = lastMonthTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  // Yesterday's P/L for daily change calculation
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayTrades = closedTrades.filter(
    (t) =>
      t.exit_date &&
      new Date(t.exit_date) >= yesterday &&
      new Date(t.exit_date) < today
  );
  const yesterdayPnl = yesterdayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  // Total P/L
  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  // Win rate
  const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0);
  const losingTrades = closedTrades.filter((t) => (t.pnl || 0) < 0);
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

  // Average R/R (approximate based on avg win / avg loss)
  const avgWin = winningTrades.length > 0 
    ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length 
    : 0;
  const avgLoss = losingTrades.length > 0 
    ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length) 
    : 1;
  const avgRiskReward = avgLoss > 0 ? avgWin / avgLoss : 0;

  // Expectancy
  const expectancy = closedTrades.length > 0 ? totalPnl / closedTrades.length : 0;

  // Profit Factor
  const grossProfit = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // Best and worst trades
  const pnls = closedTrades.map((t) => t.pnl || 0);
  const bestTrade = pnls.length > 0 ? Math.max(...pnls) : 0;
  const worstTrade = pnls.length > 0 ? Math.min(...pnls) : 0;

  // Max Drawdown (simplified - based on cumulative P/L)
  let peak = 0;
  let maxDrawdown = 0;
  let cumulative = 0;
  const sortedTrades = [...closedTrades].sort(
    (a, b) => new Date(a.exit_date || 0).getTime() - new Date(b.exit_date || 0).getTime()
  );
  for (const trade of sortedTrades) {
    cumulative += trade.pnl || 0;
    if (cumulative > peak) peak = cumulative;
    const drawdown = peak > 0 ? ((peak - cumulative) / peak) * 100 : 0;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  // Average hold time
  const holdTimes = closedTrades
    .filter((t) => t.entry_date && t.exit_date)
    .map((t) => new Date(t.exit_date!).getTime() - new Date(t.entry_date).getTime());
  const avgHoldMs = holdTimes.length > 0 ? holdTimes.reduce((a, b) => a + b, 0) / holdTimes.length : 0;
  const hours = Math.floor(avgHoldMs / (1000 * 60 * 60));
  const minutes = Math.floor((avgHoldMs % (1000 * 60 * 60)) / (1000 * 60));
  const avgHoldTime = `${hours}h ${minutes}m`;

  // Monthly change percentage
  const monthlyChange = lastMonthPnl !== 0 
    ? ((thisMonthPnl - lastMonthPnl) / Math.abs(lastMonthPnl)) * 100 
    : thisMonthPnl > 0 ? 100 : 0;

  // Daily change percentage
  const dailyChange = yesterdayPnl !== 0 
    ? ((todayPnl - yesterdayPnl) / Math.abs(yesterdayPnl)) * 100 
    : todayPnl > 0 ? 100 : 0;

  // Day Win Rate - calculate based on unique trading days
  const tradingDays = new Map<string, { wins: number; losses: number }>();
  for (const trade of closedTrades) {
    if (trade.exit_date) {
      const dayKey = format(new Date(trade.exit_date), "yyyy-MM-dd");
      const existing = tradingDays.get(dayKey) || { wins: 0, losses: 0 };
      if ((trade.pnl || 0) > 0) {
        existing.wins++;
      } else if ((trade.pnl || 0) < 0) {
        existing.losses++;
      }
      tradingDays.set(dayKey, existing);
    }
  }
  
  let winningDays = 0;
  let totalDays = 0;
  tradingDays.forEach((dayStats) => {
    totalDays++;
    // A winning day is when net trades are positive
    if (dayStats.wins > dayStats.losses) {
      winningDays++;
    }
  });
  const dayWinRate = totalDays > 0 ? (winningDays / totalDays) * 100 : 0;

  // Current Streak - consecutive wins or losses from most recent trade
  let currentStreak = 0;
  let streakType: "win" | "loss" | "none" = "none";
  
  if (sortedTrades.length > 0) {
    const lastTrade = sortedTrades[sortedTrades.length - 1];
    const lastPnl = lastTrade.pnl || 0;
    
    if (lastPnl > 0) {
      streakType = "win";
      for (let i = sortedTrades.length - 1; i >= 0; i--) {
        if ((sortedTrades[i].pnl || 0) > 0) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else if (lastPnl < 0) {
      streakType = "loss";
      for (let i = sortedTrades.length - 1; i >= 0; i--) {
        if ((sortedTrades[i].pnl || 0) < 0) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  return {
    totalPnl,
    todayPnl,
    winRate,
    avgRiskReward,
    totalTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    expectancy,
    maxDrawdown,
    profitFactor: profitFactor === Infinity ? 999 : profitFactor,
    avgHoldTime,
    bestTrade,
    worstTrade,
    monthlyChange,
    dailyChange,
    dayWinRate,
    avgWin,
    avgLoss,
    currentStreak,
    streakType,
  };
}

function calculateMarketBreakdown(trades: Trade[]): MarketBreakdown[] {
  const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== null);
  const marketMap = new Map<string, { pnl: number; trades: number }>();

  for (const trade of closedTrades) {
    const market = trade.market.charAt(0).toUpperCase() + trade.market.slice(1);
    const existing = marketMap.get(market) || { pnl: 0, trades: 0 };
    marketMap.set(market, {
      pnl: existing.pnl + (trade.pnl || 0),
      trades: existing.trades + 1,
    });
  }

  return Array.from(marketMap.entries()).map(([market, data]) => ({
    market,
    pnl: data.pnl,
    trades: data.trades,
  }));
}

function calculateEquityCurve(trades: Trade[], startingBalance = 10000): EquityPoint[] {
  const closedTrades = trades
    .filter((t) => t.status === "closed" && t.pnl !== null && t.exit_date)
    .sort((a, b) => new Date(a.exit_date!).getTime() - new Date(b.exit_date!).getTime());

  if (closedTrades.length === 0) {
    // Return last 12 months with starting balance if no trades
    const points: EquityPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      points.push({ date: format(date, "MMM"), equity: startingBalance });
    }
    return points;
  }

  // Group by month
  const monthlyEquity = new Map<string, number>();
  let cumulative = startingBalance;

  for (const trade of closedTrades) {
    const month = format(new Date(trade.exit_date!), "MMM yyyy");
    cumulative += trade.pnl || 0;
    monthlyEquity.set(month, cumulative);
  }

  // Get last 12 months
  const points: EquityPoint[] = [];
  let lastEquity = startingBalance;
  
  for (let i = 11; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthKey = format(date, "MMM yyyy");
    const displayMonth = format(date, "MMM");
    
    if (monthlyEquity.has(monthKey)) {
      lastEquity = monthlyEquity.get(monthKey)!;
    }
    
    points.push({ date: displayMonth, equity: lastEquity });
  }

  return points;
}

export function useTrades() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const tradesQuery = useQuery({
    queryKey: ["trades", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false });

      if (error) throw error;
      return data as Trade[];
    },
    enabled: !!user,
  });

  // Subscribe to real-time changes
  useEffect(() => {
    if (!user?.id) return;

    const userId = user.id;
    const channel = supabase
      .channel(`trades-realtime-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Invalidate and refetch trades when any change occurs
          queryClient.invalidateQueries({ queryKey: ["trades", userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // queryClient is a stable reference from useQueryClient, safe to exclude
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const trades = tradesQuery.data || [];
  const stats = calculateStats(trades);
  const marketBreakdown = calculateMarketBreakdown(trades);
  const equityCurve = calculateEquityCurve(trades);
  
  // Recent trades (last 5 closed trades)
  const recentTrades = trades
    .filter((t) => t.status === "closed")
    .slice(0, 5);

  return {
    trades,
    recentTrades,
    stats,
    marketBreakdown,
    equityCurve,
    isLoading: tradesQuery.isLoading,
    error: tradesQuery.error,
    refetch: tradesQuery.refetch,
  };
}

export function useBrokerAccounts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["broker_accounts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("broker_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Hook to reset all user tracking data
export function useResetTracking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const resetAllData = async () => {
    if (!user) throw new Error("User not authenticated");

    // Delete all user data in order (respecting foreign keys)
    const { error: evalError } = await supabase
      .from("trade_evaluations")
      .delete()
      .eq("user_id", user.id);
    if (evalError) throw evalError;

    const { error: journalError } = await supabase
      .from("journal_entries")
      .delete()
      .eq("user_id", user.id);
    if (journalError) throw journalError;

    const { error: periodError } = await supabase
      .from("period_records")
      .delete()
      .eq("user_id", user.id);
    if (periodError) throw periodError;

    const { error: tradesError } = await supabase
      .from("trades")
      .delete()
      .eq("user_id", user.id);
    if (tradesError) throw tradesError;

    const { error: rulesError } = await supabase
      .from("trading_rules")
      .delete()
      .eq("user_id", user.id);
    if (rulesError) throw rulesError;

    const { error: alertsError } = await supabase
      .from("user_alerts")
      .delete()
      .eq("user_id", user.id);
    if (alertsError) throw alertsError;

    // Invalidate all queries to refresh the UI
    queryClient.invalidateQueries({ queryKey: ["trades"] });
    queryClient.invalidateQueries({ queryKey: ["trading_rules"] });
    queryClient.invalidateQueries({ queryKey: ["period_records"] });
    queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
    queryClient.invalidateQueries({ queryKey: ["trade_evaluations"] });
    queryClient.invalidateQueries({ queryKey: ["user_alerts"] });
  };

  return { resetAllData };
}
