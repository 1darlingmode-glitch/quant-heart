import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Plus, Link, TrendingUp, DollarSign, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const accounts = [
  {
    id: 1,
    name: "Main Trading Account",
    broker: "Interactive Brokers",
    balance: 45250,
    pnl: 5120,
    pnlPercent: 12.8,
    status: "active",
    lastSync: "2 minutes ago",
  },
  {
    id: 2,
    name: "Forex Account",
    broker: "MetaTrader 4",
    balance: 12800,
    pnl: 1850,
    pnlPercent: 16.9,
    status: "active",
    lastSync: "5 minutes ago",
  },
  {
    id: 3,
    name: "Crypto Portfolio",
    broker: "Binance",
    balance: 8420,
    pnl: -650,
    pnlPercent: -7.2,
    status: "active",
    lastSync: "1 minute ago",
  },
];

export default function Accounts() {
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
  const totalPnl = accounts.reduce((acc, a) => acc + a.pnl, 0);

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
        <Button className="gradient-primary shadow-glow">
          <Plus className="w-4 h-4 mr-2" />
          Connect Account
        </Button>
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
          <p className="text-2xl font-bold">${totalBalance.toLocaleString()}</p>
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
            <p className="text-sm text-muted-foreground">Total P/L</p>
          </div>
          <p className={cn("text-2xl font-bold", totalPnl >= 0 ? "text-profit" : "text-loss")}>
            {totalPnl >= 0 ? "+" : ""}${Math.abs(totalPnl).toLocaleString()}
          </p>
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
          <p className="text-2xl font-bold">{accounts.length} Accounts</p>
        </motion.div>
      </div>

      {/* Accounts List */}
      <div className="space-y-4">
        {accounts.map((account, index) => (
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
                    <Badge variant="secondary" className="bg-profit/10 text-profit">
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {account.broker} • Last sync: {account.lastSync}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="text-xl font-bold">${account.balance.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">P/L</p>
                  <p className={cn("text-xl font-bold", account.pnl >= 0 ? "text-profit" : "text-loss")}>
                    {account.pnl >= 0 ? "+" : ""}${Math.abs(account.pnl).toLocaleString()}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State for Connect */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 bg-secondary/30 border-2 border-dashed border-border rounded-xl p-8 text-center"
      >
        <Link className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-semibold text-lg mb-2">Connect More Accounts</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Connect additional broker accounts to track all your trades in one place
        </p>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </motion.div>
    </AppLayout>
  );
}
