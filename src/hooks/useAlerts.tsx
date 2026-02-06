import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect, useCallback, useRef } from "react";
import { useTrades } from "./useTrades";
import { startOfDay, subDays, format } from "date-fns";

export interface Alert {
  id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  created_at: string;
  user_id: string;
}

// Notification sound utility
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log("Audio notification not supported");
  }
};

export function useAlerts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { stats, trades } = useTrades();
  const previousDrawdownRef = useRef<number>(0);
  const previousStreakRef = useRef<number>(0);
  const lastTradeCountRef = useRef<number>(0);
  const hasCheckedJournalRef = useRef<boolean>(false);

  // Fetch alerts
  const alertsQuery = useQuery({
    queryKey: ["user_alerts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Alert[];
    },
    enabled: !!user,
  });

  // Create alert mutation
  const createAlert = useMutation({
    mutationFn: async (alert: { type: string; title: string; message: string }) => {
      if (!user) throw new Error("User not authenticated");

      // Check if similar alert exists in last 24 hours to avoid duplicates
      const oneDayAgo = subDays(new Date(), 1).toISOString();
      const { data: existingAlerts } = await supabase
        .from("user_alerts")
        .select("id")
        .eq("user_id", user.id)
        .eq("title", alert.title)
        .gte("created_at", oneDayAgo);

      if (existingAlerts && existingAlerts.length > 0) {
        return null; // Don't create duplicate
      }

      const { data, error } = await supabase
        .from("user_alerts")
        .insert({
          user_id: user.id,
          type: alert.type,
          title: alert.title,
          message: alert.message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["user_alerts", user?.id] });
        playNotificationSound();
      }
    },
  });

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("user_alerts")
        .update({ read: true })
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_alerts", user?.id] });
    },
  });

  // Mark all as read mutation
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("user_alerts")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_alerts", user?.id] });
    },
  });

  // Delete alert mutation
  const deleteAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("user_alerts")
        .delete()
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_alerts", user?.id] });
    },
  });

  // Clear all alerts mutation
  const clearAllAlerts = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("user_alerts")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_alerts", user?.id] });
    },
  });

  // Check for journal reminder
  const checkJournalReminder = useCallback(async () => {
    if (!user || hasCheckedJournalRef.current) return;
    hasCheckedJournalRef.current = true;

    const yesterday = subDays(startOfDay(new Date()), 1);
    const yesterdayStr = format(yesterday, "yyyy-MM-dd");

    // Check if there were trades yesterday
    const yesterdayTrades = trades.filter((t) => {
      if (!t.exit_date) return false;
      const exitDate = format(new Date(t.exit_date), "yyyy-MM-dd");
      return exitDate === yesterdayStr;
    });

    if (yesterdayTrades.length === 0) return;

    // Check if there's a period record for yesterday
    const { data: periodRecords } = await supabase
      .from("period_records")
      .select("id")
      .eq("user_id", user.id)
      .gte("period_start", yesterday.toISOString())
      .lt("period_end", startOfDay(new Date()).toISOString());

    if (!periodRecords || periodRecords.length === 0) {
      createAlert.mutate({
        type: "reminder",
        title: "Journal Reminder",
        message: `Don't forget to journal your ${yesterdayTrades.length} trade${yesterdayTrades.length > 1 ? "s" : ""} from yesterday`,
      });
    }
  }, [user, trades, createAlert]);

  // Check for drawdown alerts
  const checkDrawdownAlert = useCallback(() => {
    if (!user || !stats) return;

    const drawdownThresholds = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
    const currentDrawdown = stats.maxDrawdown;

    for (const threshold of drawdownThresholds) {
      if (currentDrawdown >= threshold && previousDrawdownRef.current < threshold) {
        createAlert.mutate({
          type: "warning",
          title: "Drawdown Alert",
          message: `Your drawdown has reached ${threshold}%. Consider reviewing your risk management strategy.`,
        });
        break;
      }
    }

    previousDrawdownRef.current = currentDrawdown;
  }, [user, stats, createAlert]);

  // Check for win streak alerts
  const checkWinStreakAlert = useCallback(() => {
    if (!user || !stats) return;

    if (stats.streakType === "win" && stats.currentStreak > previousStreakRef.current) {
      const milestones = [3, 5, 7, 10, 15, 20];
      for (const milestone of milestones) {
        if (stats.currentStreak >= milestone && previousStreakRef.current < milestone) {
          createAlert.mutate({
            type: "success",
            title: "Win Streak!",
            message: `Congratulations! You've completed ${milestone} winning trades in a row!`,
          });
          break;
        }
      }
    }

    previousStreakRef.current = stats.currentStreak;
  }, [user, stats, createAlert]);

  // Check for trade sync (new trades)
  const checkTradeSyncAlert = useCallback(() => {
    if (!user) return;

    const currentTradeCount = trades.length;
    if (lastTradeCountRef.current > 0 && currentTradeCount > lastTradeCountRef.current) {
      const newTradesCount = currentTradeCount - lastTradeCountRef.current;
      createAlert.mutate({
        type: "info",
        title: "Trade Synced",
        message: `${newTradesCount} new trade${newTradesCount > 1 ? "s" : ""} synced to your account`,
      });
    }

    lastTradeCountRef.current = currentTradeCount;
  }, [user, trades.length, createAlert]);

  // Run alert checks when stats/trades change
  useEffect(() => {
    if (user && stats && trades.length > 0) {
      checkDrawdownAlert();
      checkWinStreakAlert();
      checkTradeSyncAlert();
      checkJournalReminder();
    }
  }, [user, stats, trades.length, checkDrawdownAlert, checkWinStreakAlert, checkTradeSyncAlert, checkJournalReminder]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!user?.id) return;

    const userId = user.id;
    const channel = supabase
      .channel(`alerts-realtime-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_alerts",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["user_alerts", userId] });
          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const alerts = alertsQuery.data || [];
  const unreadCount = alerts.filter((a) => !a.read).length;

  return {
    alerts,
    unreadCount,
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteAlert: deleteAlert.mutate,
    clearAllAlerts: clearAllAlerts.mutate,
    createAlert: createAlert.mutate,
    refetch: alertsQuery.refetch,
  };
}
