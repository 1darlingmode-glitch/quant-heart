import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Monitor } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function ConnectMT5Dialog() {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: apiKey, isLoading } = useQuery({
    queryKey: ["api-key", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_api_keys" as any)
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!user && open,
  });

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      // Generate a random API key
      const key = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
      const { error } = await supabase.from("user_api_keys" as any).insert({
        user_id: user.id,
        api_key: key,
        label: "MT5 Sync",
      } as any);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["api-key", user.id] });
      toast({ title: "API key generated successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const copy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    toast({ title: `${field} copied` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyBtn = ({ value, field }: { value: string; field: string }) => (
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => copy(value, field)}>
      {copiedField === field ? <Check className="w-3.5 h-3.5 text-profit" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
    </Button>
  );

  const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mt5-sync`;

  const fields = apiKey
    ? [
        { label: "API Endpoint", value: endpoint },
        { label: "API Key", value: apiKey.api_key },
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary/30 hover:border-primary/60">
          <Monitor className="w-4 h-4 mr-2" />
          Connect MT5
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>MT5 Sync</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : !apiKey ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate an API key to sync your MT5 trades using an Expert Advisor (EA).
            </p>
            <Button onClick={handleGenerate} disabled={generating} className="w-full gradient-primary shadow-glow">
              {generating ? "Generating..." : "Generate API Key"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              {fields.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-mono truncate">{value}</p>
                  </div>
                  <CopyBtn value={value} field={label} />
                </div>
              ))}
            </div>
            <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium">EA Setup Instructions:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Copy the EA script below into your MT5 Experts folder</li>
                <li>Paste your <strong>API Endpoint</strong> and <strong>API Key</strong> into the EA inputs</li>
                <li>Attach the EA to any chart — it will sync all closed trades automatically</li>
              </ol>
            </div>
            <details className="text-xs">
              <summary className="cursor-pointer text-primary font-medium">View MT5 Expert Advisor Code</summary>
              <pre className="mt-2 bg-muted/50 border border-border rounded-lg p-3 overflow-x-auto text-[11px] leading-relaxed whitespace-pre">
{`//+------------------------------------------------------------------+
//| PipTrace_Sync.mq5                                                |
//+------------------------------------------------------------------+
input string ApiEndpoint = "";  // Paste API Endpoint here
input string ApiKey = "";       // Paste API Key here
input int    SyncIntervalSec = 60;

datetime lastSync = 0;

int OnInit() {
   EventSetTimer(SyncIntervalSec);
   Print("PipTrace Sync EA initialized");
   return INIT_SUCCEEDED;
}

void OnTimer() { SyncTrades(); }

void SyncTrades() {
   HistorySelect(lastSync, TimeCurrent());
   int total = HistoryDealsTotal();
   if(total == 0) return;

   string json = "[";
   int count = 0;
   for(int i = 0; i < total; i++) {
      ulong ticket = HistoryDealGetTicket(i);
      if(HistoryDealGetInteger(ticket, DEAL_ENTRY) != DEAL_ENTRY_OUT) continue;
      
      if(count > 0) json += ",";
      json += "{";
      json += "\\"symbol\\":\\"" + HistoryDealGetString(ticket, DEAL_SYMBOL) + "\\",";
      json += "\\"type\\":" + IntegerToString((int)HistoryDealGetInteger(ticket, DEAL_TYPE)) + ",";
      json += "\\"volume\\":" + DoubleToString(HistoryDealGetDouble(ticket, DEAL_VOLUME), 2) + ",";
      json += "\\"entry_price\\":" + DoubleToString(HistoryDealGetDouble(ticket, DEAL_PRICE), 5) + ",";
      json += "\\"exit_price\\":" + DoubleToString(HistoryDealGetDouble(ticket, DEAL_PRICE), 5) + ",";
      json += "\\"profit\\":" + DoubleToString(HistoryDealGetDouble(ticket, DEAL_PROFIT), 2) + ",";
      json += "\\"open_time\\":\\"" + TimeToString(HistoryDealGetInteger(ticket, DEAL_TIME), TIME_DATE|TIME_SECONDS) + "\\",";
      json += "\\"close_time\\":\\"" + TimeToString(HistoryDealGetInteger(ticket, DEAL_TIME), TIME_DATE|TIME_SECONDS) + "\\",";
      json += "\\"magic\\":" + IntegerToString((int)HistoryDealGetInteger(ticket, DEAL_MAGIC)) + ",";
      json += "\\"comment\\":\\"" + HistoryDealGetString(ticket, DEAL_COMMENT) + "\\"";
      json += "}";
      count++;
   }
   json += "]";

   if(count == 0) return;

   string headers = "Content-Type: application/json\\r\\nx-api-key: " + ApiKey;
   char post[], result[];
   string resultHeaders;
   StringToCharArray(json, post, 0, WHOLE_ARRAY, CP_UTF8);

   int res = WebRequest("POST", ApiEndpoint, headers, 5000, post, result, resultHeaders);
   if(res == 200) {
      Print("PipTrace: Synced ", count, " trades");
      lastSync = TimeCurrent();
   } else {
      Print("PipTrace: Sync failed, code=", res);
   }
}

void OnDeinit(const int reason) { EventKillTimer(); }`}
              </pre>
            </details>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
