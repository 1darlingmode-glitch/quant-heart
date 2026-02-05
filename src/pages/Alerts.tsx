import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import {
  Bell,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Check,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const alerts = [
  {
    id: 1,
    type: "milestone",
    title: "New High Reached!",
    message: "Your portfolio reached a new all-time high of $66,470",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "reminder",
    title: "Journal Reminder",
    message: "Don't forget to journal your 3 trades from today",
    time: "4 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "warning",
    title: "Drawdown Alert",
    message: "Your weekly drawdown is approaching the 5% limit",
    time: "1 day ago",
    read: true,
  },
  {
    id: 4,
    type: "success",
    title: "Win Streak!",
    message: "Congratulations! You've completed 5 winning trades in a row",
    time: "2 days ago",
    read: true,
  },
  {
    id: 5,
    type: "info",
    title: "Trade Synced",
    message: "15 new trades imported from Interactive Brokers",
    time: "3 days ago",
    read: true,
  },
];

const alertIcons: Record<string, any> = {
  milestone: TrendingUp,
  reminder: Bell,
  warning: AlertTriangle,
  success: Target,
  info: Bell,
};

const alertStyles: Record<string, string> = {
  milestone: "bg-profit/10 text-profit",
  reminder: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  success: "bg-profit/10 text-profit",
  info: "bg-chart-4/10 text-chart-4",
};

export default function Alerts() {
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <AppLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Alerts</h1>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-2">
            Stay informed about your trading activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-card">
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" className="bg-card text-muted-foreground">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </motion.div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const Icon = alertIcons[alert.type];
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={cn(
                "bg-card rounded-xl border shadow-card p-5 transition-all cursor-pointer hover:shadow-card-hover",
                alert.read ? "border-border" : "border-primary/30"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    alertStyles[alert.type]
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={cn("font-semibold", !alert.read && "text-foreground")}>
                        {alert.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                    </div>
                    {!alert.read && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {alerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-12 text-center"
        >
          <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold text-lg mb-2">No Alerts</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            You're all caught up! Alerts will appear here when there's activity.
          </p>
        </motion.div>
      )}
    </AppLayout>
  );
}
