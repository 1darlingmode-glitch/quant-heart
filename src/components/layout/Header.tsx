import { Bell, Search, Sun, Moon, LogOut, TrendingUp, AlertTriangle, Target, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useAlerts } from "@/hooks/useAlerts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

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

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { alerts, unreadCount, markAsRead, markAllAsRead } = useAlerts();

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const recentAlerts = alerts.slice(0, 5);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search trades, symbols..."
          className="pl-10 bg-secondary/50 border-transparent focus:border-primary/30 focus:bg-card transition-all"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* Alerts Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-[10px] font-semibold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => markAllAsRead()}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {recentAlerts.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No notifications yet
                </div>
              ) : (
                recentAlerts.map((alert) => {
                  const Icon = alertIcons[alert.type] || Bell;
                  return (
                    <DropdownMenuItem
                      key={alert.id}
                      className={cn(
                        "flex items-start gap-3 p-3 cursor-pointer",
                        !alert.read && "bg-primary/5"
                      )}
                      onClick={() => {
                        if (!alert.read) markAsRead(alert.id);
                        navigate("/alerts");
                      }}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          alertStyles[alert.type]
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-sm font-medium truncate", !alert.read && "text-foreground")}>
                            {alert.title}
                          </p>
                          {!alert.read && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {alert.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  );
                })
              )}
            </div>
            {alerts.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="justify-center text-primary text-sm font-medium cursor-pointer"
                  onClick={() => navigate("/alerts")}
                >
                  View all notifications
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-8 w-px bg-border mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 px-2">
              <Avatar className="w-9 h-9 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {user?.email ? getInitials(user.email) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.email?.split("@")[0] || "User"}</p>
                <p className="text-xs text-muted-foreground">Trader</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
