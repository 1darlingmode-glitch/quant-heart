import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Monitor, Copy, Check, Server, Key, ArrowRight, Shield } from "lucide-react";
import { useBrokerAccounts } from "@/hooks/useBrokerAccounts";
import { toast } from "@/hooks/use-toast";

type Step = "form" | "credentials";

interface FTPCredentials {
  host: string;
  port: string;
  username: string;
  password: string;
  path: string;
}

export function ConnectMT5Dialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [accountName, setAccountName] = useState("");
  const [mt5Login, setMt5Login] = useState("");
  const [mt5Server, setMt5Server] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<FTPCredentials | null>(null);
  const { createAccount } = useBrokerAccounts();

  const generateCredentials = (): FTPCredentials => {
    const uid = crypto.randomUUID().slice(0, 8);
    return {
      host: "ftp.piptrace.app",
      port: "21",
      username: `mt5_${mt5Login}_${uid}`,
      password: crypto.randomUUID().replace(/-/g, "").slice(0, 24),
      path: `/trades/${uid}/`,
    };
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim() || !mt5Login.trim() || !mt5Server.trim()) return;

    const creds = generateCredentials();
    setCredentials(creds);

    await createAccount.mutateAsync({
      name: accountName.trim(),
      broker: "MetaTrader 5",
      balance: 0,
    });

    setStep("credentials");
  };

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    toast({ title: "Copied", description: `${field} copied to clipboard` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setStep("form");
      setAccountName("");
      setMt5Login("");
      setMt5Server("");
      setCredentials(null);
      setCopiedField(null);
    }
  };

  const CopyButton = ({ value, field }: { value: string; field: string }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 shrink-0"
      onClick={() => copyToClipboard(value, field)}
    >
      {copiedField === field ? (
        <Check className="w-3.5 h-3.5 text-profit" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
      )}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary/30 hover:border-primary/60">
          <Monitor className="w-4 h-4 mr-2" />
          Connect MT5
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            {step === "form" ? "Connect MetaTrader 5" : "FTP Credentials Generated"}
          </DialogTitle>
        </DialogHeader>

        {step === "form" ? (
          <form onSubmit={handleGenerate} className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Enter your MT5 account details to generate FTP credentials for automatic trade syncing.
            </p>

            <div className="space-y-2">
              <Label htmlFor="mt5-name">Account Name</Label>
              <Input
                id="mt5-name"
                placeholder="e.g., My MT5 Live Account"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="mt5-login">MT5 Login ID</Label>
                <Input
                  id="mt5-login"
                  placeholder="e.g., 12345678"
                  value={mt5Login}
                  onChange={(e) => setMt5Login(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mt5-server">MT5 Server</Label>
                <Input
                  id="mt5-server"
                  placeholder="e.g., ICMarkets-Live"
                  value={mt5Server}
                  onChange={(e) => setMt5Server(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2">
              <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                We never store your MT5 password. FTP syncing uses a separate set of credentials generated by PipTrace.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAccount.isPending} className="gradient-primary shadow-glow">
                {createAccount.isPending ? "Generating..." : "Generate FTP Credentials"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>
        ) : credentials ? (
          <div className="space-y-4 mt-2">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
              <p className="text-sm font-medium text-accent-foreground">
                ✅ Account "{accountName}" connected successfully
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              Copy these credentials into your MT5 terminal under <strong>Tools → Options → FTP</strong> to enable automatic trade syncing.
            </p>

            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              {[
                { icon: Server, label: "FTP Host", value: credentials.host, field: "Host" },
                { icon: Server, label: "Port", value: credentials.port, field: "Port" },
                { icon: Key, label: "Username", value: credentials.username, field: "Username" },
                { icon: Key, label: "Password", value: credentials.password, field: "Password" },
                { icon: Server, label: "Path", value: credentials.path, field: "Path" },
              ].map(({ icon: Icon, label, value, field }) => (
                <div key={field} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-mono font-medium truncate">{value}</p>
                    </div>
                  </div>
                  <CopyButton value={value} field={field} />
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">MT5 Setup Steps</p>
              <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Open MetaTrader 5 terminal</li>
                <li>Go to <strong>Tools → Options → FTP</strong> tab</li>
                <li>Enable <strong>"Enable FTP publishing"</strong></li>
                <li>Paste the credentials above into the matching fields</li>
                <li>Set report type to <strong>"Detailed report"</strong></li>
                <li>Click <strong>OK</strong> — trades will sync automatically</li>
              </ol>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => handleClose(false)} className="gradient-primary shadow-glow">
                Done
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
