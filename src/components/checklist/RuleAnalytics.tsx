import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, BarChart3, AlertTriangle } from "lucide-react";
import { useRuleAnalytics } from "@/hooks/useRuleAnalytics";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function RuleAnalytics() {
  const { rulesWithData, rulesWithoutData, isLoading, hasData } = useRuleAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border border-border">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h4 className="font-medium mb-2">No evaluation data yet</h4>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Start evaluating trades with your strategy checklist. Analytics will appear here once you have completed evaluations.
        </p>
      </div>
    );
  }

  const problemRules = rulesWithData.filter((r) => r.complianceRate < 50);
  const strongRules = rulesWithData.filter((r) => r.complianceRate >= 80);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rules Tracked</p>
              <p className="text-2xl font-bold">{rulesWithData.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-profit/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-profit" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Strong Rules (≥80%)</p>
              <p className="text-2xl font-bold text-profit">{strongRules.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-loss/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-loss" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Needs Work (&lt;50%)</p>
              <p className="text-2xl font-bold text-loss">{problemRules.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rule Compliance Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <h3 className="text-lg font-semibold mb-1">Rule Compliance Breakdown</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Sorted by compliance rate — rules you struggle with most are at the top
        </p>

        <div className="space-y-4">
          {rulesWithData.map((rule, index) => {
            const getColor = () => {
              if (rule.complianceRate >= 80) return "text-profit";
              if (rule.complianceRate >= 50) return "text-chart-3";
              return "text-loss";
            };

            const getProgressColor = () => {
              if (rule.complianceRate >= 80) return "bg-profit";
              if (rule.complianceRate >= 50) return "bg-chart-3";
              return "bg-loss";
            };

            return (
              <motion.div
                key={rule.ruleId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {rule.complianceRate < 50 ? (
                      <TrendingDown className="w-4 h-4 text-loss shrink-0" />
                    ) : rule.complianceRate >= 80 ? (
                      <TrendingUp className="w-4 h-4 text-profit shrink-0" />
                    ) : null}
                    <span className="font-medium truncate">{rule.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {rule.timesMet}/{rule.totalEvaluations} met
                    </span>
                    <span className={cn("font-semibold min-w-[3rem] text-right", getColor())}>
                      {rule.complianceRate}%
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", getProgressColor())}
                    initial={{ width: 0 }}
                    animate={{ width: `${rule.complianceRate}%` }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Rules without data */}
      {rulesWithoutData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-muted/30 rounded-xl border border-border p-5"
        >
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">
            Rules not yet evaluated ({rulesWithoutData.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {rulesWithoutData.map((rule) => (
              <span
                key={rule.ruleId}
                className="text-xs px-3 py-1 bg-background rounded-full border border-border"
              >
                {rule.title}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
