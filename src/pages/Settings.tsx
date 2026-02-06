import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  User,
  Bell,
  Palette,
  Shield,
  Link,
  CreditCard,
  Moon,
  Sun,
  ChevronRight,
  Database,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useResetTracking } from "@/hooks/useTrades";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const settingsSections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "integrations", label: "Integrations", icon: Link },
  { id: "data", label: "Data & Reset", icon: Database },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("profile");
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [isResetting, setIsResetting] = useState(false);
  const { resetAllData } = useResetTracking();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleResetTracking = async () => {
    setIsResetting(true);
    try {
      await resetAllData();
      toast.success("All tracking data has been reset successfully");
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error("Failed to reset tracking data");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-card rounded-xl border border-border shadow-card p-2">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left",
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          {activeSection === "profile" && (
            <div className="bg-card rounded-xl border border-border shadow-card p-6">
              <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
              
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
                <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  JD
                </div>
                <div>
                  <h3 className="font-semibold text-lg">John Doe</h3>
                  <p className="text-muted-foreground text-sm">Pro Trader</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Change Photo
                  </Button>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input defaultValue="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" defaultValue="john.doe@example.com" />
                </div>

                <div className="space-y-2">
                  <Label>Trading Experience</Label>
                  <Input defaultValue="5 years" />
                </div>

                <div className="space-y-2">
                  <Label>Preferred Markets</Label>
                  <Input defaultValue="Stocks, Forex, Futures" />
                </div>

                <Button className="w-fit gradient-primary">Save Changes</Button>
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="bg-card rounded-xl border border-border shadow-card p-6">
              <h2 className="text-xl font-semibold mb-6">Appearance</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    {isDark ? (
                      <Moon className="w-5 h-5 text-primary" />
                    ) : (
                      <Sun className="w-5 h-5 text-primary" />
                    )}
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Toggle between light and dark themes
                      </p>
                    </div>
                  </div>
                  <Switch checked={isDark} onCheckedChange={toggleTheme} />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium">Compact View</p>
                    <p className="text-sm text-muted-foreground">
                      Show more data in less space
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium">Show Animations</p>
                    <p className="text-sm text-muted-foreground">
                      Enable smooth transitions and effects
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="bg-card rounded-xl border border-border shadow-card p-6">
              <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium">Daily Journal Reminder</p>
                    <p className="text-sm text-muted-foreground">
                      Get reminded to journal at market close
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium">Performance Milestones</p>
                    <p className="text-sm text-muted-foreground">
                      Celebrate when you hit new highs
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium">Risk Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get alerted when drawdown exceeds limits
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium">Trade Sync Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Notify when new trades are imported
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          )}

          {activeSection === "integrations" && (
            <div className="bg-card rounded-xl border border-border shadow-card p-6">
              <h2 className="text-xl font-semibold mb-6">Broker Integrations</h2>

              <div className="space-y-4">
                {["Interactive Brokers", "TD Ameritrade", "MetaTrader 4", "Binance"].map((broker) => (
                  <div key={broker} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Link className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{broker}</p>
                        <p className="text-sm text-muted-foreground">Not connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "data" && (
            <div className="bg-card rounded-xl border border-border shadow-card p-6">
              <h2 className="text-xl font-semibold mb-6">Data Management</h2>

              <div className="space-y-6">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Database className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Real-Time Tracking</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your dashboard updates automatically in real-time when trades are added, modified, or deleted. 
                        All performance metrics are calculated from the moment you create your account.
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="w-2 h-2 rounded-full bg-profit animate-pulse" />
                        <span className="text-xs text-muted-foreground">Live sync enabled</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-loss/5 border border-loss/20 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-loss/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-loss" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-loss">Reset Tracking History</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This will permanently delete all your trades, journal entries, period records, trading rules, 
                        and alerts. This action cannot be undone.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="mt-4"
                            disabled={isResetting}
                          >
                            {isResetting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Resetting...
                              </>
                            ) : (
                              "Reset All Data"
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-loss" />
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete:
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>All your trades and trade history</li>
                                <li>All journal entries</li>
                                <li>All saved period records</li>
                                <li>All trading rules and evaluations</li>
                                <li>All alerts and notifications</li>
                              </ul>
                              <p className="mt-3 font-medium text-foreground">
                                This action cannot be undone.
                              </p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleResetTracking}
                              className="bg-loss hover:bg-loss/90"
                            >
                              Yes, Reset Everything
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeSection === "security" || activeSection === "billing") && (
            <div className="bg-card rounded-xl border border-border shadow-card p-6">
              <h2 className="text-xl font-semibold mb-6 capitalize">{activeSection}</h2>
              <p className="text-muted-foreground">
                Coming soon. This feature is under development.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
