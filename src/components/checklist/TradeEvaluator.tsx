import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, RotateCcw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTradingRules } from "@/hooks/useTradingRules";
import { cn } from "@/lib/utils";

interface EvaluationState {
  [ruleId: string]: boolean;
}

interface TradeEvaluatorProps {
  tradeId?: string;
  onScoreChange?: (score: number) => void;
}

export function TradeEvaluator({ tradeId, onScoreChange }: TradeEvaluatorProps) {
  const { rules, isLoading, totalWeight } = useTradingRules();
  const [evaluations, setEvaluations] = useState<EvaluationState>({});

  const score = useMemo(() => {
    if (totalWeight === 0) return 0;
    
    const earnedWeight = rules.reduce((sum, rule) => {
      if (evaluations[rule.id]) {
        return sum + Number(rule.weight_percentage);
      }
      return sum;
    }, 0);

    // Normalize to 100% scale
    return Math.round((earnedWeight / totalWeight) * 100);
  }, [rules, evaluations, totalWeight]);

  useEffect(() => {
    onScoreChange?.(score);
  }, [score, onScoreChange]);

  const toggleRule = (ruleId: string) => {
    setEvaluations((prev) => ({
      ...prev,
      [ruleId]: !prev[ruleId],
    }));
  };

  const resetEvaluations = () => {
    setEvaluations({});
  };

  const checkedCount = Object.values(evaluations).filter(Boolean).length;

  const getScoreColor = () => {
    if (score >= 80) return "text-profit";
    if (score >= 50) return "text-chart-3";
    return "text-loss";
  };

  const getScoreBgColor = () => {
    if (score >= 80) return "bg-profit";
    if (score >= 50) return "bg-chart-3";
    return "bg-loss";
  };

  const getScoreLabel = () => {
    if (score >= 80) return "High Reliability";
    if (score >= 50) return "Moderate Reliability";
    return "Low Reliability";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border border-border">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-muted-foreground" />
        </div>
        <h4 className="font-medium mb-2">No rules configured</h4>
        <p className="text-sm text-muted-foreground">
          Go to "Manage Rules" tab to create your trading checklist
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score Display */}
      <motion.div
        key={score}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Trade Reliability Score</h3>
            <p className="text-sm text-muted-foreground">
              {checkedCount} of {rules.length} rules met
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={resetEvaluations}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Circular Progress */}
        <div className="flex items-center gap-8">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/20"
              />
              {/* Progress circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className={getScoreBgColor()}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: score / 100 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  strokeDasharray: "283",
                  strokeDashoffset: 283 - (283 * score) / 100,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                key={score}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn("text-3xl font-bold", getScoreColor())}
              >
                {score}%
              </motion.span>
            </div>
          </div>

          <div className="flex-1">
            <div className={cn("text-lg font-semibold mb-1", getScoreColor())}>
              {getScoreLabel()}
            </div>
            <p className="text-sm text-muted-foreground">
              {score >= 80
                ? "This trade meets most of your criteria. Proceed with confidence."
                : score >= 50
                ? "Some rules are not met. Consider if the risk is acceptable."
                : "Many rules are not met. Review your thesis carefully before proceeding."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Checklist */}
      <div className="space-y-2">
        {rules.map((rule, index) => {
          const isChecked = evaluations[rule.id] || false;
          
          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleRule(rule.id)}
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                isChecked
                  ? "bg-profit/5 border-profit/30"
                  : "bg-card border-border hover:border-muted-foreground/30"
              )}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => toggleRule(rule.id)}
                className={cn(
                  "mt-0.5",
                  isChecked && "border-profit data-[state=checked]:bg-profit"
                )}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-medium",
                    isChecked && "text-profit"
                  )}>
                    {rule.title}
                  </span>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full shrink-0",
                    isChecked
                      ? "bg-profit/20 text-profit"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {rule.weight_percentage}%
                  </span>
                </div>
                {rule.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {rule.description}
                  </p>
                )}
              </div>

              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                isChecked ? "bg-profit text-profit-foreground" : "bg-muted"
              )}>
                {isChecked ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
