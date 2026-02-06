import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import { format } from "date-fns";
import {
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Image,
  FileText,
  Trash2,
  Eye,
  BookOpen,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PeriodRecord, usePeriodRecords } from "@/hooks/usePeriodRecords";
import { useTrades, Trade } from "@/hooks/useTrades";

const periodTypeColors: Record<string, string> = {
  daily: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  weekly: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  monthly: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  yearly: "bg-chart-4/10 text-chart-4 border-chart-4/20",
};

interface MiniChartData {
  trade: number;
  pnl: number;
  cumulative: number;
}

function createChartData(periodTrades: Trade[]): MiniChartData[] {
  const sortedTrades = [...periodTrades].sort(
    (a, b) => new Date(a.exit_date!).getTime() - new Date(b.exit_date!).getTime()
  );

  let cumulative = 0;
  return sortedTrades.map((trade, index) => {
    cumulative += trade.pnl || 0;
    return {
      trade: index + 1,
      pnl: trade.pnl || 0,
      cumulative,
    };
  });
}

function MiniCumulativeChart({ data }: { data: MiniChartData[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[40px] flex items-center justify-center text-muted-foreground text-[10px]">
        No data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <XAxis dataKey="trade" hide />
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" strokeOpacity={0.3} />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function MiniPnLChart({ data }: { data: MiniChartData[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[40px] flex items-center justify-center text-muted-foreground text-[10px]">
        No data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <XAxis dataKey="trade" hide />
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" strokeOpacity={0.3} />
        <Line
          type="monotone"
          dataKey="pnl"
          stroke="hsl(var(--chart-1))"
          strokeWidth={1.5}
          dot={(props) => {
            const { cx, cy, payload } = props;
            const color = (payload.pnl || 0) >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))";
            return <circle cx={cx} cy={cy} r={2} fill={color} />;
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function JournalEntryCard({
  record,
  trades,
  onView,
  onDelete,
  index,
}: {
  record: PeriodRecord;
  trades: Trade[];
  onView: () => void;
  onDelete: () => void;
  index: number;
}) {
  const [showTrades, setShowTrades] = useState(false);

  // Filter trades for this period
  const periodTrades = trades.filter((t) => {
    if (!t.exit_date || t.status !== "closed") return false;
    const exitDate = new Date(t.exit_date);
    const periodStart = new Date(record.period_start);
    const periodEnd = new Date(record.period_end);
    return exitDate >= periodStart && exitDate <= periodEnd;
  });

  const chartData = createChartData(periodTrades);

  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? "+" : "";
    return `${prefix}$${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all overflow-hidden"
    >
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                record.gross_pnl >= 0 ? "bg-profit/10" : "bg-loss/10"
              )}
            >
              {record.gross_pnl >= 0 ? (
                <TrendingUp className="w-5 h-5 text-profit" />
              ) : (
                <TrendingDown className="w-5 h-5 text-loss" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">{record.period_label}</h3>
                <Badge
                  variant="outline"
                  className={cn("text-[10px] capitalize", periodTypeColors[record.period_type])}
                >
                  {record.period_type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(record.period_start), "MMM d")} - {format(new Date(record.period_end), "MMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p
              className={cn(
                "text-lg font-bold",
                record.gross_pnl >= 0 ? "text-profit" : "text-loss"
              )}
            >
              {formatCurrency(record.gross_pnl)}
            </p>
            <p className="text-xs text-muted-foreground">
              {record.win_rate.toFixed(1)}% win rate
            </p>
          </div>
        </div>

        {/* Compact Layout: Stats + Charts */}
        <div className="flex gap-3 mb-3">
          {/* Stats Grid - Left side */}
          <div className="flex-1 grid grid-cols-4 gap-2 p-2 bg-secondary/30 rounded-lg">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Trades</p>
              <p className="text-sm font-medium">{record.total_trades}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Winners</p>
              <p className="text-sm font-medium text-profit">{record.winners}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Losers</p>
              <p className="text-sm font-medium text-loss">{record.losers}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Saved</p>
              <p className="text-[10px] font-medium">
                {format(new Date(record.created_at), "MMM d")}
              </p>
            </div>
          </div>

          {/* Mini Charts - Right side, narrower */}
          <div className="w-[180px] flex gap-2">
            <div className="flex-1 bg-secondary/30 rounded-lg p-1.5 border border-border">
              <div className="flex items-center gap-1 mb-0.5">
                <TrendingUp className="h-2.5 w-2.5 text-primary" />
                <span className="text-[8px] font-medium text-muted-foreground">Cumulative</span>
              </div>
              <MiniCumulativeChart data={chartData} />
            </div>
            <div className="flex-1 bg-secondary/30 rounded-lg p-1.5 border border-border">
              <div className="flex items-center gap-1 mb-0.5">
                <DollarSign className="h-2.5 w-2.5 text-primary" />
                <span className="text-[8px] font-medium text-muted-foreground">P/L</span>
              </div>
              <MiniPnLChart data={chartData} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-muted-foreground">
            {record.screenshots && record.screenshots.length > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Image className="w-3 h-3" />
                <span>{record.screenshots.length}</span>
              </div>
            )}
            {record.notes && (
              <div className="flex items-center gap-1 text-xs">
                <FileText className="w-3 h-3" />
                <span>Notes</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTrades(!showTrades)}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {showTrades ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" />
                  Hide ({periodTrades.length})
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Trades ({periodTrades.length})
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onView} className="h-7 text-xs">
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 px-2 text-loss hover:text-loss">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Record</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this journal entry? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-loss hover:bg-loss/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Trades Table (Collapsible) */}
        {showTrades && (
          <div className="rounded-lg border border-border overflow-hidden mt-3">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="text-xs py-2">Time</TableHead>
                  <TableHead className="text-xs py-2">Symbol</TableHead>
                  <TableHead className="text-xs py-2">Side</TableHead>
                  <TableHead className="text-xs py-2 text-right">P/L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periodTrades.length > 0 ? (
                  [...periodTrades]
                    .sort((a, b) => new Date(a.exit_date!).getTime() - new Date(b.exit_date!).getTime())
                    .map((trade) => (
                      <TableRow key={trade.id} className="hover:bg-secondary/30">
                        <TableCell className="text-xs py-1.5">
                          {format(new Date(trade.entry_date), "MMM d, HH:mm")}
                        </TableCell>
                        <TableCell className="text-xs py-1.5 font-medium">{trade.symbol}</TableCell>
                        <TableCell className="text-xs py-1.5">
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
                            "text-xs py-1.5 text-right font-medium",
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
                      No trades found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function JournalEntryList({ searchQuery }: { searchQuery: string }) {
  const { records, isLoading, deleteRecord } = usePeriodRecords();
  const { trades } = useTrades();
  const [selectedRecord, setSelectedRecord] = useState<PeriodRecord | null>(null);

  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? "+" : "";
    return `${prefix}$${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  // Get trades for a period to enable symbol search
  const getTradesForPeriod = (record: PeriodRecord) => {
    return trades.filter((t) => {
      if (!t.exit_date || t.status !== "closed") return false;
      const exitDate = new Date(t.exit_date);
      const periodStart = new Date(record.period_start);
      const periodEnd = new Date(record.period_end);
      return exitDate >= periodStart && exitDate <= periodEnd;
    });
  };

  const filteredRecords = records.filter((record) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;

    // Search by period label
    if (record.period_label.toLowerCase().includes(query)) return true;

    // Search by period type (daily, weekly, monthly, yearly)
    if (record.period_type.toLowerCase().includes(query)) return true;

    // Search by notes
    if (record.notes && record.notes.toLowerCase().includes(query)) return true;

    // Search by trade symbols in this period
    const periodTrades = getTradesForPeriod(record);
    if (periodTrades.some((t) => t.symbol.toLowerCase().includes(query))) return true;

    // Search by market type
    if (periodTrades.some((t) => t.market.toLowerCase().includes(query))) return true;

    return false;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (filteredRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Journal Entries Yet</h3>
        <p className="text-muted-foreground max-w-md">
          Save period records from the Progress Tracker on your dashboard to see them here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {filteredRecords.map((record, index) => (
          <JournalEntryCard
            key={record.id}
            record={record}
            trades={trades}
            onView={() => setSelectedRecord(record)}
            onDelete={() => deleteRecord.mutate(record.id)}
            index={index}
          />
        ))}
      </div>

      {/* View Record Modal */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span>{selectedRecord.period_label}</span>
                  <Badge
                    variant="outline"
                    className={cn("text-xs capitalize", periodTypeColors[selectedRecord.period_type])}
                  >
                    {selectedRecord.period_type}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-secondary/30 rounded-lg p-3 border border-border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Total Trades</p>
                    <p className="text-lg font-bold">{selectedRecord.total_trades}</p>
                  </div>
                  <div className="bg-profit/10 rounded-lg p-3 border border-profit/20 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Winners</p>
                    <p className="text-lg font-bold text-profit">{selectedRecord.winners}</p>
                  </div>
                  <div className="bg-loss/10 rounded-lg p-3 border border-loss/20 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Losers</p>
                    <p className="text-lg font-bold text-loss">{selectedRecord.losers}</p>
                  </div>
                  <div
                    className={cn(
                      "rounded-lg p-3 border text-center",
                      selectedRecord.gross_pnl >= 0
                        ? "bg-profit/10 border-profit/20"
                        : "bg-loss/10 border-loss/20"
                    )}
                  >
                    <p className="text-xs text-muted-foreground mb-1">Gross P/L</p>
                    <p
                      className={cn(
                        "text-lg font-bold",
                        selectedRecord.gross_pnl >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {formatCurrency(selectedRecord.gross_pnl)}
                    </p>
                  </div>
                </div>

                {/* Win Rate */}
                <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Win Rate</span>
                    <span
                      className={cn(
                        "font-bold",
                        selectedRecord.win_rate >= 50 ? "text-profit" : "text-loss"
                      )}
                    >
                      {selectedRecord.win_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        selectedRecord.win_rate >= 50 ? "bg-profit" : "bg-loss"
                      )}
                      style={{ width: `${selectedRecord.win_rate}%` }}
                    />
                  </div>
                </div>

                {/* Notes */}
                {selectedRecord.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Notes</h4>
                    <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                      <p className="text-sm whitespace-pre-wrap">{selectedRecord.notes}</p>
                    </div>
                  </div>
                )}

                {/* Screenshots */}
                {selectedRecord.screenshots && selectedRecord.screenshots.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Screenshots</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedRecord.screenshots.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-colors"
                        >
                          <img
                            src={url}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-xs text-muted-foreground pt-4 border-t border-border">
                  <p>Created: {format(new Date(selectedRecord.created_at), "MMM d, yyyy 'at' HH:mm")}</p>
                  <p>Last updated: {format(new Date(selectedRecord.updated_at), "MMM d, yyyy 'at' HH:mm")}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Journal() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AppLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">Trade Journal</h1>
            <p className="text-muted-foreground">
              Your saved trading period records
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by period, type, notes, or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-card">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline" className="bg-card">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </motion.div>

      {/* Journal Entries */}
      <JournalEntryList searchQuery={searchQuery} />
    </AppLayout>
  );
}
