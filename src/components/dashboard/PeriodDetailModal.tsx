import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Trade } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Bold,
  Italic,
  List,
  Image as ImageIcon,
  X,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PeriodDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodLabel: string;
  periodStart: Date;
  periodEnd: Date;
  trades: Trade[];
}

interface PeriodNote {
  id?: string;
  content: string;
  screenshots: string[];
}

export function PeriodDetailModal({
  isOpen,
  onClose,
  periodLabel,
  periodStart,
  periodEnd,
  trades,
}: PeriodDetailModalProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter trades for this period
  const periodTrades = trades.filter((t) => {
    if (!t.exit_date || t.status !== "closed") return false;
    const exitDate = new Date(t.exit_date);
    return exitDate >= periodStart && exitDate <= periodEnd;
  });

  // Calculate stats
  const winners = periodTrades.filter((t) => (t.pnl || 0) > 0);
  const losers = periodTrades.filter((t) => (t.pnl || 0) < 0);
  const totalTrades = periodTrades.length;
  const winRate = totalTrades > 0 ? (winners.length / totalTrades) * 100 : 0;
  const grossPnl = periodTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const grossProfit = winners.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const grossLoss = losers.reduce((sum, t) => sum + Math.abs(t.pnl || 0), 0);

  // Create cumulative P/L data for chart
  const sortedTrades = [...periodTrades].sort(
    (a, b) => new Date(a.exit_date!).getTime() - new Date(b.exit_date!).getTime()
  );

  let cumulative = 0;
  const chartData = sortedTrades.map((trade, index) => {
    cumulative += trade.pnl || 0;
    return {
      trade: index + 1,
      time: format(new Date(trade.exit_date!), "HH:mm"),
      pnl: trade.pnl || 0,
      cumulative,
      profit: (trade.pnl || 0) > 0 ? cumulative : null,
      loss: (trade.pnl || 0) < 0 ? cumulative : null,
    };
  });

  // Format currency
  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? "+" : "";
    return `${prefix}$${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  // Handle text formatting
  const handleFormat = (format: "bold" | "italic" | "list") => {
    const textarea = document.getElementById("period-notes") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end);

    let newText = notes;
    let cursorOffset = 0;

    switch (format) {
      case "bold":
        newText = notes.substring(0, start) + `**${selectedText}**` + notes.substring(end);
        cursorOffset = 2;
        break;
      case "italic":
        newText = notes.substring(0, start) + `*${selectedText}*` + notes.substring(end);
        cursorOffset = 1;
        break;
      case "list":
        newText = notes.substring(0, start) + `\n- ${selectedText}` + notes.substring(end);
        cursorOffset = 3;
        break;
    }

    setNotes(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, end + cursorOffset);
    }, 0);
  };

  // Handle screenshot upload
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        // For now, create a local URL - in production this would upload to Supabase storage
        const url = URL.createObjectURL(file);
        setScreenshots((prev) => [...prev, url]);
      }
      toast.success("Screenshot added!");
    } catch (error) {
      toast.error("Failed to upload screenshot");
    } finally {
      setIsUploading(false);
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-1">
            <span className="text-xl">{periodLabel}</span>
            <span className="text-sm font-normal text-muted-foreground flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              {format(currentTime, "EEEE, MMMM d, yyyy • HH:mm:ss")}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* P/L Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Cumulative P/L Chart */}
            <div className="bg-secondary/30 rounded-lg p-4 border border-border">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Cumulative P/L
              </h4>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="trade"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelFormatter={(label) => `Trade ${label}`}
                      formatter={(value: number) => [formatCurrency(value), "P/L"]}
                    />
                    <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                  No trades in this period
                </div>
              )}
            </div>

            {/* Individual Trade P/L Chart */}
            <div className="bg-secondary/30 rounded-lg p-4 border border-border">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Trade P/L
              </h4>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [formatCurrency(value), "P/L"]}
                    />
                    <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="pnl"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        const color = (payload.pnl || 0) >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))";
                        return <circle cx={cx} cy={cy} r={4} fill={color} />;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                  No trades in this period
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-secondary/30 rounded-lg p-3 border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Trades</p>
              <p className="text-lg font-bold">{totalTrades}</p>
            </div>
            <div className="bg-profit/10 rounded-lg p-3 border border-profit/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">Winners</p>
              <p className="text-lg font-bold text-profit">{winners.length}</p>
            </div>
            <div className="bg-loss/10 rounded-lg p-3 border border-loss/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">Losers</p>
              <p className="text-lg font-bold text-loss">{losers.length}</p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3 border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
              <p className={cn("text-lg font-bold", winRate >= 50 ? "text-profit" : "text-loss")}>
                {winRate.toFixed(1)}%
              </p>
            </div>
            <div className={cn(
              "rounded-lg p-3 border text-center",
              grossPnl >= 0 ? "bg-profit/10 border-profit/20" : "bg-loss/10 border-loss/20"
            )}>
              <p className="text-xs text-muted-foreground mb-1">Gross P/L</p>
              <p className={cn("text-lg font-bold", grossPnl >= 0 ? "text-profit" : "text-loss")}>
                {formatCurrency(grossPnl)}
              </p>
            </div>
          </div>

          {/* Trades Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="text-xs">Open Time</TableHead>
                  <TableHead className="text-xs">Instrument</TableHead>
                  <TableHead className="text-xs">Side</TableHead>
                  <TableHead className="text-xs text-right">Net P/L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periodTrades.length > 0 ? (
                  sortedTrades.map((trade) => (
                    <TableRow key={trade.id} className="hover:bg-secondary/30">
                      <TableCell className="text-xs">
                        {format(new Date(trade.entry_date), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell className="text-xs font-medium">{trade.symbol}</TableCell>
                      <TableCell className="text-xs">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            trade.trade_type === "long"
                              ? "bg-profit/20 text-profit"
                              : "bg-loss/20 text-loss"
                          )}
                        >
                          {trade.trade_type.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-xs text-right font-medium",
                          (trade.pnl || 0) >= 0 ? "text-profit" : "text-loss"
                        )}
                      >
                        {formatCurrency(trade.pnl || 0)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No trades in this period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Notes Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Notes</Label>
            <div className="flex gap-1 mb-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleFormat("bold")}
                className="h-8 w-8 p-0"
              >
                <Bold className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleFormat("italic")}
                className="h-8 w-8 p-0"
              >
                <Italic className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleFormat("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Textarea
              id="period-notes"
              placeholder="Add your notes for this trading period..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Screenshots Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Screenshots</Label>
            <div className="flex flex-wrap gap-3">
              {screenshots.map((url, index) => (
                <div
                  key={index}
                  className="relative group w-24 h-24 rounded-lg border border-border overflow-hidden"
                >
                  <img src={url} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeScreenshot(index)}
                    className="absolute top-1 right-1 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Upload</span>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleScreenshotUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-border">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
