import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import {
  Bell,
  TrendingUp,
  Target,
  AlertTriangle,
  Check,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAlerts } from "@/hooks/useAlerts";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

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
  const {
    alerts,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteAlert,
    clearAllAlerts,
  } = useAlerts();

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
          <Button
            variant="outline"
            className="bg-card"
            onClick={() => markAllAsRead()}
            disabled={unreadCount === 0}
          >
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button
            variant="outline"
            className="bg-card text-muted-foreground"
            onClick={() => clearAllAlerts()}
            disabled={alerts.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start gap-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alerts List */}
      {!isLoading && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const Icon = alertIcons[alert.type] || Bell;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + index * 0.03 }}
                className={cn(
                  "bg-card rounded-xl border shadow-sm p-5 transition-all cursor-pointer hover:shadow-md group",
                  alert.read ? "border-border" : "border-primary/30"
                )}
                onClick={() => {
                  if (!alert.read) markAsRead(alert.id);
                }}
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
                      <div className="flex items-center gap-2">
                        {!alert.read && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAlert(alert.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && alerts.length === 0 && (
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
