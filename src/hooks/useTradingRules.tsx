import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface TradingRule {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  weight_percentage: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TradeEvaluation {
  id: string;
  trade_id: string | null;
  rule_id: string;
  is_met: boolean;
  user_id: string;
  created_at: string;
}

export interface CreateRuleInput {
  title: string;
  description?: string;
  weight_percentage: number;
}

export interface UpdateRuleInput {
  id: string;
  title?: string;
  description?: string;
  weight_percentage?: number;
  sort_order?: number;
  is_active?: boolean;
}

export function useTradingRules() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: rules = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trading-rules", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("trading_rules")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as TradingRule[];
    },
    enabled: !!user?.id,
  });

  const createRule = useMutation({
    mutationFn: async (input: CreateRuleInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      const maxOrder = rules.length > 0 
        ? Math.max(...rules.map(r => r.sort_order)) + 1 
        : 0;

      const { data, error } = await supabase
        .from("trading_rules")
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description || null,
          weight_percentage: input.weight_percentage,
          sort_order: maxOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trading-rules"] });
      toast.success("Rule added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add rule: " + error.message);
    },
  });

  const updateRule = useMutation({
    mutationFn: async (input: UpdateRuleInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from("trading_rules")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trading-rules"] });
      toast.success("Rule updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update rule: " + error.message);
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (ruleId: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("trading_rules")
        .delete()
        .eq("id", ruleId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trading-rules"] });
      toast.success("Rule deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete rule: " + error.message);
    },
  });

  const totalWeight = rules.reduce((sum, rule) => sum + Number(rule.weight_percentage), 0);

  return {
    rules,
    isLoading,
    error,
    createRule,
    updateRule,
    deleteRule,
    totalWeight,
  };
}

export function useTradeEvaluations(tradeId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: evaluations = [],
    isLoading,
  } = useQuery({
    queryKey: ["trade-evaluations", tradeId],
    queryFn: async () => {
      if (!user?.id || !tradeId) return [];
      
      const { data, error } = await supabase
        .from("trade_evaluations")
        .select("*")
        .eq("trade_id", tradeId)
        .eq("user_id", user.id);

      if (error) throw error;
      return data as TradeEvaluation[];
    },
    enabled: !!user?.id && !!tradeId,
  });

  const saveEvaluation = useMutation({
    mutationFn: async ({ 
      ruleId, 
      isMet, 
      tradeId: tid 
    }: { 
      ruleId: string; 
      isMet: boolean; 
      tradeId?: string 
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("trade_evaluations")
        .upsert({
          trade_id: tid || null,
          rule_id: ruleId,
          is_met: isMet,
          user_id: user.id,
        }, {
          onConflict: "trade_id,rule_id"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-evaluations"] });
    },
  });

  return {
    evaluations,
    isLoading,
    saveEvaluation,
  };
}
