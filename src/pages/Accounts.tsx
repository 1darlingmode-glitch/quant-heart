import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Link, TrendingUp, DollarSign, Wallet, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useBrokerAccounts, BrokerAccount } from "@/hooks/useBrokerAccounts";
import { AddAccountDialog } from "@/components/accounts/AddAccountDialog";
import { ManageAccountDialog } from "@/components/accounts/ManageAccountDialog";
import { formatDistanceToNow } from "date-fns";

export default function Accounts() {
  const { accounts, isLoading, syncAccount, syncAllAccounts } = useBrokerAccounts();
  const [selectedAccount, setSelectedAccount] = useState<BrokerAccount | null>(null);
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);

  const totalBalance = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);
  const activeAccounts = accounts.filter((a) => a.status === "active");

  const handleSyncAccount = async (account: BrokerAccount) => {
    setSyncingAccountId(account.id);
    try {
      await syncAccount.mutateAsync(account);
    } finally {
      setSyncingAccountId(null);
    }
  };

  const handleSyncAll = async () => {
    await syncAllAccounts.mutateAsync();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary" className="bg-profit/10 text-profit">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Inactive</Badge>;
      case "disconnected":
        return <Badge variant="secondary" className="bg-loss/10 text-loss">Disconnected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return "Never synced";
    return `Last sync: ${formatDistanceToNow(new Date(lastSync), { addSuffix: true })}`;
  };

  return (
    <AppLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Trading Accounts</h1>
          <p className="text-muted-foreground">
            Manage your connected broker accounts
          </p>
        </div>
        <div className="flex gap-2">
          {accounts.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleSyncAll}
              disabled={syncAllAccounts.isPending || activeAccounts.length === 0}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", syncAllAccounts.isPending && "animate-spin")} />
              {syncAllAccounts.isPending ? "Syncing..." : "Sync All"}
            </Button>
          )}
          <AddAccountDialog />
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-5 shadow-card"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Total Balance</p>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <p className="text-2xl font-bold">${totalBalance.toLocaleString()}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl border border-border p-5 shadow-card"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-profit/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-profit" />
            </div>
            <p className="text-sm text-muted-foreground">Active Accounts</p>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-bold text-profit">{activeAccounts.length}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-5 shadow-card"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <Link className="w-5 h-5 text-chart-4" />
            </div>
            <p className="text-sm text-muted-foreground">Connected</p>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-2xl font-bold">{accounts.length} Account{accounts.length !== 1 ? "s" : ""}</p>
          )}
        </motion.div>
      </div>

      {/* Accounts List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border shadow-card p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </div>
          ))
        ) : accounts.length > 0 ? (
          accounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
              whileHover={{ scale: 1.005 }}
              className="bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{account.name}</h3>
                      {getStatusBadge(account.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {account.broker} • {formatLastSync(account.last_sync)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:gap-8">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-xl font-bold">${(account.balance || 0).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSyncAccount(account)}
                      disabled={syncingAccountId === account.id || account.status !== "active"}
                    >
                      <RefreshCw className={cn("w-4 h-4", syncingAccountId === account.id && "animate-spin")} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedAccount(account)}>
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : null}
      </div>

      {/* Empty State for Connect */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 bg-secondary/30 border-2 border-dashed border-border rounded-xl p-8 text-center"
      >
        <Link className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-semibold text-lg mb-2">
          {accounts.length === 0 ? "Connect Your First Account" : "Connect More Accounts"}
        </h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          {accounts.length === 0
            ? "Start by connecting your broker account to track all your trades in one place"
            : "Connect additional broker accounts to track all your trades in one place"}
        </p>
        <AddAccountDialog />
      </motion.div>

      {/* Manage Account Dialog */}
      {selectedAccount && (
        <ManageAccountDialog
          account={selectedAccount}
          open={!!selectedAccount}
          onOpenChange={(open) => !open && setSelectedAccount(null)}
        />
      )}
    </AppLayout>
  );
}
