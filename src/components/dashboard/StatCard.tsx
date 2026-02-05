import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  delay?: number;
  variant?: "default" | "profit" | "loss";
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  delay = 0,
  variant = "default",
}: StatCardProps) {
  const isPositive = change !== undefined ? change >= 0 : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-11 h-11 rounded-lg flex items-center justify-center",
            variant === "profit" && "bg-profit/10",
            variant === "loss" && "bg-loss/10",
            variant === "default" && "bg-primary/10"
          )}
        >
          <Icon
            className={cn(
              "w-5 h-5",
              variant === "profit" && "text-profit",
              variant === "loss" && "text-loss",
              variant === "default" && "text-primary"
            )}
          />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              isPositive ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className={cn(
        "text-2xl font-bold",
        variant === "profit" && "text-profit",
        variant === "loss" && "text-loss"
      )}>
        {value}
      </p>
      {changeLabel && (
        <p className="text-xs text-muted-foreground mt-1">{changeLabel}</p>
      )}
    </motion.div>
  );
}
