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
  /** Override value color to use theme-aware foreground instead of variant color */
  useThemeColor?: boolean;
}
interface MiniRingProps {
  progress: number;
  variant: "default" | "profit" | "loss";
  size?: number;
}
function MiniRing({
  progress,
  variant,
  size = 36
}: MiniRingProps) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset = circumference - clampedProgress / 100 * circumference;
  const getProgressColor = () => {
    switch (variant) {
      case "profit":
        return "stroke-profit";
      case "loss":
        return "stroke-loss";
      default:
        return "stroke-primary";
    }
  };
  const getBackgroundColor = () => {
    switch (variant) {
      case "profit":
        return "text-profit/20";
      case "loss":
        return "text-loss/20";
      default:
        return "text-muted/30";
    }
  };
  return <div className="relative" style={{
    width: size,
    height: size
  }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {/* Background circle - colored based on variant */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={getBackgroundColor()} />
        {/* Progress circle */}
        <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} strokeLinecap="round" className={getProgressColor()} initial={{
        strokeDashoffset: circumference
      }} animate={{
        strokeDashoffset
      }} transition={{
        duration: 1,
        ease: "easeOut",
        delay: 0.3
      }} style={{
        strokeDasharray: circumference
      }} />
      </svg>
      {/* Center percentage */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-[8px] font-bold", variant === "profit" && "text-profit", variant === "loss" && "text-loss", variant === "default" && "text-primary")}>
          {Math.round(clampedProgress)}%
        </span>
      </div>
    </div>;
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
  useThemeColor = false
}: StatCardProps) {
  // Calculate progress if not directly provided
  let displayProgress = progress;
  if (displayProgress === undefined && maxValue !== undefined && rawValue !== undefined) {
    // For P/L values, calculate as percentage of max
    displayProgress = maxValue > 0 ? Math.min(Math.abs(rawValue) / maxValue * 100, 100) : 0;
  } else if (displayProgress === undefined && change !== undefined) {
    // Fall back to using change value scaled to 0-100
    displayProgress = Math.min(Math.abs(change) + 50, 100);
  }
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5,
    delay,
    ease: "easeOut"
  }} whileHover={{
    y: -2,
    transition: {
      duration: 0.2
    }
  }} className="bg-card rounded-lg border p-3 shadow-card hover:shadow-primary/20 transition-all duration-300 border-[#c9cdd4]">
      <div className="flex items-start justify-between mb-2">
        <div className={cn("w-8 h-8 rounded-md flex items-center justify-center", variant === "profit" && "bg-profit/10", variant === "loss" && "bg-loss/10", variant === "default" && "bg-primary/10")}>
          <Icon className={cn("w-4 h-4", variant === "profit" && "text-profit", variant === "loss" && "text-loss", variant === "default" && "text-primary")} />
        </div>
        {displayProgress !== undefined && <MiniRing progress={displayProgress} variant={variant} />}
      </div>

      <p className="text-xs text-muted-foreground mb-0.5">{title}</p>
      <p className={cn("text-lg font-bold", useThemeColor ? "text-foreground" : variant === "profit" ? "text-profit" : variant === "loss" ? "text-loss" : "text-foreground")}>
        {value}
      </p>
      {changeLabel && <p className="text-[10px] text-muted-foreground mt-0.5">{changeLabel}</p>}
    </motion.div>;
}