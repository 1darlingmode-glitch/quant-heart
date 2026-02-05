import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  delay?: number;
  variant?: "default" | "profit" | "loss";
  /** Progress value from 0-100 for the ring chart */
  progress?: number;
  /** Maximum value for calculating progress (for P/L cards) */
  maxValue?: number;
  /** Current raw value for calculating progress */
  rawValue?: number;
}

interface MiniRingProps {
  progress: number;
  variant: "default" | "profit" | "loss";
  size?: number;
}

function MiniRing({ progress, variant, size = 44 }: MiniRingProps) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  const getColor = () => {
    switch (variant) {
      case "profit":
        return "stroke-profit";
      case "loss":
        return "stroke-loss";
      default:
        return "stroke-primary";
    }
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={getColor()}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {/* Center percentage */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          "text-[10px] font-bold",
          variant === "profit" && "text-profit",
          variant === "loss" && "text-loss",
          variant === "default" && "text-primary"
        )}>
          {Math.round(clampedProgress)}%
        </span>
      </div>
    </div>
  );
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  delay = 0,
  variant = "default",
  progress,
  maxValue,
  rawValue,
}: StatCardProps) {
  // Calculate progress if not directly provided
  let displayProgress = progress;
  
  if (displayProgress === undefined && maxValue !== undefined && rawValue !== undefined) {
    // For P/L values, calculate as percentage of max
    displayProgress = maxValue > 0 ? Math.min((Math.abs(rawValue) / maxValue) * 100, 100) : 0;
  } else if (displayProgress === undefined && change !== undefined) {
    // Fall back to using change value scaled to 0-100
    displayProgress = Math.min(Math.abs(change) + 50, 100);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300"
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
        {displayProgress !== undefined && (
          <MiniRing progress={displayProgress} variant={variant} />
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className={cn(
        "text-2xl font-bold",
        variant === "profit" && "text-profit",
        variant === "loss" && "text-loss",
        variant === "default" && "text-foreground"
      )}>
        {value}
      </p>
      {changeLabel && (
        <p className="text-xs text-muted-foreground mt-1">{changeLabel}</p>
      )}
    </motion.div>
  );
}
