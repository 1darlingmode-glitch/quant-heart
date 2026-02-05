import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface RuleAnalytic {
  ruleId: string;
  title: string;
  totalEvaluations: number;
  timesMet: number;
  timesNotMet: number;
  complianceRate: number;
}

export function useRuleAnalytics() {
  const { user } = useAuth();

  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ["rule-analytics", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get all rules
      const { data: rules, error: rulesError } = await supabase
        .from("trading_rules")
        .select("id, title")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (rulesError) throw rulesError;
      if (!rules || rules.length === 0) return [];

      // Then get all evaluations
      const { data: evaluations, error: evalsError } = await supabase
        .from("trade_evaluations")
        .select("rule_id, is_met")
        .eq("user_id", user.id);

      if (evalsError) throw evalsError;

      // Aggregate the data
      const ruleMap = new Map<string, RuleAnalytic>();

      rules.forEach((rule) => {
        ruleMap.set(rule.id, {
          ruleId: rule.id,
          title: rule.title,
          totalEvaluations: 0,
          timesMet: 0,
          timesNotMet: 0,
          complianceRate: 0,
        });
      });

      evaluations?.forEach((eval_) => {
        if (eval_.rule_id && ruleMap.has(eval_.rule_id)) {
          const rule = ruleMap.get(eval_.rule_id)!;
          rule.totalEvaluations++;
          if (eval_.is_met) {
            rule.timesMet++;
          } else {
            rule.timesNotMet++;
          }
        }
      });

      // Calculate compliance rates and convert to array
      const result: RuleAnalytic[] = [];
      ruleMap.forEach((rule) => {
        if (rule.totalEvaluations > 0) {
          rule.complianceRate = Math.round(
            (rule.timesMet / rule.totalEvaluations) * 100
          );
        }
        result.push(rule);
      });

      // Sort by compliance rate (lowest first - most problematic rules)
      return result.sort((a, b) => a.complianceRate - b.complianceRate);
    },
    enabled: !!user,
  });

  const rulesWithData = analytics.filter((r) => r.totalEvaluations > 0);
  const rulesWithoutData = analytics.filter((r) => r.totalEvaluations === 0);

  return {
    analytics,
    rulesWithData,
    rulesWithoutData,
    isLoading,
    hasData: rulesWithData.length > 0,
  };
}
