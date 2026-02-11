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

  const { data: credentials, isLoading } = useQuery({
    queryKey: ["s3-credentials", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_s3_credentials" as any)
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
      const { error } = await supabase.from("user_s3_credentials" as any).insert({
        user_id: user.id,
        access_key_id: "cdd96c509ac48a80d1845ec98d38affc",
        secret_access_key: "e4153cd409d6e9562d3856a42b12d14e3d4c2233d635981235a010a0c88e7bee",
        bucket_name: "mt5-trade-reports",
        endpoint_url: "https://4c38f8548f8ffdf1eb4d128f06c32893.r2.cloudflarestorage.com",
        region: "auto",
      } as any);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["s3-credentials", user.id] });
      toast({ title: "Credentials generated successfully" });
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

  const fields = credentials
    ? [
        { label: "Bucket", value: credentials.bucket_name },
        { label: "Access Key", value: credentials.access_key_id },
        { label: "Secret", value: credentials.secret_access_key },
        { label: "Endpoint", value: credentials.endpoint_url },
        { label: "Path", value: `/${user?.id}/` },
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>MT5 Sync</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : !credentials ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Generate credentials to sync your MT5 trades automatically.</p>
            <Button onClick={handleGenerate} disabled={generating} className="w-full gradient-primary shadow-glow">
              {generating ? "Generating..." : "Generate Credentials"}
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
            <p className="text-xs text-muted-foreground">
              In MT5: <strong>Tools → Options → Publisher → Enable FTP</strong> → Paste credentials above
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
