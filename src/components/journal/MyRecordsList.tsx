import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PeriodRecord, usePeriodRecords } from "@/hooks/usePeriodRecords";
import { Button } from "@/components/ui/button";
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
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Trophy,
  XCircle,
  Image,
  FileText,
  Trash2,
  Eye,
  Clock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const periodTypeColors: Record<string, string> = {
  daily: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  weekly: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  monthly: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  yearly: "bg-chart-4/10 text-chart-4 border-chart-4/20",
};

export function MyRecordsList() {
  const { records, isLoading, deleteRecord } = usePeriodRecords();
  const [selectedRecord, setSelectedRecord] = useState<PeriodRecord | null>(null);

  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? "+" : "";
    return `${prefix}$${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Records Yet</h3>
        <p className="text-muted-foreground max-w-md">
          Save period records from the Progress Tracker on your dashboard to see them here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {records.map((record, index) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all overflow-hidden"
          >
            <div className="p-5">
              {/* Header Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      record.gross_pnl >= 0 ? "bg-profit/10" : "bg-loss/10"
                    )}
                  >
                    {record.gross_pnl >= 0 ? (
                      <TrendingUp className="w-6 h-6 text-profit" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-loss" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{record.period_label}</h3>
                      <Badge
                        variant="outline"
                        className={cn("text-xs capitalize", periodTypeColors[record.period_type])}
                      >
                        {record.period_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(record.period_start), "MMM d, yyyy")} -{" "}
                      {format(new Date(record.period_end), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={cn(
                      "text-xl font-bold",
                      record.gross_pnl >= 0 ? "text-profit" : "text-loss"
                    )}
                  >
                    {formatCurrency(record.gross_pnl)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {record.win_rate.toFixed(1)}% win rate
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-secondary/30 rounded-lg mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Trades</p>
                    <p className="font-medium">{record.total_trades}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-profit" />
                  <div>
                    <p className="text-xs text-muted-foreground">Winners</p>
                    <p className="font-medium text-profit">{record.winners}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-loss" />
                  <div>
                    <p className="text-xs text-muted-foreground">Losers</p>
                    <p className="font-medium text-loss">{record.losers}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Saved</p>
                    <p className="font-medium text-xs">
                      {format(new Date(record.created_at), "MMM d, HH:mm")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes Preview */}
              {record.notes && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                    Notes
                  </p>
                  <p className="text-sm line-clamp-2">{record.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {record.screenshots && record.screenshots.length > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <Image className="w-3.5 h-3.5" />
                      <span>{record.screenshots.length} screenshot(s)</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-loss hover:text-loss">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Record</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this record? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteRecord.mutate(record.id)}
                          className="bg-loss hover:bg-loss/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </motion.div>
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
