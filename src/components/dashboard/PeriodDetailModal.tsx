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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  DollarSign,
  Upload,
  Save,
  Loader2,
  StickyNote,
  Camera,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { usePeriodRecords } from "@/hooks/usePeriodRecords";

interface PeriodDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodLabel: string;
  periodStart: Date;
  periodEnd: Date;
  periodType: string;
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
  periodType,
  trades,
}: PeriodDetailModalProps) {
  const { user } = useAuth();
  const { saveRecord, uploadScreenshot, records } = usePeriodRecords();
  const [notes, setNotes] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notesOpen, setNotesOpen] = useState(false);
  const [screenshotsOpen, setScreenshotsOpen] = useState(false);

  // Load existing record if available
  useEffect(() => {
    if (isOpen) {
      const existingRecord = records.find(
        (r) =>
          r.period_start === periodStart.toISOString() &&
          r.period_end === periodEnd.toISOString()
      );
      if (existingRecord) {
        setNotes(existingRecord.notes || "");
        setScreenshots(existingRecord.screenshots || []);
      } else {
        setNotes("");
        setScreenshots([]);
      }
    }
  }, [isOpen, records, periodStart, periodEnd]);

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
        const url = await uploadScreenshot(file);
        setScreenshots((prev) => [...prev, url]);
      }
      toast.success("Screenshot uploaded!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload screenshot");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle save record
  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save records");
      return;
    }

    setIsSaving(true);
    try {
      await saveRecord.mutateAsync({
        period_type: periodType,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        period_label: periodLabel,
        notes,
        screenshots,
        total_trades: totalTrades,
        winners: winners.length,
        losers: losers.length,
        win_rate: winRate,
        gross_pnl: grossPnl,
        gross_profit: grossProfit,
        gross_loss: grossLoss,
      });
      setNotesOpen(false);
      setScreenshotsOpen(false);
      onClose();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between gap-4">
          <DialogTitle className="flex flex-col gap-1">
            <span className="text-lg">{periodLabel}</span>
            <span className="text-xs font-normal text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {format(currentTime, "EEE, MMM d • HH:mm:ss")}
            </span>
          </DialogTitle>
          <div className="flex items-center gap-1 mr-6">
            {/* Notes Popover */}
            <Popover open={notesOpen} onOpenChange={setNotesOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 relative",
                    notes && "text-primary"
                  )}
                >
                  <StickyNote className="h-4 w-4" />
                  {notes && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Notes</Label>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleFormat("bold")}
                      className="h-7 w-7 p-0"
                    >
                      <Bold className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleFormat("italic")}
                      className="h-7 w-7 p-0"
                    >
                      <Italic className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleFormat("list")}
                      className="h-7 w-7 p-0"
                    >
                      <List className="h-3 w-3" />
                    </Button>
                  </div>
                  <Textarea
                    id="period-notes"
                    placeholder="Add notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[80px] resize-none text-sm"
                  />
                </div>
              </PopoverContent>
            </Popover>

            {/* Screenshots Popover */}
            <Popover open={screenshotsOpen} onOpenChange={setScreenshotsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 relative",
                    screenshots.length > 0 && "text-primary"
                  )}
                >
                  <Camera className="h-4 w-4" />
                  {screenshots.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] bg-primary rounded-full text-[9px] text-primary-foreground flex items-center justify-center">
                      {screenshots.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="end">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Screenshots</Label>
                  <div className="flex flex-wrap gap-2">
                    {screenshots.map((url, index) => (
                      <div
                        key={index}
                        className="relative group w-16 h-16 rounded border border-border overflow-hidden"
                      >
                        <img src={url} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeScreenshot(index)}
                          className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                    <label className="w-16 h-16 rounded border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-0.5">Upload</span>
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
              </PopoverContent>
            </Popover>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-3">
          {/* P/L Chart - Single compact chart */}
          <div className="bg-secondary/30 rounded-lg p-3 border border-border">
            <h4 className="text-xs font-medium mb-2 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              Cumulative P/L
            </h4>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="trade"
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(v) => `$${v}`}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "11px",
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
                    dot={{ fill: "hsl(var(--primary))", r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[120px] flex items-center justify-center text-muted-foreground text-xs">
                No trades in this period
              </div>
            )}
          </div>

          {/* Stats Grid - Compact */}
          <div className="grid grid-cols-5 gap-2">
            <div className="bg-secondary/30 rounded-md p-2 border border-border text-center">
              <p className="text-[10px] text-muted-foreground">Trades</p>
              <p className="text-sm font-bold">{totalTrades}</p>
            </div>
            <div className="bg-profit/10 rounded-md p-2 border border-profit/20 text-center">
              <p className="text-[10px] text-muted-foreground">Winners</p>
              <p className="text-sm font-bold text-profit">{winners.length}</p>
            </div>
            <div className="bg-loss/10 rounded-md p-2 border border-loss/20 text-center">
              <p className="text-[10px] text-muted-foreground">Losers</p>
              <p className="text-sm font-bold text-loss">{losers.length}</p>
            </div>
            <div className="bg-secondary/30 rounded-md p-2 border border-border text-center">
              <p className="text-[10px] text-muted-foreground">Win Rate</p>
              <p className={cn("text-sm font-bold", winRate >= 50 ? "text-profit" : "text-loss")}>
                {winRate.toFixed(0)}%
              </p>
            </div>
            <div className={cn(
              "rounded-md p-2 border text-center",
              grossPnl >= 0 ? "bg-profit/10 border-profit/20" : "bg-loss/10 border-loss/20"
            )}>
              <p className="text-[10px] text-muted-foreground">P/L</p>
              <p className={cn("text-sm font-bold", grossPnl >= 0 ? "text-profit" : "text-loss")}>
                {formatCurrency(grossPnl)}
              </p>
            </div>
          </div>

          {/* Trades Table - Compact */}
          <div className="rounded-md border border-border overflow-hidden max-h-[180px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="text-[10px] py-1.5">Time</TableHead>
                  <TableHead className="text-[10px] py-1.5">Symbol</TableHead>
                  <TableHead className="text-[10px] py-1.5">Side</TableHead>
                  <TableHead className="text-[10px] py-1.5 text-right">P/L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periodTrades.length > 0 ? (
                  sortedTrades.map((trade) => (
                    <TableRow key={trade.id} className="hover:bg-secondary/30">
                      <TableCell className="text-[11px] py-1.5">
                        {format(new Date(trade.entry_date), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell className="text-[11px] py-1.5 font-medium">{trade.symbol}</TableCell>
                      <TableCell className="text-[11px] py-1.5">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-medium",
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
                          "text-[11px] py-1.5 text-right font-medium",
                          (trade.pnl || 0) >= 0 ? "text-profit" : "text-loss"
                        )}
                      >
                        {formatCurrency(trade.pnl || 0)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4 text-xs">
                      No trades in this period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="gradient-primary shadow-glow"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
